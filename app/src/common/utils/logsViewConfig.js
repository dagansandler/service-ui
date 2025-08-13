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

/**
 * Configuration utilities for logs view features
 */

/**
 * Feature flag to control whether to use the new two-pane logs layout
 * instead of the traditional grid view.
 * 
 * @returns {boolean} true if two-pane layout should be used, false for traditional grid
 */
export const shouldUseTwoPaneLogs = () => {
  return process.env.REACT_APP_USE_TWO_PANE_LOGS_VIEW === 'true';
};
