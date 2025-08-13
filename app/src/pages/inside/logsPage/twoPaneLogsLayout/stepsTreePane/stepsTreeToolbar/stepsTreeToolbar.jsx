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
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import styles from './stepsTreeToolbar.scss';

const cx = classNames.bind(styles);

export class StepsTreeToolbar extends Component {
  static propTypes = {
    searchQuery: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    showOnlyFailed: PropTypes.bool,
    onToggleFailedOnly: PropTypes.func.isRequired,
    parentItem: PropTypes.object,
    itemCount: PropTypes.number,
    searchLoading: PropTypes.bool,
    searchStats: PropTypes.object,
  };

  static defaultProps = {
    searchQuery: '',
    showOnlyFailed: false,
    parentItem: {},
    itemCount: 0,
    searchLoading: false,
    searchStats: { loaded: 0, autoLoaded: 0, total: 0 },
  };

  render() {
    const {
      searchQuery,
      onSearch,
      showOnlyFailed,
      onToggleFailedOnly,
      parentItem,
      itemCount,
      searchLoading,
      searchStats
    } = this.props;

    return (
      <div className={cx('steps-tree-toolbar')}>
        <div className={cx('toolbar-header')}>
          <h3 className={cx('title')}>Test Steps</h3>
          {itemCount !== undefined && (
            <span className={cx('item-count')}>({itemCount})</span>
          )}
        </div>
        
        <div className={cx('search-section')}>
          <InputSearch
            value={searchQuery}
            onChange={onSearch}
            placeholder="Search steps..."
            maxLength={256}
          />
          {searchQuery && (
            <div className={cx('search-stats')}>
              {searchLoading ? (
                <span className={cx('search-loading')}>Searching...</span>
              ) : (
                <span className={cx('search-results')}>
                  {searchStats.loaded + searchStats.autoLoaded} matches found
                  {searchStats.autoLoaded > 0 && (
                    <span className={cx('auto-loaded')}> ({searchStats.autoLoaded} from auto-load)</span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={cx('filter-section')}>
          <InputCheckbox
            value={showOnlyFailed}
            onChange={onToggleFailedOnly}
          >
            Show only failed steps
          </InputCheckbox>
        </div>
        
        {parentItem.name && (
          <div className={cx('context-section')}>
            <div className={cx('context-item')}>
              <span className={cx('context-label')}>Test Item:</span>
              <span className={cx('context-value')} title={parentItem.name}>
                {parentItem.name}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
