import React, { useState, useMemo } from 'react';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import HistoricTextModal from './HistoricTextModal';
import {
  CORRECTED,
  REPORTED,
  REPORTED_FORM_DATA_KEY,
  VALID_STATUS_RESOURCE_ID,
} from '@pkg-constants/formCommon';
import HistoryInput from '@pkg-form/components/HistoryNumberField/HistoryInput';
import useFormField from '@pkg-entity/hooks/useFormField';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AnyType } from '@pkg-common/types';
import { getJsonPathFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';

const getStyles = () => ({
  edit: {
    marginBottom: '-10px',
    marginLeft: '12px',
    cursor: 'pointer',
  },
});

const HistoryTextField = ({
  idPrefix,
  id: inputFieldID = '',
  options,
  uiSchema,
  name,
  diffs,
  serverErrors,
}) => {
  const {
    disabledFrom,
    showLabel = false,
    translation: { namespace },
  } = options;
  const styles = getStyles();

  const { selectedLanguage } = useSystem();
  const namespaces = [COMMON, namespace || ''];
  const { t: translate } = useTranslation(namespaces);

  const inputFieldIDFields = inputFieldID.split('_');
  const reportedRepo =
    inputFieldIDFields.length > 1
      ? `${inputFieldIDFields[0]}_${REPORTED_FORM_DATA_KEY}_${inputFieldIDFields
          .slice(1, inputFieldIDFields.length)
          .join('_')}`
      : '';
  const { value: correctedValue, setFieldValue: setCorrectedFieldValue } =
    useFormField(inputFieldID);
  const { value: reportedValue } = useFormField(reportedRepo);
  const [value, setFieldValue] = useState<AnyType>({
    [CORRECTED]: correctedValue,
    [REPORTED]: reportedValue,
  });

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const { check: isDisabled } = useCheckFrom(inputFieldID, disabledFrom);
  const { data } = useApiDataState(VALID_STATUS_RESOURCE_ID);
  const editAllowedCheck =
    data?.attributes.find((att) => {
      return att.key === 'editAllowed';
    }) ?? false;
  const editAllowed = editAllowedCheck ? (editAllowedCheck.value === 'YES' ? true : false) : true;

  const valueChanged = (userInput) => {
    setCorrectedFieldValue(userInput);

    return setFieldValue({
      ...value,
      [CORRECTED]: userInput,
    });
  };

  const buttonProps = useMemo(() => {
    return {
      id: `${inputFieldID}_${editAllowed ? 'editIcon' : 'visibilityIcon'}`,
      label: translate(editAllowed ? 'edit' : 'view', { ns: COMMON, lng: selectedLanguage }),
      ariaLabel: translate(editAllowed ? 'edit' : 'view', { ns: COMMON, lng: selectedLanguage }),
      ariaDescription: translate(editAllowed ? 'editAriaDescription' : 'viewAriaDescription', {
        ns: ACCESSIBILITY,
      }),
      ariaControls: `${inputFieldID}_dialog`,
      icon: editAllowed ? (
        <AssetByType input="icons" name="Edit" />
      ) : (
        <AssetByType input="icons" name="Visibility" />
      ),
    };
  }, [translate, editAllowed, selectedLanguage]);
  const [, field] = getJsonPathFromWidgetId(inputFieldID);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <HistoryInput
          id={`${inputFieldID}_${CORRECTED}_textfield`}
          value={value?.[CORRECTED] ?? value?.[REPORTED]}
          label={translate(name, { ns: namespace, lng: selectedLanguage })}
          type={'string'}
          disabled={!isDisabled}
          required={false}
          onChange={(e) => {
            valueChanged(e.target.value);
          }}
          showLabel={showLabel}
          serverErrors={serverErrors}
          diffs={diffs}
        />
        {!isDisabled && (
          <GenericIconButton
            id={buttonProps.id}
            label={buttonProps.label}
            ariaLabel={buttonProps.ariaLabel}
            ariaDescription={buttonProps.ariaDescription}
            styles={styles.edit}
            onClick={() => setShowDialog(true)}
            ariaControls={showDialog ? buttonProps.ariaControls : undefined}
            icon={buttonProps.icon}
            ariaHasPopup={true}
          />
        )}
        {
          <SimpleDialog
            id={`${inputFieldID}_dialog`}
            open={showDialog}
            onClose={() => setShowDialog(false)}
            title={translate(field, { ns: namespace })}
            size="xl"
          >
            <HistoricTextModal
              id={`${inputFieldID}`}
              canAdd={editAllowed}
              value={value}
              namespace={namespace}
              fieldType={'string'}
              parentEntityPrefix={idPrefix}
              uiSchema={uiSchema}
              onModalClose={() => setShowDialog(false)}
              valueChanged={valueChanged}
            />
          </SimpleDialog>
        }
      </div>
    </>
  );
};

export default HistoryTextField;
