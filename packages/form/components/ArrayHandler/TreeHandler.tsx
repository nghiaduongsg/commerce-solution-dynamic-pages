import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useFormField from '@pkg-entity/hooks/useFormField';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import ActionDialogButtons from '@pkg-common/components/AppActions/ActionDialogButtons';
import useTable from '@pkg-list/hooks/useTable';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import {
  getLevelElementId,
  getTreeSchema,
  getTreeUiSchema,
} from '@pkg-form/components/ArrayHandler/utils';
import Resource from '@pkg-common/components/Resource/Resource';
import ArrayErrorContainer from '@pkg-form/templates/ArrayTemplate/ArrayErrorContainer';
import TreeTable from '@pkg-form/components/ArrayHandler/TreeTable';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useEntity from '@pkg-entity/hooks/useEntity';
import ConfirmationBox from '@pkg-common/components/ConfirmationBox/ConfirmationBox';
import FormGroupDividerTitle from '@pkg-form/groups/FormGroupDividerTitle';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AssetByType, GenericIconButton } from '../../../common/components';
import { Box, useTheme } from '@mui/material';
import { cleanDuplicatedData, setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import useValueFrom from '@pkg-form/hooks/useValueFrom';

const formId = TRANSITION_FORM;

const TreeHandler = (props) => {
  const theme = useTheme();

  const {
    id,
    options,
    formContext,
    onChange,
    value: innerValue,
    schema,
    uiSchema,
    disabled: isTreeDisabled,
  } = props;

  const {
    configuration,
    validations,
    callApis,
    omitAddNew = false,
    applyAddWhen,
    fullWidth = false,
    title = '',
    level,
    childrenProperty,
    childrenProperties,
    changeIndicators,
    valueFrom,
  } = options;

  const { mechanism, namespace, changeIndicators: globalChangeIndicators } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { value } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { activeRow, clearActiveRow, setAllTableData, setActiveRow } = useTable(id);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const { clearEntity } = useEntity(formId);
  const { check: applyUnderCondition } = useCheckFrom(id, applyAddWhen);
  useValueFrom(id, valueFrom);

  const disabled = useMemo(() => {
    return uiSchema['ui:disabled'];
  }, [uiSchema]);

  const isDisabled = useMemo(() => {
    return disabled || isTreeDisabled;
  }, [disabled, isTreeDisabled]);

  const shouldApplyAddNew = useMemo(() => {
    let shouldApply = true;

    if (applyAddWhen) {
      shouldApply = applyUnderCondition;
    }

    return shouldApply;
  }, [id, applyUnderCondition, applyAddWhen]);

  const showAddNew = useMemo(() => {
    return !isDisabled && !omitAddNew && shouldApplyAddNew;
  }, [isDisabled, omitAddNew, shouldApplyAddNew]);

  const [isAboutToDelete, setToDelete] = useState(false);
  const [isAboutToEdit, setToEdit] = useState(false);
  const [isAboutToAdd, setToAdd] = useState(false);
  const [isAboutToDuplicated, setIsAboutToDuplicated] = useState(false);
  useEffect(() => {
    if (activeRow?.__INDEX__ >= 0) {
      if (activeRow?.__ACTION__ === 'delete') {
        setToDelete(true);
      } else if (activeRow?.__ACTION__ === 'add') {
        setToAdd(true);
      } else if (activeRow?.__ACTION__ === 'edit') {
        setToEdit(true);
      } else if (activeRow?.__ACTION__ === 'view') {
        setToEdit(true);
      } else if (activeRow?.__ACTION__ === 'duplicate') {
        setIsAboutToDuplicated(true);
      }
    }
  }, [activeRow]);

  useEffect(() => {
    const { __ACTION__, __INDEX__, __JSON_PATH__, __LEVEL__ } = activeRow;
    if (isAboutToAdd) {
      setEntityFormData({ __ACTION__, __INDEX__, __JSON_PATH__, __LEVEL__ });
    } else if (isAboutToEdit) {
      setEntityFormData(activeRow);
    } else if (isAboutToDuplicated && activeRow.__ACTION__ === 'duplicate') {
      const duplicatedData = cleanDuplicatedData([], activeRow);
      addItem({ ...duplicatedData, __STATUS__: `DUPLICATED` });

      setAnnouncement(
        `${id}-alert-help-text`,
        translate('itemDuplicated', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        }),
      );

      onCancel();
    }
  }, [isAboutToAdd, isAboutToEdit, isAboutToDuplicated, activeRow]);

  const { setEntityFormData, formData: transitionData } = useEntityFormData(TRANSITION_FORM);

  const shouldShowDialog = useMemo(() => {
    return isAboutToEdit || isAboutToAdd;
  }, [isAboutToEdit, isAboutToAdd]);

  const activeRowManipulationId = useMemo(() => {
    const { __LEVEL__: level, __JSON_PATH__: jsonPath } = activeRow;
    return getLevelElementId(
      id,
      childrenProperty,
      level,
      jsonPath,
      isAboutToAdd,
      isAboutToEdit,
      isAboutToDelete,
      isAboutToDuplicated,
    );
  }, [
    id,
    configuration,
    activeRow,
    isAboutToAdd,
    isAboutToEdit,
    isAboutToDelete,
    isAboutToDuplicated,
  ]);

  const {
    setFieldValue: setActiveRowValue,
    addItem,
    removeItem,
  } = useFormField(
    activeRowManipulationId,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const onCancel = useCallback(() => {
    setToEdit(false);
    setToAdd(false);
    setToDelete(false);
    setIsAboutToDuplicated(false);
    clearActiveRow();
    clearEntity();
  }, [clearActiveRow, clearEntity]);

  const onConfirm = useCallback(() => {
    if (isAboutToEdit) {
      setActiveRowValue({ ...transitionData, __STATUS__: 'EDITED' });
    } else if (isAboutToAdd) {
      addItem({ ...transitionData, __STATUS__: 'ADDED' });

      setAnnouncement(
        `${id}-alert-help-text`,
        translate('newItemAdded', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        }),
      );
    } else if (isAboutToDelete) {
      removeItem(activeRow?.__INDEX__);

      setAnnouncement(
        `${id}-alert-help-text`,
        translate('itemDeleted', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        }),
      );
    }

    onCancel();
  }, [
    transitionData,
    setActiveRowValue,
    addItem,
    removeItem,
    onCancel,
    isAboutToEdit,
    isAboutToAdd,
    isAboutToDelete,
    activeRow,
    id,
    translate,
    selectedLanguage,
  ]);

  useEffect(() => {
    setAllTableData(value ?? undefined);
  }, [value]);

  const finalSchema = useMemo(() => {
    const { __ACTION__: action, __LEVEL__: level } = activeRow || {};
    return getTreeSchema(schema, childrenProperty, action, level, childrenProperties);
  }, [schema, childrenProperty, activeRow, childrenProperties]);

  const finalUiSchema = useMemo(() => {
    const { __ACTION__: action, __LEVEL__: level } = activeRow || {};
    return getTreeUiSchema(id, uiSchema, namespace, childrenProperty, action, level);
  }, [uiSchema, namespace, id, activeRow, childrenProperty]);

  return (
    <>
      {value?.length > 0 &&
        callApis?.map((resource) => (
          <Resource key={resource.resourceId} resource={resource} widgetId={id} />
        ))}
      {level === 1 && (
        <FormGroupDividerTitle
          id={id}
          title={translate(configuration?.title || id, { ns: namespace, lng: selectedLanguage })}
        >
          <Box
            id={`${id}-alert-help-text`}
            role={'alert'}
            aria-live={'polite'}
            sx={{
              marginRight: theme.spacing(1),
              fontSize: theme.typography.body2.fontSize,
            }}
          />
          {showAddNew ? (
            <GenericIconButton
              id={`${id}-add-btn`}
              testId="add-btn"
              ariaLabel={translate('addNewAriaDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                field: translate(configuration?.title || id, {
                  ns: namespace,
                  lng: selectedLanguage,
                }),
              })}
              ariaHasPopup={'dialog'}
              ariaControls={shouldShowDialog ? id : undefined}
              onClick={() => {
                setActiveRow({
                  __ACTION__: 'add',
                  __LEVEL__: 0,
                  __INDEX__: value?.length ?? 0,
                  __JSON_PATH__: id,
                });
              }}
              icon={<AssetByType input="icons" name="AddCircle" />}
            />
          ) : null}
        </FormGroupDividerTitle>
      )}
      <ArrayErrorContainer fieldId={id} items={value} validations={validations} />
      <TreeTable
        configuration={{
          ...configuration,
          isDisabled,
          tableId: id,
        }}
        childrenProperties={childrenProperties}
        props={{
          ...props,
          options: {
            ...options,
            expanded: level === 0,
            changeIndicators: globalChangeIndicators ?? changeIndicators,
          },
        }}
      />

      <SimpleDialog
        id={id}
        open={shouldShowDialog}
        title={title}
        fullWidth={fullWidth}
        size={'sm'}
        onClose={onCancel}
        keepMounted={false}
        buttons={
          !isDisabled ? (
            <ActionDialogButtons
              id={formId}
              onSubmit={onConfirm}
              onCancel={onCancel}
              buttons={uiSchema?.['ui:modal:buttons']}
              onSuccessCallback={onCancel}
            />
          ) : null
        }
      >
        {shouldShowDialog && (
          <DynamicForm
            id={formId}
            schema={finalSchema}
            uiSchema={finalUiSchema}
            disabled={isDisabled}
            formContext={formContext}
          />
        )}
      </SimpleDialog>

      <ConfirmationBox
        open={isAboutToDelete}
        onClose={onCancel}
        title={translate('confirm', { ns: COMMON, lng: selectedLanguage })}
        message={translate('confirmationActionMessage', { ns: COMMON, lng: selectedLanguage })}
        choices={[
          {
            label: translate('cancel', { ns: COMMON, lng: selectedLanguage }),
            variant: 'outlined',
            action: onCancel,
          },
          {
            label: translate('confirm', { ns: COMMON, lng: selectedLanguage }),
            variant: 'contained',
            action: onConfirm,
          },
        ]}
      />
    </>
  );
};

export default TreeHandler;
