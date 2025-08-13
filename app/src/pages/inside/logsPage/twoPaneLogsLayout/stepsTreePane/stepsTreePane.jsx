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
import { requestNestedStepAction, nestedStepsSelector } from 'controllers/log/nestedSteps';
import { StepTreeNode } from './stepTreeNode';
import { StepsTreeToolbar } from './stepsTreeToolbar';
import styles from './stepsTreePane.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    nestedStepsData: nestedStepsSelector(state),
  }),
  {
    requestNestedStep: requestNestedStepAction,
  },
  null,
  { forwardRef: true }
)
export class StepsTreePane extends Component {
  static propTypes = {
    logItems: PropTypes.array,
    selectedStepId: PropTypes.string,
    onStepSelect: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    parentItem: PropTypes.object,
    requestNestedStep: PropTypes.func,
    nestedStepsData: PropTypes.object,
  };

  static defaultProps = {
    logItems: [],
    selectedStepId: null,
    loading: false,
    parentItem: {},
    requestNestedStep: () => {},
    nestedStepsData: {},
  };

  state = {
    searchQuery: '',
    expandedNodes: new Set(),
    showOnlyFailed: false,
    searchMatches: new Set(), // IDs of steps that match search
    searchLoading: false, // Whether auto-loading is in progress
    searchStats: { loaded: 0, autoLoaded: 0, total: 0 }, // Search statistics
    autoExpandInitialized: false, // Track if auto-expansion has been done
  };

  componentDidMount() {
    this.performAutoExpansion();
  }

  componentDidUpdate(prevProps) {
    // If logItems or parentItem changed, perform auto-expansion
    if (
      (prevProps.logItems !== this.props.logItems ||
       prevProps.parentItem !== this.props.parentItem) &&
      !this.state.autoExpandInitialized
    ) {
      this.performAutoExpansion();
    }
  }

  performAutoExpansion = () => {
    const { parentItem, logItems, requestNestedStep, onStepSelect } = this.props;

    if (!parentItem || !parentItem.id || this.state.autoExpandInitialized) {
      return;
    }

    const expandedNodes = new Set();

    // Auto-expand the root item (parentItem)
    expandedNodes.add(parentItem.id);
    requestNestedStep({ id: parentItem.id });

    // Auto-select the root item
    if (onStepSelect) {
      onStepSelect(parentItem.id);
    }

    // Auto-expand direct children that have content
    if (logItems && logItems.length > 0) {
      logItems.forEach(item => {
        if (item.hasContent) {
          expandedNodes.add(item.id);
          requestNestedStep({ id: item.id });
        }
      });
    }

    this.setState({
      expandedNodes,
      autoExpandInitialized: true
    });
  };

