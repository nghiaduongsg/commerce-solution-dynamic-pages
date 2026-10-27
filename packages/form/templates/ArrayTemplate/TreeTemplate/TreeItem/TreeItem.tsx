import React, {
  cloneElement,
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import TreeItemContainer from './TreeItemContainer/TreeItemContainer';
import { DataSourceSchema } from '@pkg-common/types';
import { TreeItemProps } from './TreeItem.d';
import {
  dropChildrenFromSchema,
  convertUiSchemaToReadMode,
  keepOnlyChildrenFromSchema,
  getSchemaHasChildren,
  getChildrenKeyName,
} from '../utils';
import useFormField from '@pkg-entity/hooks/useFormField';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import ActionDialogButtons from '@pkg-common/components/AppActions/ActionDialogButtons';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';

const getItemOnReadModeWithoutChildren = (schema, uiSchema, children, namespace) =>
  cloneElement(children as ReactElement<any>, {
    uiSchema: getItemUiSchema(convertUiSchemaToReadMode(uiSchema), namespace),
    schema: dropChildrenFromSchema(schema),
  });

const getItemChildrenOnReadMode = (schema, uiSchema, children, namespace) => {
  const childrenKeyName = getChildrenKeyName(schema);
  const readModeUiSchema = convertUiSchemaToReadMode(uiSchema);

  if (childrenKeyName && readModeUiSchema[childrenKeyName]?.['ui:options']) {
    delete readModeUiSchema[childrenKeyName]['ui:options'].visibilityFrom;
  }

  return cloneElement(children as ReactElement<any>, {
    schema: keepOnlyChildrenFromSchema(schema),
    uiSchema: getItemUiSchema(readModeUiSchema, namespace),
  });
};

const getItemUiSchema = (uiSchema, namespace) => ({
  ...uiSchema,
  'ui:labels': { namespace },
});

const TreeItem = ({
  parentId,
  formContext,
  item: { children, key, index, isNew },
  depth,
  entityTitle,
  onActionComplete,
  onItemDuplicated,
  collapsed = true,
  onToggleCollapse,
  buttons,
  modalButtons,
  info,
  modalSize,
  changeIndicators,
}: TreeItemProps) => {
  const { namespace, changeIndicators: globalChangeIndicators } = formContext || {};
  const { schema, uiSchema } = (children as ReactElement<any>).props;
  const fieldId = `${parentId}_${index}`;

  const { removeItem, value: parentsArray, setFieldValue: setParentArray } = useFormField(parentId);
  const { value: itemData, setFieldValue } = useFormField(fieldId);
  const { isFormValidServerSide } = useFormValidity(fieldId);
  const { setEntityFormData } = useEntityFormData(TRANSITION_FORM);

  //? Keep this reference for EDIT_CASE_ACTIVITY button
  const itemDataRef = useRef(itemData);

  const handleButtonPress = useCallback(() => {
    const currentData = itemDataRef.current;
    if (currentData?.caseTypeActivityInfo) {
      setEntityFormData({
        ...currentData,
        caseActivityId: currentData?.id,
        name: currentData?.caseTypeActivityInfo?.name,
        caseTypeActivityTypeCL: currentData?.caseTypeActivityInfo?.caseTypeActivityTypeCL,
        humanTaskTypeCode: currentData?.caseTypeActivityInfo?.humanTaskTypeCode,
        processTaskTypeCode: currentData?.caseTypeActivityInfo?.processTaskTypeCode,
        activityCaseTypeCode: currentData?.caseTypeActivityInfo?.activityCaseTypeCode,
        phaseCode: currentData?.caseTypeActivityInfo?.phaseCode,
        repeatAllowed: currentData?.caseTypeActivityInfo?.repeatAllowed,
        cancelAllowed: currentData?.caseTypeActivityInfo?.cancelAllowed,
        cancelReasonRequired: currentData?.caseTypeActivityInfo?.cancelReasonRequired,
      });
    }
  }, [setEntityFormData]);

  const handleArrowClick = useCallback(
    (direction: string): void => {
      const items = parentsArray || [];
      const adjacentItemIdx = direction === 'upwards' ? index - 1 : index + 1;
      if (adjacentItemIdx < 0 || adjacentItemIdx >= items?.length) return;
      const updated = [...items];
      [updated[index], updated[adjacentItemIdx]] = [updated[adjacentItemIdx], updated[index]];
      const renumberedItems = updated?.map((item: Record<string, unknown>, i: number) => ({
        ...item,
        order: i + 1,
      }));
      setParentArray(renumberedItems);
    },
    [index, parentsArray, setParentArray],
  );

  // Keep a reference of initial record data in case user cancels editing
  const refData = useRef(itemData);

  const [editDialogIsOpen, setDialogOpen] = useState(isNew || false);

  const backupItemData = (data) => {
    refData.current = JSON.parse(JSON.stringify(data || {}));
  };

  const onActionCustomButtonCallback = useCallback(() => {
    setDialogOpen(false);
    onActionComplete();
  }, [onActionComplete]);

  const onEditPressed = () => {
    setDialogOpen(true);
  };

  const onSavePressed = useCallback(
    (data) => {
      backupItemData(data);
      setDialogOpen(false);
      onActionComplete();
    },
    [onActionComplete],
  );

  const onSaveCancelPressed = useCallback(() => {
    if (isNew) {
      removeItem(index);
    } else {
      setFieldValue(refData.current);
    }
    setDialogOpen(false);
    onActionComplete();
  }, [isNew, onActionComplete, removeItem, index, setFieldValue]);

  const onDuplicatePressed = useCallback(() => {
    onItemDuplicated(itemData);
  }, [itemData, onItemDuplicated]);

  /**
   * This is to synchronise parent data, so that when a child is added, the related parent is "aware of the addition"
   * Fixes issue IRM-13493
   */
  useEffect(() => {
    const childrenName = getChildrenKeyName(schema);
    if (childrenName && itemData) {
      if (
        JSON.stringify(itemData[childrenName] || []) !==
        JSON.stringify(refData.current[childrenName] || [])
      ) {
        backupItemData(itemData);
      }
    }
  }, [itemData, schema]);

  useEffect(() => {
    itemDataRef.current = itemData;
  }, [itemData]);

  const defaultActions = {
    EDIT: {
      type: 'EDIT',
      title: 'edit',
      icon: 'EDIT',
      onClick: onEditPressed,
      style: 'simple',
      permissionKey: 'defaultItemActions',
    },
    VIEW: {
      type: 'VIEW',
      icon: 'VIEW',
      onClick: onEditPressed,
      style: 'icon',
      permissionKey: 'defaultItemActions',
      title: 'view',
    },
    DUPLICATE: {
      type: 'DUPLICATE',
      title: 'duplicate',
      icon: 'DUPLICATE',
      onClick: onDuplicatePressed,
      style: 'simple',
    },
    DELETE: {
      type: 'DELETE',
      title: 'delete',
      icon: 'DELETE',
      onClick: () => removeItem(index),
      style: 'simple',
      permissionKey: 'defaultItemActions',
    },
  };
  const infoValue = useMultipleFormData(fieldId, info) as Array<DataSourceSchema>;

  return (
    <Fragment key={key}>
      <TreeItemContainer
        id={fieldId}
        depth={depth}
        onClickExpandCollapseIcon={() => onToggleCollapse(fieldId, collapsed)}
        isCollapsed={collapsed}
        displayExpandCollapseIcon={
          getSchemaHasChildren(schema) && itemData?.childrenActivities?.length > 0
        }
        buttons={buttons}
        hasError={!isFormValidServerSide}
        defaultActions={defaultActions}
        infoValue={infoValue}
        entityTitle={entityTitle}
        changeIndicators={globalChangeIndicators ?? changeIndicators}
        indicatorStatus={itemData.__STATUS__}
        manuallyAdded={itemData?.manuallyAddedSw}
        onButtonPress={handleButtonPress}
        onArrowClick={handleArrowClick}
        isFirst={index === 0}
        isLast={index === (parentsArray?.length ?? 0) - 1}
      >
        {getItemOnReadModeWithoutChildren(schema, uiSchema, children, namespace)}
      </TreeItemContainer>

      {(isNew || editDialogIsOpen) && (
        <SimpleDialog
          id={fieldId}
          open={isNew || editDialogIsOpen}
          size={modalSize}
          title={entityTitle}
          onClose={onSaveCancelPressed}
          buttons={
            <ActionDialogButtons
              id={fieldId}
              onSubmit={() => onSavePressed(itemData)}
              onCancel={onSaveCancelPressed}
              buttons={modalButtons}
              onSuccessCallback={onActionCustomButtonCallback}
            />
          }
        >
          <DynamicForm
            id={fieldId}
            data={children.props.formData}
            disabled={false}
            schema={dropChildrenFromSchema(schema)}
            uiSchema={getItemUiSchema(uiSchema, namespace)}
          />
        </SimpleDialog>
      )}
      {!collapsed && getItemChildrenOnReadMode(schema, uiSchema, children, namespace)}
    </Fragment>
  );
};
export default TreeItem;
