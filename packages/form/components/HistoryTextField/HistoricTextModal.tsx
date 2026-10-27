import GenericButton from '@pkg-common/components/GenericButton/GenericButton';

import { CORRECTED, REPORTED } from '@pkg-constants/formCommon';
import React, { useState, useMemo, useEffect } from 'react';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import { HISTORY_TEXT_FIELDS } from '@pkg-constants/tableIds';
import useEntity from '@pkg-entity/hooks/useEntity';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { getJsonPathFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import useTable from '@pkg-list/hooks/useTable';
import GenericTableWithLocalState from '@pkg-form/components/HistoryNumberField/GenericTableWithLocalState';
import HistoryInput from '@pkg-form/components/HistoryNumberField/HistoryInput';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { Box } from '@mui/material';

const getStyles = () => ({
  box: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  button: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '15px',
  },
  midField: {
    margin: '0 10px',
  },
});

const HistoricTextModal = ({
  id,
  canAdd = true,
  value,
  namespace,
  fieldType,
  parentEntityPrefix,
  uiSchema,
  onModalClose,
  valueChanged,
}) => {
  const styles = getStyles();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, namespace, ACCESSIBILITY]);
  const [reported] = useState(value?.reported ?? '');
  const [corrected, setCorrected] = useState(value?.corrected ?? '');
  const { setEntity } = useEntity(parentEntityPrefix);
  const { formData } = useEntityFormData(parentEntityPrefix);
  const [category, field] = getJsonPathFromWidgetId(id);
  const { tableData } = useTable(HISTORY_TEXT_FIELDS);

  const finalSchema = useMemo(() => {
    if (canAdd) return uiSchema;

    const options = uiSchema?.['ui:options'];

    return {
      ...uiSchema,
      ['ui:options']: {
        ...options,
        config: {
          ...options?.config,
          actions: {
            ...options?.config?.actions,
            createEntity: false,
            updateEntity: false,
            deleteEntity: false,
          },
        },
      },
    };
  }, [uiSchema, canAdd]);

  const saveEntity = () => {
    setEntity({
      ...formData,
      [category]: {
        ...formData[category],
        [field]: corrected,
      },
      formCorrections: {
        ...formData.formCorrections,
        [`$.${getJsonPathFromWidgetId(id).join('.')}`]: tableData,
      },
    });
    valueChanged(corrected);
    onModalClose();
  };
  // Update the Corrected value on top of the Table
  const updatedCorrectValue = (tableData as any[]).filter((obj) => obj.active);

  useEffect(() => {
    const modification = updatedCorrectValue[updatedCorrectValue.length - 1]?.correctedValue;
    setCorrected(modification || reported);
  }, [updatedCorrectValue, reported]);

  return (
    <>
      <Box sx={styles.box}>
        <HistoryInput
          id={`${id}_${REPORTED}`}
          required={false}
          disabled={true}
          type={fieldType}
          value={reported}
          showLabel={true}
          label={translate(REPORTED, { ns: COMMON, lng: selectedLanguage })}
        />
        <HistoryInput
          id={`${id}_${CORRECTED}`}
          value={corrected}
          label={translate(CORRECTED, { ns: COMMON, lng: selectedLanguage })}
          type={fieldType}
          required={false}
          disabled={true}
          showLabel={true}
        />
      </Box>
      <GenericTableWithLocalState
        uiSchema={finalSchema}
        id={`${id}`}
        disabled={false}
        parentEntityPrefix={parentEntityPrefix}
      />
      <Box sx={styles.button}>
        {canAdd && (
          <GenericButton
            id={`${id}-save-btn`}
            variant="contained"
            label={translate('save', { ns: COMMON, lng: selectedLanguage })}
            ariaLabel={translate('save', { ns: COMMON, lng: selectedLanguage })}
            ariaDescription={translate('save', { ns: COMMON, lng: selectedLanguage })}
            onClick={saveEntity}
          />
        )}
      </Box>
    </>
  );
};

export default HistoricTextModal;
