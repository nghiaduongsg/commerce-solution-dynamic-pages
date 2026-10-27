import React, { useEffect, useState } from 'react';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import ConfirmationBox from '@pkg-common/components/ConfirmationBox/ConfirmationBox';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { WarnOnActionSchema } from '@pkg-form/types';

const WarningDialog = ({
  id,
  onConfirm,
  onClose,
  warnOnAction,
  open,
}: {
  id: string;
  open: boolean;
  onConfirm: (_?) => void;
  onClose: () => void;
  warnOnAction?: WarnOnActionSchema;
}) => {
  const { whenToWarn, translation } = warnOnAction || {};
  const { check: showWarning } = useCheckFrom(id, whenToWarn, true);
  const {
    warningTitleKey,
    warningMessageKey,
    namespace = COMMON,
    parameters = {},
  } = translation ?? {};

  const { t: translate } = useTranslation([namespace, COMMON, ACCESSIBILITY]);
  const { selectedLanguage } = useSystem();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showWarning && open) {
      setVisible(true);
    }
    if (!showWarning && open) {
      onConfirm();
      setVisible(false);
    }
  }, [showWarning, open, onConfirm]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
    }
  }, [open]);

  return (
    <ConfirmationBox
      open={visible}
      onClose={onClose}
      title={translate(warningTitleKey || 'confirmChanges', {
        ns: namespace,
        lng: selectedLanguage,
      })}
      message={translate(warningMessageKey || 'confirmMessage', {
        ns: namespace,
        lng: selectedLanguage,
        ...parameters,
      })}
      choices={[
        {
          label: translate('cancel', { ns: COMMON, lng: selectedLanguage }),
          variant: 'outlined',
          action: onClose,
        },
        {
          label: translate('confirm', { ns: COMMON, lng: selectedLanguage }),
          variant: 'contained',
          action: onConfirm,
        },
      ]}
    />
  );
};
export default WarningDialog;
