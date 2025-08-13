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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import { nestedStepSelector, requestNestedStepAction } from 'controllers/log/nestedSteps';
import { LogsViewerToolbar, shouldShowLogLevel } from './logsViewerToolbar';
import { LogEntry } from './logEntry';
import styles from './logsViewerPane.scss';

const cx = classNames.bind(styles);

@connect(
  (state, ownProps) => ({
    nestedStepData: ownProps.selectedStepId ? nestedStepSelector(state, ownProps.selectedStepId) : {},
  }),
  {
    requestNestedStep: requestNestedStepAction,
  },
)
export class LogsViewerPane extends Component {
  static propTypes = {
    selectedStepId: PropTypes.string,
    logItems: PropTypes.array,
    loading: PropTypes.bool,
    nestedStepData: PropTypes.object,
    requestNestedStep: PropTypes.func,
    onJumpToTreeStep: PropTypes.func,
  };

  static defaultProps = {
    selectedStepId: null,
    logItems: [],
    loading: false,
    nestedStepData: {},
    requestNestedStep: () => {},
    onJumpToTreeStep: () => {},
  };

  state = {
    logLevelFilter: 'TRACE', // Default to show all logs
    searchQuery: '',
  };

  componentDidUpdate(prevProps) {
    const { selectedStepId, requestNestedStep } = this.props;

    // If a new step is selected, fetch its logs
    if (selectedStepId && selectedStepId !== prevProps.selectedStepId) {
      requestNestedStep({ id: selectedStepId });
    }
  }

  handleLogLevelFilter = (level) => {
    this.setState({ logLevelFilter: level });
  };

  handleSearch = (event) => {
    const query = event.target.value;
    this.setState({ searchQuery: query });
  };

  getSelectedStepLogs = () => {
    const { selectedStepId, nestedStepData } = this.props;

    if (!selectedStepId || !nestedStepData) {
      return [];
    }

    // Get logs from the nested step data
    return nestedStepData.content || [];
  };

  filterLogs = (logs) => {
    const { logLevelFilter, searchQuery } = this.state;

    return logs.filter(log => {
      // Always show steps regardless of log level filter
      if (log.hasContent) {
        return true;
      }

      // Level filter - use minimum level logic (show this level and above)
      if (logLevelFilter && !shouldShowLogLevel(log.level, logLevelFilter)) {
        return false;
      }

      // Search filter
      if (searchQuery && !log.message?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  getSelectedStepInfo = () => {
    const { selectedStepId, logItems } = this.props;
    
    if (!selectedStepId) {
      return null;
    }
    
    const findStep = (items) => {
      for (const item of items) {
        if (item.id === parseInt(selectedStepId, 10)) {
          return item;
        }
        if (item.children) {
          const childStep = findStep(item.children);
          if (childStep) {
            return childStep;
          }
        }
      }
      return null;
    };
    
    return findStep(logItems);
  };

  render() {
    const { selectedStepId, loading, nestedStepData, onJumpToTreeStep } = this.props;
    const { logLevelFilter, searchQuery } = this.state;

    const selectedStep = this.getSelectedStepInfo();
    const stepLogs = this.getSelectedStepLogs();
    const filteredLogs = this.filterLogs(stepLogs);

    return (
      <div className={cx('logs-viewer-pane')}>
        <LogsViewerToolbar
          selectedStep={selectedStep}
          logLevelFilter={logLevelFilter}
          onLogLevelFilter={this.handleLogLevelFilter}
          searchQuery={searchQuery}
          onSearch={this.handleSearch}
          logCount={filteredLogs.length}
          totalLogCount={stepLogs.length}
        />
        
        <div className={cx('logs-content')}>
          {loading || (selectedStepId && nestedStepData.loading) ? (
            <div className={cx('loading-container')}>
              <SpinningPreloader />
            </div>
          ) : !selectedStepId ? (
            <div className={cx('no-selection')}>
              <NoItemMessage message="Select a test step from the left panel to view its logs" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className={cx('no-logs')}>
              <NoItemMessage 
                message={stepLogs.length === 0 ? "No logs found for this step" : "No logs match your filter criteria"} 
              />
            </div>
          ) : (
            <div className={cx('logs-list')}>
              {filteredLogs.map((log, index) => (
                <LogEntry
                  key={log.id || index}
                  log={log}
                  index={index}
                  onJumpToTreeStep={onJumpToTreeStep}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
