import React, { useEffect, useState } from 'react';
import ConfirmationBox from '@pkg-common/components/ConfirmationBox/ConfirmationBox';
import useFormField from '@pkg-entity/hooks/useFormField';
import { AnyType } from '@pkg-common/types';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { hasValue } from '@pkg-common/utils';

const WarningDialog = ({
  widget,
  widgetProps,
}: {
  widget: (props: AnyType) => void;
  widgetProps: AnyType;
}) => {
  const { id, options, formContext, value: initialValue, label } = widgetProps;
  const { warnOnChange, translation } = options;
  const { enabled = false, whenToWarn = {} } = warnOnChange;

  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [futureValue, setFutureValue] = useState(null);

  const { formData: resourceData } = useEntityFormData(formContext?.formId);
  const { setFieldValue } = useFormField(id);

  const { check: showWarning, values } = useCheckFrom(id, whenToWarn, true, {
    ...resourceData,
    [label]: futureValue ?? initialValue,
  });

  const { warningTitleKey, warningMessageKey } = warnOnChange?.translation ?? {};
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([formContext?.namespace || translation?.namespace || '']);

  useEffect(() => {
    if (futureValue !== null) {
      if (showWarning && hasValue(initialValue) && futureValue !== initialValue) {
        setWarningDialogOpen(true);
      } else {
        setTimeout(() => {
          setFieldValue(futureValue);
        });
        setFutureValue(null);
      }
    }
  }, [futureValue, showWarning, values, initialValue, setFieldValue]);

  const handleConfirm = () => {
    setFieldValue(futureValue);
    setWarningDialogOpen(false);
    setFutureValue(null);
  };

  const handleCancel = () => {
    setWarningDialogOpen(false);
    setFutureValue(null);
  };

  return (
    <>
      {enabled && (
        <ConfirmationBox
          open={warningDialogOpen}
          onClose={handleCancel}
          title={translate(warningTitleKey, { lng: selectedLanguage })}
          message={translate(warningMessageKey, { lng: selectedLanguage })}
          choices={[
            {
              label: translate('cancel', { ns: COMMON, lng: selectedLanguage }),
              action: handleCancel,
            },
            {
              label: translate('confirm', { ns: COMMON, lng: selectedLanguage }),
              action: handleConfirm,
            },
          ]}
        />
      )}
      {widget({
        ...widgetProps,
        warnOnChange: setFutureValue,
      })}
    </>
  );
};

export default WarningDialog;
