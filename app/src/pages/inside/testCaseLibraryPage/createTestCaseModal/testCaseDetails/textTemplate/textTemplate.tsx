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

import { defineMessages, useIntl } from 'react-intl';
import { FieldTextFlex } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';

import { FieldErrorHint, FieldProvider } from 'components/fields';

import styles from './textTemplate.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  instructions: {
    id: 'CreateTestCaseModal.instructions',
    defaultMessage: 'Instructions',
  },
  enterInstructions: {
    id: 'CreateTestCaseModal.enterInstructions',
    defaultMessage: 'Enter instructions to execute this scenario',
  },
  expectedResult: {
    id: 'CreateTestCaseModal.expectedResult',
    defaultMessage: 'Expected result',
  },
  enterExpectedResult: {
    id: 'CreateTestCaseModal.enterExpectedResult',
    defaultMessage: 'Enter the expected result here',
  },
});

export const TextTemplate = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('text-template')}>
      <FieldProvider name="instructions">
        <FieldErrorHint>
          <FieldTextFlex
            label={formatMessage(messages.instructions)}
            placeholder={formatMessage(messages.enterInstructions)}
            value=""
          />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="expectedResult">
        <FieldErrorHint>
          <FieldTextFlex
            label={formatMessage(messages.expectedResult)}
            placeholder={formatMessage(messages.enterExpectedResult)}
            value=""
          />
        </FieldErrorHint>
      </FieldProvider>
    </div>
  );
};
