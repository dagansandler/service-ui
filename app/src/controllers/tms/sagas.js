/*
 * Copyright 2025 EPAM Systems
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

import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_START } from 'controllers/fetch/constants';
import { showDefaultErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_TMS_FOLDERS } from './constants';
import {
  MOCK_TMS_FOLDERS_RESPONSE,
  MOCK_TMS_FOLDERS_EMPTY_RESPONSE,
  MOCK_TMS_FOLDERS_ERROR,
} from './mockData';

/**
 * Development helper functions for testing different states
 * Usage in browser console:
 * - window.tmsTestHelpers.forceEmpty() - Force empty state
 * - window.tmsTestHelpers.forceError() - Force error state
 * - window.tmsTestHelpers.forceReal() - Use real API
 * - window.tmsTestHelpers.forceNormal() - Return to mock state
 * - window.tmsTestHelpers.status() - Check current state
 */
if (typeof window !== 'undefined') {
  window.tmsTestHelpers = {
    forceEmpty: () => {
      localStorage.setItem('tms-simulation-mode', 'empty');
      console.log('🔹 TMS: Empty state forced. Refresh page to see empty state.');
    },
    forceError: () => {
      localStorage.setItem('tms-simulation-mode', 'error');
      console.log('🔹 TMS: Error state forced. Refresh page to see error notification.');
    },
    forceReal: () => {
      localStorage.setItem('tms-simulation-mode', 'real');
      console.log('🔹 TMS: Real API mode enabled. Refresh page to use actual API.');
    },
    forceNormal: () => {
      localStorage.removeItem('tms-simulation-mode');
      console.log('🔹 TMS: Mock mode restored. Refresh page to see mock folders.');
    },
    status: () => {
      const mode = localStorage.getItem('tms-simulation-mode') || 'mock';
      console.log(`🔹 TMS State: ${mode.toUpperCase()}`);
      console.log(`   - Simulation mode: ${mode}`);
    },
  };
}

function* fetchTmsFolders() {
  const projectKey = yield select(projectKeySelector);

  if (!projectKey) {
    console.log('TMS Saga: No projectKey available yet');
    return;
  }

  console.log('TMS Saga: Fetching folders for project:', projectKey);

  try {
    // Start loading state
    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: NAMESPACE },
    });

    // Simulate API delay
    yield delay(1000);

    // Check simulation mode
    const simulationMode = localStorage.getItem('tms-simulation-mode');

    switch (simulationMode) {
      case 'empty':
        console.log('TMS Saga: Returning empty response for testing');
        yield put(fetchSuccessAction(NAMESPACE, MOCK_TMS_FOLDERS_EMPTY_RESPONSE));
        return;

      case 'error':
        console.log('TMS Saga: Forcing error for testing');
        yield put(fetchErrorAction(NAMESPACE, MOCK_TMS_FOLDERS_ERROR));
        yield put(showDefaultErrorNotification({ message: MOCK_TMS_FOLDERS_ERROR.message }));
        return;

      case 'real':
        console.log('TMS Saga: Making real API call for project:', projectKey);
        try {
          const response = yield call(fetch, URLS.tmsFolders(projectKey));
          console.log('TMS Saga: Real API Response Success:', response);
          yield put(fetchSuccessAction(NAMESPACE, response));
        } catch (error) {
          console.error('TMS Saga: Real API Error:', error);
          yield put(fetchErrorAction(NAMESPACE, error));
          yield put(
            showDefaultErrorNotification({
              message: error.message || 'Failed to fetch TMS folders from API',
            }),
          );
        }
        return;

      default:
        // Mock case - return mock folders
        console.log('TMS Saga: Mock API Response Success:', MOCK_TMS_FOLDERS_RESPONSE);
        yield put(fetchSuccessAction(NAMESPACE, MOCK_TMS_FOLDERS_RESPONSE));
    }
  } catch (error) {
    console.error('TMS Saga: Error in mock fetch:', error);
    yield put(fetchErrorAction(NAMESPACE, error));

    yield put(
      showDefaultErrorNotification({ message: error.message || 'Failed to fetch TMS folders' }),
    );
  }
}

function* watchFetchTmsFolders() {
  yield takeEvery(FETCH_TMS_FOLDERS, fetchTmsFolders);
}

export function* tmsSagas() {
  yield all([watchFetchTmsFolders()]);
}
