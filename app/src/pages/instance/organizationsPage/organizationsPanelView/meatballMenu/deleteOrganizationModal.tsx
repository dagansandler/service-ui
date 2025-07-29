/*!
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

import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { messages } from '../../messages';

interface DeleteOrganizationModalData {
  organizationName: string;
  organizationId: string;
  onConfirm: () => void;
}

interface DeleteOrganizationModalProps {
  data: DeleteOrganizationModalData;
}

const CONFIRMATION_KEYWORD = 'DELETE';

export const DeleteOrganizationModal: React.FC<DeleteOrganizationModalProps> = ({ data }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const [confirmationText, setConfirmationText] = useState('');
  const [validationError, setValidationError] = useState('');

  const isValid = confirmationText.toUpperCase() === CONFIRMATION_KEYWORD;

  const handleConfirmationTextChange = useCallback(
    (value: string) => {
      setConfirmationText(value);
      // Clear validation error when user starts typing
      if (validationError && value.trim()) {
        setValidationError('');
      }
    },
    [validationError],
  );

  const validateAndSubmit = useCallback(() => {
    if (!isValid) {
      setValidationError(formatMessage(messages.deleteOrganizationValidationError));
      return;
    }

    trackEvent(ORGANIZATION_PAGE_EVENTS.deleteOrganizationConfirm());
    data.onConfirm();
    dispatch(hideModalAction());
  }, [isValid, formatMessage, trackEvent, data, dispatch]);

  const handleCancel = useCallback(() => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.deleteOrganizationCancel());
    dispatch(hideModalAction());
  }, [trackEvent, dispatch]);

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    onClick: validateAndSubmit,
    variant: 'danger' as const,
    disabled: !isValid,
    'data-automation-id': 'deleteOrganizationButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    onClick: handleCancel,
    'data-automation-id': 'cancelDeleteOrganizationButton',
  };

  return (
    <Modal
      title={formatMessage(messages.deleteOrganizationModalTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={handleCancel}
    >
      <div>
        <p>
          {formatMessage(messages.deleteOrganizationModalDescription, {
            organizationName: data.organizationName,
            b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
          })}
        </p>

        <p>{formatMessage(messages.deleteOrganizationModalWarning)}</p>

        <p>
          {formatMessage(messages.deleteOrganizationConfirmationText, {
            keyword: CONFIRMATION_KEYWORD,
            b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
          })}
        </p>

        <FieldText
          value={confirmationText}
          placeholder={formatMessage(messages.deleteOrganizationConfirmationPlaceholder)}
          onChange={(event) => handleConfirmationTextChange(event.target.value)}
          error={validationError}
          maxLength={10}
        />
      </div>
    </Modal>
  );
};
