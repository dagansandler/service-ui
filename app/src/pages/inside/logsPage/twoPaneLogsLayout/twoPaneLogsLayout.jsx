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
import { logItemsSelector, loadingSelector } from 'controllers/log';
import { parentItemSelector } from 'controllers/testItem';
import { StepsTreePane } from './stepsTreePane';
import { LogsViewerPane } from './logsViewerPane';
import styles from './twoPaneLogsLayout.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  logItems: logItemsSelector(state),
  loading: loadingSelector(state),
  parentItem: parentItemSelector(state),
}))
export class TwoPaneLogsLayout extends Component {
  static propTypes = {
    logItems: PropTypes.array,
    loading: PropTypes.bool,
    parentItem: PropTypes.object,
  };

  static defaultProps = {
    logItems: [],
    loading: false,
    parentItem: {},
  };

  state = {
    selectedStepId: null,
    leftPaneWidth: 400, // Default width for left pane
    isDragging: false,
  };

  handleStepSelect = (stepId) => {
    this.setState({ selectedStepId: String(stepId) });
  };

  handleJumpToTreeStep = (stepId) => {
    // First select the step
    this.handleStepSelect(stepId);

    // Then expand the tree to show it
    if (this.stepsTreePaneRef && this.stepsTreePaneRef.expandToShowStep) {
      this.stepsTreePaneRef.expandToShowStep(stepId);
    }
  };

  handlePaneResize = (newWidth) => {
    this.setState({ leftPaneWidth: Math.max(300, Math.min(800, newWidth)) });
  };

  handleMouseDown = (e) => {
    e.preventDefault();
    this.setState({ isDragging: true });
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  handleMouseMove = (e) => {
    if (!this.state.isDragging) return;

    const containerRect = this.containerRef.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    this.handlePaneResize(newWidth);
  };

  handleMouseUp = () => {
    this.setState({ isDragging: false });
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  componentWillUnmount() {
    // Clean up event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  render() {
    const { logItems, loading, parentItem } = this.props;
    const { selectedStepId, leftPaneWidth, isDragging } = this.state;

    return (
      <div
        className={cx('two-pane-layout')}
        ref={(ref) => { this.containerRef = ref; }}
      >
        <div
          className={cx('left-pane')}
          style={{ width: `${leftPaneWidth}px` }}
        >
          <StepsTreePane
            ref={(ref) => { this.stepsTreePaneRef = ref; }}
            logItems={logItems}
            selectedStepId={selectedStepId}
            onStepSelect={this.handleStepSelect}
            loading={loading}
            parentItem={parentItem}
          />
        </div>

        <div
          className={cx('resize-handle', { 'dragging': isDragging })}
          onMouseDown={this.handleMouseDown}
        />

        <div className={cx('right-pane')}>
          <LogsViewerPane
            selectedStepId={selectedStepId}
            logItems={logItems}
            loading={loading}
            onJumpToTreeStep={this.handleJumpToTreeStep}
          />
        </div>
      </div>
    );
  }
}
