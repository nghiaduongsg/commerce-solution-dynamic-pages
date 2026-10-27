import React, { useEffect, useMemo, useRef } from 'react';
import useTable from '@pkg-list/hooks/useTable';
import { TableConfiguration } from '@pkg-list/src/types';
import { useTranslation } from 'react-i18next';
import { CORRECTED, DIFFERENCE, REPORTED, REPORTED_FORM_DATA_KEY } from '@pkg-constants/formCommon';
import HistoryInput from '@pkg-form/components/HistoryNumberField/HistoryInput';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import useFormField from '@pkg-entity/hooks/useFormField';
import { hasValue } from '@pkg-common/utils';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import { useSelector } from 'react-redux';
import { selectPressedSignatureKey } from '@pkg-common/button/selectors';
import { GenericTable } from '@pkg-list/components';
import useClearButtonPress from '@pkg-common/button/useClearButtonPress';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { Box } from '@mui/material';

const useStyles = () => {
  return {
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
  };
};

const CORRECTIONS_TABLE_ID = 'CORRECTIONS_TABLE';

const getHistoryListConfiguration = (pageId: string, path: string, disabled: boolean) => {
  const baseConf = {
    'ui:labels': {
      namespace: 'form',
    },
    pagination: {
      enabled: false,
    },
    permissionLoadKey: 'ENTITY/ui-configuration/form-corrections/by-field/GET',
    tableId: `${CORRECTIONS_TABLE_ID}_${path}`,
    showTitle: false,
    rowId: 'id',
    apiValues: {
      url: `ui-configuration/form-corrections/by-field?formId={formId}&fieldPath=${path}`,
      resourceId: path,
      replacements: [
        {
          key: '{formId}',
          source: {
            type: 'ENTITY',
            code: pageId,
            jsonPath: ['id'],
          },
        },
      ],
    },
    columns: [
      {
        type: 'string',
        name: 'sequence',
        accessors: ['sequence'],
        align: 'left',
        visible: true,
        truncate: {
          enabled: true,
          width: 300,
          lines: 2,
        },
      },
      {
        type: 'string',
        name: 'correctionReason',
        accessors: ['formCorrectionReasonCL'],
        align: 'left',
        visible: true,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
      {
        type: 'string',
        name: 'description',
        accessors: ['description'],
        align: 'left',
        visible: true,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
      {
        type: 'string',
        name: 'explanation',
        accessors: ['explanation'],
        align: 'left',
        visible: true,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
      {
        type: 'string',
        name: 'modification',
        accessors: ['modification'],
        align: 'right',
        visible: true,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
      {
        type: 'string',
        name: 'correctedValue',
        accessors: ['correctedValue'],
        align: 'right',
        visible: true,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
      {
        type: 'boolean',
        name: 'Active',
        accessors: ['active'],
        align: 'left',
        visible: true,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
    ],
  };

  if (!disabled) {
    baseConf['ui:buttons'] = {
      style: 'button',
      buttons: [
        {
          style: 'icon',
          icon: 'ADD',
          title: 'Add',
          markPresses: true,
          avoidSubmit: true,
          permissionKey:
            'ENTITY/registration/assets/{id}/party-role-relations/{partyRoleRelationId}/PUT',
          schemas: {
            schema: {
              type: 'object',
              properties: {
                formCorrectionReasonCL: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                explanation: {
                  type: 'string',
                },
                modification: {
                  type: 'number',
                },
                active: {
                  type: 'boolean',
                },
              },
            },
            uiSchema: {
              'ui:labels': {
                namespace: 'form',
              },
              formCorrectionReasonCL: {
                'ui:widget': 'SelectCodeListWidget',
                'ui:options': {
                  apiValues: {
                    url: 'reference-data/codelists/FORM_CORRECTION_REASONS',
                    codeList: 'FORM_CORRECTION_REASONS',
                    jsonPath: ['items'],
                  },
                  validations: {
                    required: true,
                  },
                },
              },
              description: {
                'ui:options': {
                  validations: {
                    required: true,
                  },
                },
              },
              explanation: {
                'ui:options': {
                  multiline: true,
                  validations: {
                    required: true,
                  },
                },
              },
              modification: {
                'ui:options': {
                  validations: {
                    required: true,
                  },
                },
              },
              active: {
                'ui:options': {},
              },
            },
          },
        },
      ],
    };

    baseConf['ui:row:buttons'] = {
      style: 'button',
      buttons: [
        {
          style: 'menu',
          type: 'default',
          groups: [
            {
              style: 'simple',
              icon: 'EDIT',
              title: 'Edit',
              markPresses: true,
              avoidSubmit: true,
              permissionKey:
                'ENTITY/registration/assets/{id}/party-role-relations/{partyRoleRelationId}/PUT',
              schemas: {
                schema: {
                  type: 'object',
                  properties: {
                    formCorrectionReasonCL: {
                      type: 'string',
                    },
                    description: {
                      type: 'string',
                    },
                    explanation: {
                      type: 'string',
                    },
                    modification: {
                      type: 'number',
                    },
                    active: {
                      type: 'boolean',
                    },
                  },
                },
                uiSchema: {
                  'ui:labels': {
                    namespace: 'form',
                  },
                  formCorrectionReasonCL: {
                    'ui:widget': 'SelectCodeListWidget',
                    'ui:options': {
                      apiValues: {
                        url: 'reference-data/codelists/FORM_CORRECTION_REASONS',
                        codeList: 'FORM_CORRECTION_REASONS',
                        jsonPath: ['items'],
                      },
                      validations: {
                        required: true,
                      },
                    },
                  },
                  description: {
                    'ui:options': {
                      validations: {
                        required: true,
                      },
                    },
                  },
                  explanation: {
                    'ui:options': {
                      multiline: true,
                      validations: {
                        required: true,
                      },
                    },
                  },
                  modification: {
                    'ui:options': {
                      validations: {
                        required: true,
                      },
                    },
                  },
                  active: {
                    'ui:options': {},
                  },
                },
              },
            },
            {
              title: 'delete',
              style: 'simple',
              icon: 'DELETE',
              warnOnAction: {
                translation: {
                  warningTitleKey: 'confirm',
                  warningMessageKey: 'confirmationActionMessage',
                },
              },
              markPresses: true,
              avoidSubmit: true,
            },
          ],
        },
      ],
    };
  }

  return baseConf;
};

const GenericCorrections = ({
  tableId,
  fieldId,
  pageId,
  propertyName,
  fieldPath,
  columnIndex = 0,
  rowIndex = 0,
  cellId = '',
  onClose,
  disabled,
}) => {
  const styles = useStyles();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const { clearAllButtonPresses } = useClearButtonPress();

  const configuration = useMemo(() => {
    return getHistoryListConfiguration(pageId, fieldPath, disabled) as unknown as TableConfiguration;
  }, [fieldPath, pageId, disabled]);

  const editButtonPressed = useSelector(
    selectPressedSignatureKey([`${CORRECTIONS_TABLE_ID}_${fieldPath}_btn_call_Edit`]),
  );
  const addButtonPressed = useSelector(
    selectPressedSignatureKey([`${CORRECTIONS_TABLE_ID}_${fieldPath}_btn_call_Add`]),
  );
  const deleteButtonPressed = useSelector(
    selectPressedSignatureKey([`${CORRECTIONS_TABLE_ID}_${fieldPath}_btn_call_delete`]),
  );
  const activeRowToDeleteRef = useRef<number | undefined>(undefined);
  const activeRowToDelete = useSelector(
    (state: any) => state?.Tables?.[`${CORRECTIONS_TABLE_ID}_${fieldPath}`]?.activeRow?.sequence,
  );
  useEffect(() => {
    activeRowToDeleteRef.current = activeRowToDelete;
  }, [activeRowToDelete]);

  const { formData: pageData } = useEntityFormData(pageId);
  const { value: parentData, setFieldValue: setParentData } = useFormField(tableId);
  const { value: allCorrections, setFieldValue: setAllCorrections } = useFormField(
    `${pageId}_formCorrections`,
  );
  const { formData: currentCorrectedLine } = useEntityFormData(TRANSITION_FORM);
  const { setTableData: setCorrectionsList, tableData: correctionList } = useTable(
    `${CORRECTIONS_TABLE_ID}_${fieldPath}`,
  );
  const { updateTableRow } = useTable(tableId);

  const reported = useMemo(() => {
    if (
      !pageData ||
      !pageData[REPORTED_FORM_DATA_KEY] ||
      !pageData[REPORTED_FORM_DATA_KEY][propertyName]
    ) {
      return 0;
    }
    return pageData[REPORTED_FORM_DATA_KEY][propertyName][cellId] || 0;
  }, [pageData, propertyName, cellId]);

  const activeCorrectionsList = useMemo(() => {
    return (correctionList || []).filter((obj: any) => obj.active);
  }, [correctionList]);

  const corrected = useMemo(() => {
    return activeCorrectionsList.length > 0
      ? activeCorrectionsList.reduce((total, correction: any) => total + correction.modification, 0) +
          reported
      : reported;
  }, [activeCorrectionsList, reported]);

  const difference = useMemo(() => {
    return corrected - reported;
  }, [corrected, reported]);

  const currentCorrectedLineRef = useRef(currentCorrectedLine);

  useEffect(() => {
    if (
      hasValue(currentCorrectedLine) &&
      JSON.stringify(currentCorrectedLine || {}) !==
        JSON.stringify(currentCorrectedLineRef.current || [])
    ) {
      currentCorrectedLineRef.current = currentCorrectedLine;
    }
  }, [currentCorrectedLine]);

  useEffect(() => {
    const copied: any[] = correctionList.map((item) => ({ ...item }));
    if (editButtonPressed || addButtonPressed || deleteButtonPressed) {
      if (!currentCorrectedLineRef.current) {
        return;
      }
      const { sequence } = currentCorrectedLineRef.current;
      if (editButtonPressed || addButtonPressed) {
        if (sequence) {
          if (sequence <= copied.length) {
            copied[sequence - 1] = currentCorrectedLineRef.current;
          } else {
            copied.push({ ...currentCorrectedLineRef.current, sequence });
          }
        } else {
          const newSequence = (copied.length || 0) + 1;
          if (Object.keys(currentCorrectedLineRef.current).length !== 0) {
            copied.push({ ...currentCorrectedLineRef.current, sequence: newSequence });
          }
        }
      }
      if (deleteButtonPressed) {
        const sequence = activeRowToDeleteRef.current;
        if (!sequence) return;
        copied.splice(sequence - 1, 1);
      }
      copied.forEach((line, index) => {
        const slice = copied.slice(0, index + 1);
        line.sequence = index + 1;
        if (line.active) {
          if (slice.length - 1 === index) {
            line.correctedValue =
              index > 0
                ? slice.reduce((total, correction) => {
                    if (correction.active) return total + parseFloat(correction.modification);
                    else return total;
                  }, 0) + reported
                : line.modification + reported;
          }
        } else line.correctedValue = 0;
      });
      setCorrectionsList({ data: copied });
      clearAllButtonPresses();
    }
  }, [editButtonPressed, addButtonPressed, deleteButtonPressed]);

  const onSaveCorrections = () => {
    setAllCorrections({
      ...(allCorrections || {}),
      [`$.${fieldPath}`]: correctionList || [],
    });
    setParentData({ ...parentData, [cellId]: corrected });

    updateTableRow({
      property: {
        value: corrected,
        name: cellId,
      },
      rowIndex,
      columnIndex,
    });

    currentCorrectedLineRef.current = {};
    clearAllButtonPresses();
    onClose();
  };

  return (
    <>
      <Box sx={styles.box}>
        <HistoryInput
          id={`${columnIndex}-${rowIndex}_${REPORTED}`}
          disabled={true}
          showLabel={true}
          required={false}
          isAmount={true}
          label={translate(REPORTED, { ns: COMMON, lng: selectedLanguage })}
          type="number"
          value={reported}
        />
        <div>
          <HistoryInput
            id={`${columnIndex}-${rowIndex}_${CORRECTED}`}
            disabled={true}
            showLabel={true}
            required={false}
            isAmount={true}
            label={translate(CORRECTED, { ns: COMMON, lng: selectedLanguage })}
            type="number"
            value={corrected}
          />
        </div>
        <HistoryInput
          id={`${columnIndex}-${rowIndex}_${DIFFERENCE}`}
          disabled={true}
          showLabel={true}
          required={false}
          isAmount={true}
          label={translate(DIFFERENCE, { ns: COMMON, lng: selectedLanguage })}
          value={difference}
          type="number"
        />
      </Box>
      <GenericTable
        configuration={configuration}
        parentId={pageId}
        fieldId={fieldId}
        hasRefreshButton={false}
      />
      {!disabled && (
        <Box sx={styles.button}>
          <GenericButton
            id={`${cellId}-save-btn`}
            variant="contained"
            label={translate('save', { ns: COMMON, lng: selectedLanguage })}
            ariaLabel={translate('save', { ns: COMMON, lng: selectedLanguage })}
            ariaDescription={translate('saveAriaDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            onClick={onSaveCorrections}
          />
        </Box>
      )}
    </>
  );
};

export default GenericCorrections;
