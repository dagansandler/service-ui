/*
 * Copyright 2024 EPAM Systems
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

import { takeEvery, all, put, select, take, call } from 'redux-saga/effects';
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { redirect } from 'redux-first-router';
import { ORGANIZATIONS_PAGE } from 'controllers/pages';
import { URLS } from 'common/urls';
import { showDefaultErrorNotification, showSuccessNotification } from 'controllers/notification';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { hideModalAction } from 'controllers/modal';
import { fetch } from 'common/utils';
import {
  FETCH_ORGANIZATIONS,
  FETCH_FILTERED_ORGANIZATIONS,
  DELETE_ORGANIZATION,
  NAMESPACE,
} from './constants';
import { fetchFilteredOrganizationsAction } from './actionCreators';
import { prepareQueryFilters } from 'components/filterEntities/utils';
import { querySelector } from './selectors';

function* fetchOrganizations() {
  try {
    const query = yield select(querySelector);

    yield put(fetchDataAction(NAMESPACE)(URLS.organizationList(query)));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchFetchOrganizations() {
  yield takeEvery(FETCH_ORGANIZATIONS, fetchOrganizations);
}

function* fetchFilteredOrganizations() {
  const filtersParams = yield select(querySelector);
  const data = prepareQueryFilters(filtersParams);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.organizationSearches(), {
      method: 'post',
      data,
    }),
  );
}

function* watchFetchFilteredOrganizations() {
  yield takeEvery(FETCH_FILTERED_ORGANIZATIONS, fetchFilteredOrganizations);
}

function* deleteOrganization({ payload: { organizationId, organizationName } }) {
  try {
    yield call(fetch, URLS.deleteOrganization(organizationId), {
      method: 'delete',
    });

    yield put(fetchFilteredOrganizationsAction());
    yield put(hideModalAction());
    yield put(
      showNotification({
        messageId: 'deleteOrganizationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
        values: { organizationName },
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      showNotification({
        messageId: 'deleteError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* watchDeleteOrganization() {
  yield takeEvery(DELETE_ORGANIZATION, deleteOrganization);
}

export function* organizationsSagas() {
  yield all([
    watchFetchOrganizations(),
    watchFetchFilteredOrganizations(),
    watchDeleteOrganization(),
  ]);
}
