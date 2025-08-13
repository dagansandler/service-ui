/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputSearch } from 'components/inputs/inputSearch';
import { InputSlider } from 'components/inputs/inputSlider';
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { formatDuration } from 'common/utils/timeDateUtils';
import styles from './logsViewerToolbar.scss';

const cx = classNames.bind(styles);

// Log levels in hierarchical order (most restrictive to least restrictive)
// Note: FATAL is highest priority, then ERROR, WARN, INFO, DEBUG, TRACE
const LOG_LEVEL_OPTIONS = [
  { id: 'ERROR', label: 'Error' },
  { id: 'WARN', label: 'Warn' },
  { id: 'INFO', label: 'Info' },
  { id: 'DEBUG', label: 'Debug' },
  { id: 'TRACE', label: 'All' },
];

// Log level hierarchy for filtering (higher number = higher priority)
const LOG_LEVEL_HIERARCHY = {
  'TRACE': 0,
  'DEBUG': 1,
  'INFO': 2,
  'WARN': 3,
  'ERROR': 4,
  'FATAL': 5,
};

// Export helper function for use in other components
export const shouldShowLogLevel = (logLevel, minimumLevel) => {
  if (!minimumLevel || minimumLevel === 'TRACE') {
    return true; // Show all logs
  }

  const logPriority = LOG_LEVEL_HIERARCHY[logLevel] || 0;
  const minPriority = LOG_LEVEL_HIERARCHY[minimumLevel] || 0;

  return logPriority >= minPriority;
};

export class LogsViewerToolbar extends Component {
  static propTypes = {
    selectedStep: PropTypes.object,
    logLevelFilter: PropTypes.string,
    onLogLevelFilter: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    logCount: PropTypes.number,
    totalLogCount: PropTypes.number,
  };

  static defaultProps = {
    selectedStep: null,
    logLevelFilter: 'TRACE', // Default to show all logs
    searchQuery: '',
    logCount: 0,
    totalLogCount: 0,
  };

  // Convert log level string to slider option object
  getLogLevelOption = (level) => {
    if (!level || level === '') {
      return LOG_LEVEL_OPTIONS[LOG_LEVEL_OPTIONS.length - 1]; // Default to 'All' (TRACE)
    }
    return LOG_LEVEL_OPTIONS.find(option => option.id === level) || LOG_LEVEL_OPTIONS[LOG_LEVEL_OPTIONS.length - 1];
  };

  // Handle slider change - convert option object to level string
  handleLogLevelChange = (option) => {
    this.props.onLogLevelFilter(option.id);
  };



  render() {
    const {
      selectedStep,
      logLevelFilter,
      onLogLevelFilter,
      searchQuery,
      onSearch,
      logCount,
      totalLogCount,
    } = this.props;

    return (
      <div className={cx('logs-viewer-toolbar')}>
        <div className={cx('toolbar-header')}>
          <h3 className={cx('title')}>Step Logs</h3>
          <div className={cx('log-count')}>
            {logCount !== totalLogCount ? (
              <span>{logCount} of {totalLogCount} logs</span>
            ) : (
              <span>({totalLogCount} logs)</span>
            )}
          </div>
        </div>

        {selectedStep && (
          <div className={cx('step-info')}>
            <div className={cx('step-header')}>
              <TestItemStatus status={selectedStep.status} />
              <span className={cx('step-name')} title={selectedStep.message || selectedStep.name}>
                {selectedStep.message || selectedStep.name || `Step ${selectedStep.id}`}
              </span>
            </div>
            
            <div className={cx('step-meta')}>
              {selectedStep.startTime && selectedStep.endTime && (
                <span className={cx('duration')}>
                  Duration: {formatDuration(selectedStep.endTime - selectedStep.startTime)}
                </span>
              )}
              
              {selectedStep.level && (
                <span className={cx('log-level', `level-${selectedStep.level.toLowerCase()}`)}>
                  {selectedStep.level}
                </span>
              )}
            </div>
          </div>
        )}

        <div className={cx('filters-section')}>
          <div className={cx('filter-row')}>
            <div className={cx('search-filter')}>
              <InputSearch
                value={searchQuery}
                onChange={onSearch}
                placeholder="Search in logs..."
                maxLength={256}
              />
            </div>
            
            <div className={cx('level-filter')}>
              <div className={cx('level-filter-label')}>Minimum Level:</div>
              <InputSlider
                value={this.getLogLevelOption(logLevelFilter)}
                options={LOG_LEVEL_OPTIONS}
                onChange={this.handleLogLevelChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