  handleSearch = (event) => {
    const query = event.target.value;
    this.setState({
      searchQuery: query,
      searchLoading: query.length > 0,
    });

    // Debounce the search to avoid excessive API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.performProgressiveSearch(query);
    }, 300);
  };

  handleToggleNode = (nodeId) => {
    const { expandedNodes } = this.state;
    const { requestNestedStep } = this.props;
    const newExpanded = new Set(expandedNodes);

    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
      // When expanding a node, fetch its nested steps if it has content
      requestNestedStep({ id: nodeId });

      // Schedule two-level lookahead after the first level is fetched
      setTimeout(() => {
        this.performTwoLevelLookahead(nodeId);
      }, 500); // Small delay to allow first level to be processed
    }

    this.setState({ expandedNodes: newExpanded });
  };

  performTwoLevelLookahead = (parentNodeId) => {
    const { nestedStepsData } = this.props;
    const parentNestedData = nestedStepsData[parentNodeId];

    if (parentNestedData && parentNestedData.content) {
      // Filter to get only test items from level 1
      const nestedTestItems = parentNestedData.content.filter(item => {
        const isTestItem = item.type || item.hasContent !== undefined || (item.startTime && item.endTime);
        const isLogEntry = item.level || item.logTime;
        return isTestItem && !isLogEntry;
      });

      // For each child that has content, fetch its children (level 2)
      nestedTestItems.forEach(childItem => {
        if (childItem.hasContent && !nestedStepsData[childItem.id]) {
          this.props.requestNestedStep({ id: childItem.id });
        }
      });
    }
  };

  performProgressiveSearch = (query) => {
    if (!query.trim()) {
      // Clear search
      this.setState({
        searchMatches: new Set(),
        searchLoading: false,
        searchStats: { loaded: 0, autoLoaded: 0, total: 0 },
      });
      return;
    }

    // Phase 1: Search loaded steps immediately
    const { logItems, nestedStepsData } = this.props;
    const matches = new Set();
    const stats = { loaded: 0, autoLoaded: 0, total: 0 };

    this.searchInItems(logItems, query, matches, stats, nestedStepsData);

    // Update state with immediate results
    this.setState({
      searchMatches: matches,
      searchStats: stats,
    });

    // Phase 2: Auto-expand paths to matches and load children
    this.autoExpandAndLoadForSearch(query, matches);
  };

  searchInItems = (items, query, matches, stats, nestedStepsData, isAutoLoaded = false) => {
    if (!items || !Array.isArray(items) || !query || !matches || !stats) return;

    items.forEach(item => {
      if (!item || !item.id) return;

      // Only search test items, not log entries
      const isTestItem = item.type || item.hasContent !== undefined || (item.startTime && item.endTime);
      const isLogEntry = item.level || item.logTime;

      if (isTestItem && !isLogEntry) {
        if (item.name && item.name.toLowerCase().includes(query.toLowerCase())) {
          matches.add(item.id);
          if (isAutoLoaded) {
            stats.autoLoaded++;
          } else {
            stats.loaded++;
          }
        }
        stats.total++;

        // Search in nested children if they exist
        const nestedData = nestedStepsData && nestedStepsData[item.id];
        if (nestedData && nestedData.content && Array.isArray(nestedData.content)) {
          this.searchInItems(nestedData.content, query, matches, stats, nestedStepsData, isAutoLoaded);
        }
      }
    });
  };

  autoExpandAndLoadForSearch = async (query, currentMatches) => {
    const { requestNestedStep, nestedStepsData } = this.props;
    const { expandedNodes } = this.state;
    const newExpandedNodes = new Set(expandedNodes);
    const loadPromises = [];

    // Auto-expand paths to matches
    currentMatches.forEach(matchId => {
      if (!matchId) return;

      const path = this.findStepPath(this.props.logItems, matchId, nestedStepsData);
      if (path && Array.isArray(path) && path.length > 0) {
        // Expand all parent nodes in the path (but not the match itself)
        path.slice(0, -1).forEach(stepId => {
          if (stepId) {
            newExpandedNodes.add(stepId);
          }
        });
      }
    });

    // Load children of matching steps and expanded nodes
    const itemsToLoad = new Set();

    // Add children of matches
    currentMatches.forEach(matchId => {
      const item = this.findItemById(this.props.logItems, matchId, nestedStepsData);
      if (item && item.hasContent && !nestedStepsData[matchId]) {
        itemsToLoad.add(matchId);
      }
    });

    // Add children of expanded nodes
    newExpandedNodes.forEach(nodeId => {
      const item = this.findItemById(this.props.logItems, nodeId, nestedStepsData);
      if (item && item.hasContent && !nestedStepsData[nodeId]) {
        itemsToLoad.add(nodeId);
      }
    });

    // Update expanded nodes
    this.setState({ expandedNodes: newExpandedNodes });

    // Load items in batches
    if (itemsToLoad.size > 0) {
      const loadArray = Array.from(itemsToLoad).slice(0, 20); // Limit to 20 items

      loadArray.forEach(itemId => {
        const promise = new Promise((resolve) => {
          requestNestedStep({ id: itemId });
          // Wait a bit for the data to load, then search again
          setTimeout(() => {
            const updatedMatches = new Set(this.state.searchMatches);
            const updatedStats = { ...this.state.searchStats };

            const nestedData = this.props.nestedStepsData[itemId];
            if (nestedData && nestedData.content) {
              this.searchInItems(nestedData.content, query, updatedMatches, updatedStats, this.props.nestedStepsData, true);
            }

            this.setState({
              searchMatches: updatedMatches,
              searchStats: updatedStats,
            });
            resolve();
          }, 500);
        });
        loadPromises.push(promise);
      });

      // Wait for all loads to complete
      Promise.all(loadPromises).then(() => {
        this.setState({ searchLoading: false });
      });
    } else {
      this.setState({ searchLoading: false });
    }
  };

  findItemById = (items, targetId, nestedStepsData) => {
    if (!items) return null;

    for (const item of items) {
      if (item.id === targetId) {
        return item;
      }

      // Search in nested children
      const nestedData = nestedStepsData[item.id];
      if (nestedData && nestedData.content) {
        const found = this.findItemById(nestedData.content, targetId, nestedStepsData);
        if (found) return found;
      }
    }
    return null;
  };

  findStepPath = (items, targetId, nestedStepsData, currentPath = []) => {
    if (!items || !Array.isArray(items)) return [];

    // Ensure currentPath is always an array
    const safePath = Array.isArray(currentPath) ? currentPath : [];

    for (const item of items) {
      if (!item || !item.id) continue;

      const newPath = [...safePath, item.id];

      if (item.id === targetId) {
        return newPath;
      }

      // Search in nested children
      const nestedData = nestedStepsData && nestedStepsData[item.id];
      if (nestedData && nestedData.content && Array.isArray(nestedData.content)) {
        const found = this.findStepPath(nestedData.content, targetId, nestedStepsData, newPath);
        if (found && found.length > 0) return found;
      }
    }
    return [];
  };

  countMatchesInBranch = (items, searchMatches, nestedStepsData) => {
    if (!items || !Array.isArray(items) || !searchMatches) return 0;

    let count = 0;
    items.forEach(item => {
      if (!item || !item.id) return;

      if (searchMatches.has(item.id)) {
        count++;
      }

      // Count matches in nested children
      const nestedData = nestedStepsData && nestedStepsData[item.id];
      if (nestedData && nestedData.content && Array.isArray(nestedData.content)) {
        count += this.countMatchesInBranch(nestedData.content, searchMatches, nestedStepsData);
      }
    });

    return count;
  };

  handleToggleFailedOnly = () => {
    this.setState({ showOnlyFailed: !this.state.showOnlyFailed });
  };

  // Method to expand tree to show a specific step
  expandToShowStep = (targetStepId) => {
    const { logItems, requestNestedStep, selectedStepId } = this.props;

    // First, try to find the step in the current tree
    const path = this.findStepPathLegacy(logItems, targetStepId);

    if (path && path.length > 0) {
      // Found the step - expand all parent nodes in the path
      this.expandPathAndScroll(path, targetStepId, requestNestedStep);
    } else {
      // Step not found in current tree - need to expand the selected parent first
      if (selectedStepId) {
        this.expandParentAndRetry(selectedStepId, targetStepId);
      }
    }
  };

  expandPathAndScroll = (path, targetStepId, requestNestedStep) => {
    const newExpandedNodes = new Set(this.state.expandedNodes);

    // Expand all parent nodes in the path
    path.forEach(stepId => {
      newExpandedNodes.add(stepId);
      // Request nested content for each parent to ensure children are loaded
      requestNestedStep({ id: stepId });
    });

    this.setState({ expandedNodes: newExpandedNodes });

    // Scroll to the target step after delay to allow fetching and expansion
    setTimeout(() => {
      const stepElement = document.querySelector(`[data-step-id="${targetStepId}"]`);
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1000);
  };

  expandParentAndRetry = (parentStepId, targetStepId) => {
    const parentId = parseInt(parentStepId, 10);

    // Use the existing toggle method to expand the parent
    // This ensures proper state management and API calls
    if (!this.state.expandedNodes.has(parentId)) {
      this.handleToggleNode(parentId);

      // After a delay, try to find and navigate to the target step again
      // Only retry once to avoid infinite loops
      setTimeout(() => {
        const { logItems } = this.props;
        const path = this.findStepPathLegacy(logItems, targetStepId);
        if (path && path.length > 0) {
          this.expandPathAndScroll(path, targetStepId, this.props.requestNestedStep);
        }
      }, 1500); // Delay to ensure API call completes
    }
  };



  // Helper method to find the path to a specific step (legacy version for tree navigation)
  findStepPathLegacy = (items, targetStepId, currentPath = []) => {
    if (!items || !Array.isArray(items)) return [];

    // Ensure currentPath is always an array
    const safePath = Array.isArray(currentPath) ? currentPath : [];

    for (const item of items) {
      if (!item || !item.id) continue;

      const newPath = [...safePath];

      if (item.id === parseInt(targetStepId, 10)) {
        return newPath; // Found the target, return path to parent
      }

      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        newPath.push(item.id);
        const foundPath = this.findStepPathLegacy(item.children, targetStepId, newPath);
        if (foundPath && (foundPath.length > 0 || foundPath === newPath)) {
          return foundPath;
        }
      }
    }
    return [];
  };

  filterLogItems = (items) => {
    // Only filter out log entries, keep all test items for tree structure
    return items.filter(item => {
      // Only show test items, not log entries
      // Test items have properties like 'type', 'hasContent', 'startTime', 'endTime'
      // Log entries have properties like 'level', 'logTime', 'message'
      const isTestItem = item.type || item.hasContent !== undefined || (item.startTime && item.endTime);
      const isLogEntry = item.level || item.logTime;

      // Only filter out log entries, keep all test items regardless of status
      // The failed-only filtering will be handled at the rendering level
      return isTestItem && !isLogEntry;
    });
  };

  buildTreeStructure = (items, parentItem, nestedStepsData) => {
    // Create the root item from parentItem
    const rootItem = {
      ...parentItem,
      children: [],
      isRoot: true,
    };

    // If no items, just return the root
    if (!items || items.length === 0) {
      return [rootItem];
    }

    // Create map of all items
    const itemMap = new Map();
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Add nested children from nestedStepsData
    Object.keys(nestedStepsData).forEach(stepId => {
      const nestedData = nestedStepsData[stepId];
      if (nestedData.content) {
        const parentStepId = parseInt(stepId, 10);
        let parentItem = itemMap.get(parentStepId);

        // If parent is not in itemMap, it might be the root
        if (!parentItem && parentStepId === rootItem.id) {
          parentItem = rootItem;
        }

        if (parentItem) {
          // Mark this item as having fetched its nested content
          parentItem.nestedContentFetched = true;

          // Filter nested content to show only test items (not log entries)
          const nestedTestItems = nestedData.content.filter(item => {
            const isTestItem = item.type || item.hasContent !== undefined || (item.startTime && item.endTime);
            const isLogEntry = item.level || item.logTime;
            return isTestItem && !isLogEntry;
          });

          nestedTestItems.forEach(nestedItem => {
            if (!itemMap.has(nestedItem.id)) {
              const nestedTreeItem = { ...nestedItem, children: [] };
              itemMap.set(nestedItem.id, nestedTreeItem);
              // Only add if not already present
              if (!parentItem.children.find(child => child.id === nestedItem.id)) {
                parentItem.children.push(nestedTreeItem);
              }
            }
          });
        }
      }
    });

    // Build tree structure - only add items that don't already have a parent
    items.forEach(item => {
      const treeItem = itemMap.get(item.id);
      if (item.parentId && itemMap.has(item.parentId)) {
        // This item has a parent in the current items list
        const parent = itemMap.get(item.parentId);
        if (!parent.children.find(child => child.id === item.id)) {
          parent.children.push(treeItem);
        }
      } else {
        // This item is a direct child of the root
        if (!rootItem.children.find(child => child.id === item.id)) {
          rootItem.children.push(treeItem);
        }
      }
    });

    return [rootItem];
  };

  render() {
    const { logItems, selectedStepId, onStepSelect, loading, parentItem, nestedStepsData } = this.props;
    const { searchQuery, expandedNodes, showOnlyFailed, searchMatches, searchLoading, searchStats } = this.state;
    
    if (loading) {
      return (
        <div className={cx('steps-tree-pane')}>
          <StepsTreeToolbar
            searchQuery={searchQuery}
            onSearch={this.handleSearch}
            showOnlyFailed={showOnlyFailed}
            onToggleFailedOnly={this.handleToggleFailedOnly}
            parentItem={parentItem}
            searchLoading={searchLoading}
            searchStats={searchStats}
          />
          <div className={cx('loading-container')}>
            <SpinningPreloader />
          </div>
        </div>
      );
    }

    const filteredItems = this.filterLogItems(logItems);
    const treeStructure = this.buildTreeStructure(filteredItems, parentItem, nestedStepsData);

    return (
      <div className={cx('steps-tree-pane')}>
        <StepsTreeToolbar
          searchQuery={searchQuery}
          onSearch={this.handleSearch}
          showOnlyFailed={showOnlyFailed}
          onToggleFailedOnly={this.handleToggleFailedOnly}
          parentItem={parentItem}
          itemCount={filteredItems.length}
          searchLoading={searchLoading}
          searchStats={searchStats}
        />
        
        <div className={cx('tree-container')}>
          {treeStructure.length === 0 ? (
            <NoItemMessage message="No test steps found" />
          ) : (
            <div className={cx('tree-content')}>
              {treeStructure.map(item => (
                <StepTreeNode
                  key={item.id}
                  item={item}
                  level={0}
                  selectedStepId={selectedStepId}
                  expandedNodes={expandedNodes}
                  onStepSelect={onStepSelect}
                  onToggleNode={this.handleToggleNode}
                  searchQuery={searchQuery}
                  searchMatches={searchMatches}
                  nestedStepsData={nestedStepsData}
                  countMatchesInBranch={this.countMatchesInBranch}
                  showOnlyFailed={showOnlyFailed}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
