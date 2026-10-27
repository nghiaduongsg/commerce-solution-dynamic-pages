import React, { useCallback } from 'react';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import useTable from '@pkg-list/hooks/useTable';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { FORM_DEFINITION_ID } from '@pkg-constants/formIds';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import ActionDialogButtons from '@pkg-common/components/AppActions/ActionDialogButtons';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { REPORTED_FORM_DATA_KEY } from '@pkg-constants/formCommon';
import { AnyType } from '@pkg-common/types';
import { encodeText } from '@pkg-common/utils';

export default function GenericDefaultTableForm({ configuration, title }: AnyType) {
  const {
    tableId,
    entitySchema = {},
    entityUISchema = {},
    rowId,
    url,
    modalSize,
    saveActionType,
  } = configuration;

  const { disabledFrom } = entityUISchema;
  const { check: disabled } = useCheckFrom(rowId, disabledFrom);

  const modalButtons = entityUISchema?.['ui:modal:buttons'];
  const hasCustomModalButtons = !!modalButtons?.buttons?.length;

  const urlParams = Object.fromEntries(new URLSearchParams(url));
  const fieldPath = urlParams?.fieldPath;

  const { saveTableRow, openTableForm, toggleTableFormModal, isNewTableForm, concatLocalTableRow } =
    useTable(tableId);
  const { setEntityFormData, clearEntityFormData, formData } = useEntityFormData(tableId);
  const { formData: formsEntityFormData } = useEntityFormData(FORM_DEFINITION_ID);
  const onCancel = useCallback(() => {
    clearEntityFormData();
    toggleTableFormModal(false);
  }, [clearEntityFormData, toggleTableFormModal]);

  const onSubmit = useCallback(() => {
    if (saveActionType === 'SAVE_LOCALLY' && fieldPath) {
      const [category, fieldName] = fieldPath.split('.');
      //TODO: Remove this Form specific line of code
      const reported = +(formsEntityFormData[REPORTED_FORM_DATA_KEY]?.[category]?.[fieldName] ?? 0);
      toggleTableFormModal(false);
      return concatLocalTableRow({ formData, reported });
    }
    const data = {};
    Object.keys(entitySchema.properties).forEach((prop) => (data[prop] = formData[prop]));
    saveTableRow &&
      saveTableRow(`${url}/${encodeText(data[rowId])}`, data, isNewTableForm ? 'post' : 'put');
    toggleTableFormModal(false);
    return;
  }, [
    entitySchema.properties,
    saveTableRow,
    url,
    rowId,
    isNewTableForm,
    toggleTableFormModal,
    formData,
    concatLocalTableRow,
    saveActionType,
  ]);

  const onSuccessCallback = useCallback(() => {
    clearEntityFormData();
    toggleTableFormModal(false);
  }, [clearEntityFormData, toggleTableFormModal]);

  return (
    <SimpleDialog
      id={tableId}
      title={title}
      size={modalSize}
      open={openTableForm || false}
      buttons={
        <ActionDialogButtons
          id={tableId}
          onSubmit={!disabled && !hasCustomModalButtons ? onSubmit : undefined}
          onCancel={onCancel}
          buttons={modalButtons}
          onSuccessCallback={onSuccessCallback}
        />
      }
    >
      <DynamicForm
        id={tableId}
        schema={entitySchema}
        uiSchema={entityUISchema}
        data={formData}
        onChange={setEntityFormData}
      />
    </SimpleDialog>
  );
}
