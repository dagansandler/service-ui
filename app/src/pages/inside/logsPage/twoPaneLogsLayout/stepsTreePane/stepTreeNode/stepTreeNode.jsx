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
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { formatDuration } from 'common/utils/timeDateUtils';
import styles from './stepTreeNode.scss';

const cx = classNames.bind(styles);

export class StepTreeNode extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    level: PropTypes.number,
    selectedStepId: PropTypes.string,
    expandedNodes: PropTypes.instanceOf(Set),
    onStepSelect: PropTypes.func.isRequired,
    onToggleNode: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    searchMatches: PropTypes.instanceOf(Set),
    nestedStepsData: PropTypes.object,
    countMatchesInBranch: PropTypes.func,
    showOnlyFailed: PropTypes.bool,
  };

  static defaultProps = {
    level: 0,
    selectedStepId: null,
    expandedNodes: new Set(),
    searchQuery: '',
    searchMatches: new Set(),
    nestedStepsData: {},
    countMatchesInBranch: () => 0,
    showOnlyFailed: false,
  };

  handleClick = () => {
    const { item, onStepSelect, onToggleNode } = this.props;
    onStepSelect(item.id);

    // Proactively check if this step has nested content (two-level lookahead)
    // This helps determine if triangle should be shown without waiting for manual expansion
    if (item.hasContent && !item.nestedContentFetched && !item.children?.length) {
      // Fetch nested content to determine if triangle should be shown
      // This will trigger two-level fetching in the parent component
      onToggleNode(item.id);
    }
  };

  handleToggle = (e) => {
    e.stopPropagation();
    const { item, onToggleNode } = this.props;
    onToggleNode(item.id);
  };

  getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED':
        return '✓';
      case 'FAILED':
        return '✗';
      case 'SKIPPED':
        return '⚠';
      case 'IN_PROGRESS':
        return '⏳';
      default:
        return '○';
    }
  };

  highlightText = (text, searchQuery) => {
    if (!searchQuery || !text) {
      return text;
    }

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return <mark key={index} className={cx('search-highlight')}>{part}</mark>;
      }
      return part;
    });
  };

  // Helper method to check if a node or its children have failed steps
  hasFailedStepsInBranch = (item, nestedStepsData) => {
    // Check if this item itself is failed
    if (item.status === 'FAILED') {
      return true;
    }

    // Check children
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        if (this.hasFailedStepsInBranch(child, nestedStepsData)) {
          return true;
        }
      }
    }

    // Check nested children
    const nestedData = nestedStepsData && nestedStepsData[item.id];
    if (nestedData && nestedData.content && Array.isArray(nestedData.content)) {
      for (const nestedChild of nestedData.content) {
        if (this.hasFailedStepsInBranch(nestedChild, nestedStepsData)) {
          return true;
        }
      }
    }

    return false;
  };

  render() {
    const { item, level, selectedStepId, expandedNodes, onStepSelect, onToggleNode, searchQuery, searchMatches, nestedStepsData, countMatchesInBranch, showOnlyFailed } = this.props;
    const isSelected = selectedStepId === String(item.id);
    const isExpanded = expandedNodes.has(item.id);
    // Show expand button if:
    // 1. Item has actual children already loaded, OR
    // 2. Item has content but we haven't fetched it yet (might have nested steps)
    // 3. Hide triangle if we've fetched and confirmed no children
    const hasActualChildren = item.children && item.children.length > 0;
    const hasUnfetchedContent = item.hasContent && !item.nestedContentFetched;
    const hasChildren = hasActualChildren || hasUnfetchedContent;
    const indentLevel = level * 20;
    const isRoot = item.isRoot;

    // Search highlighting and dimming
    const isSearchActive = searchQuery && searchQuery.trim().length > 0;
    const isMatch = searchMatches.has(item.id);

    // Count matches in this branch (including children)
    let branchMatchCount = 0;
    if (isSearchActive && hasChildren) {
      if (hasActualChildren) {
        branchMatchCount = countMatchesInBranch(item.children, searchMatches, nestedStepsData);
      }
      const nestedData = nestedStepsData[item.id];
      if (nestedData && nestedData.content) {
        branchMatchCount += countMatchesInBranch(nestedData.content, searchMatches, nestedStepsData);
      }
    }

    // Show match indicator if there are matches in collapsed children
    const showMatchIndicator = isSearchActive && !isExpanded && branchMatchCount > 0;

    // Dim only if search is active, this item doesn't match, and it has no matching children
    const isDimmed = isSearchActive && !isMatch && branchMatchCount === 0;

    // Check if this node should be visible when "show only failed" is active
    const shouldShowWhenFailedFilter = !showOnlyFailed || this.hasFailedStepsInBranch(item, nestedStepsData);

    // Hide the entire node if failed filter is active and this branch has no failed steps
    if (!shouldShowWhenFailedFilter) {
      return null;
    }

    return (
      <div className={cx('step-tree-node')}>
        <div
          className={cx('node-content', {
            selected: isSelected,
            root: isRoot,
            dimmed: isDimmed,
            [`status-${item.status?.toLowerCase()}`]: item.status,
          })}
          style={{ paddingLeft: `${indentLevel + 12}px` }}
          onClick={this.handleClick}
          data-step-id={item.id}
        >
          {hasChildren && (
            <button
              className={cx('expand-button', { expanded: isExpanded })}
              onClick={this.handleToggle}
              type="button"
            >
              ▶
            </button>
          )}
          
          <div className={cx('status-icon')}>
            <TestItemStatus status={item.status} />
          </div>
          
          <div className={cx('node-info')}>
            <div className={cx('node-name')} title={item.message || item.name}>
              {isRoot
                ? this.highlightText(item.name || 'Test Execution', searchQuery)
                : this.highlightText(item.message || item.name || `Step ${item.id}`, searchQuery)
              }
              {showMatchIndicator && (
                <span className={cx('match-indicator')} title={`${branchMatchCount} match${branchMatchCount !== 1 ? 'es' : ''} in children`}>
                  ({branchMatchCount})
                </span>
              )}
            </div>

            <div className={cx('node-meta')}>
              {item.startTime && item.endTime && (
                <span className={cx('duration')}>
                  {formatDuration(item.endTime - item.startTime)}
                </span>
              )}

              {item.level && (
                <span className={cx('log-level', `level-${item.level.toLowerCase()}`)}>
                  {item.level}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className={cx('children')}>
            {item.children.map(child => (
              <StepTreeNode
                key={child.id}
                item={child}
                level={level + 1}
                selectedStepId={selectedStepId}
                expandedNodes={expandedNodes}
                onStepSelect={onStepSelect}
                onToggleNode={onToggleNode}
                searchQuery={searchQuery}
                searchMatches={searchMatches}
                nestedStepsData={nestedStepsData}
                countMatchesInBranch={countMatchesInBranch}
                showOnlyFailed={showOnlyFailed}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}
