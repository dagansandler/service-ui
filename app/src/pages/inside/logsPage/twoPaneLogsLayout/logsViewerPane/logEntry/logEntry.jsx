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
import { dateFormat } from 'common/utils/timeDateUtils';
import { AttachmentBlock } from 'pages/inside/logsPage/logsGrid/attachmentBlock';
import styles from './logEntry.scss';

const cx = classNames.bind(styles);

export class LogEntry extends Component {
  static propTypes = {
    log: PropTypes.object.isRequired,
    index: PropTypes.number,
    onJumpToTreeStep: PropTypes.func,
  };

  static defaultProps = {
    index: 0,
    onJumpToTreeStep: () => {},
  };

  getLevelClass = (level) => {
    if (!level) return '';
    return `level-${level.toLowerCase()}`;
  };

  formatLogMessage = (message) => {
    if (!message) return '';

    // Basic formatting for common log patterns
    // This could be enhanced with syntax highlighting
    return message;
  };

  isNestedTestStep = (log) => {
    // Check if this log entry is actually a nested test step
    return log.type || (log.hasContent !== undefined) || (log.startTime && log.endTime && !log.logTime);
  };

  getStatusClass = (status) => {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  };

  handleJumpToTree = (stepId) => {
    const { onJumpToTreeStep } = this.props;
    if (onJumpToTreeStep && stepId) {
      onJumpToTreeStep(stepId);
    }
  };

  renderNestedTestStep = (step) => {
    return (
      <div className={cx('nested-test-step')}>
        <div className={cx('step-header')}>
          <div className={cx('step-info')}>
            <span className={cx('step-name')}>
              {step.name || step.description || `Step ${step.id}`}
            </span>

            {step.status && (
              <span className={cx('step-status', this.getStatusClass(step.status))}>
                {step.status}
              </span>
            )}

            {step.type && (
              <span className={cx('step-type')}>
                {step.type}
              </span>
            )}
          </div>

          <div className={cx('step-meta')}>
            <button
              className={cx('jump-to-tree-btn')}
              onClick={() => this.handleJumpToTree(step.id)}
              title="Jump to this step in the tree view"
            >
              ⧉
            </button>

            {step.startTime && (
              <span className={cx('step-time')}>
                {dateFormat(step.startTime)}
              </span>
            )}

            {step.duration && (
              <span className={cx('step-duration')}>
                {step.duration}ms
              </span>
            )}
          </div>
        </div>

        {step.description && step.description !== step.name && (
          <div className={cx('step-description')}>
            {step.description}
          </div>
        )}
      </div>
    );
  };

  render() {
    const { log, index } = this.props;
    const hasAttachment = log.binaryContent;
    const isTestStep = this.isNestedTestStep(log);

    // If this is a nested test step, render it differently
    if (isTestStep) {
      return (
        <div className={cx('log-entry', 'test-step-entry')}>
          <div className={cx('entry-index')}>
            <span className={cx('log-index')}>#{index + 1}</span>
          </div>
          {this.renderNestedTestStep(log)}
        </div>
      );
    }

    // Regular log entry rendering
    return (
      <div className={cx('log-entry', this.getLevelClass(log.level))}>
        <div className={cx('log-header')}>
          <div className={cx('log-meta')}>
            <span className={cx('log-index')}>#{index + 1}</span>

            {log.level && (
              <span className={cx('log-level', this.getLevelClass(log.level))}>
                {log.level}
              </span>
            )}

            {log.time && (
              <span className={cx('log-time')}>
                {dateFormat(log.time)}
              </span>
            )}
          </div>

          {hasAttachment && (
            <div className={cx('attachment-indicator')}>
              📎
            </div>
          )}
        </div>

        <div className={cx('log-content')}>
          {log.message && (
            <div className={cx('log-message')}>
              <pre className={cx('message-text')}>
                {this.formatLogMessage(log.message)}
              </pre>
            </div>
          )}

          {hasAttachment && (
            <div className={cx('log-attachment')}>
              <AttachmentBlock
                binaryContent={log.binaryContent}
                logId={log.id}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}
