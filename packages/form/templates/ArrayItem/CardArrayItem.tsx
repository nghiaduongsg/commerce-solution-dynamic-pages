import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardArrayItemProps } from './CardArrayItem.d';
import {
  CANCELED_STATUS,
  DELETE_STATUS,
  EDIT_STATUS,
  NEW_STATUS,
  SAVED_STATUS,
} from '@pkg-constants/formCard';
import DynamicSubformItem from '@pkg-form/templates/ArrayItem/DynamicSubformItem';
import ConfigurableSubformItem from '@pkg-form/templates/ArrayItem/ConfigurableSubformItem';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { createDisplayValue } from '@pkg-form/validations/utils/formUtils';
import useFormField from '@pkg-entity/hooks/useFormField';
import ConfirmationBox from '@pkg-common/components/ConfirmationBox/ConfirmationBox';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import ActionDialogButtons from '@pkg-common/components/AppActions/ActionDialogButtons';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { prepareCorrectionsObject } from '@pkg-form/validations/utils/correctionsUtils';
import TableItem from '@pkg-form/templates/ArrayItem/TableItem/TableItem';
import CardItem from '@pkg-form/templates/ArrayItem/CardItem/CardItem';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { cloneDeep, isEqual } from 'lodash';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const CardArrayItem = forwardRef<HTMLDivElement, CardArrayItemProps>(
  (
    {
      item,
      formId,
      parentId,
      label,
      namespace,
      onDeleteItemPressed,
      onItemDuplicated,
      onActionComplete,
      onSaveItem,
      disabled,
      cardUiSchema,
      options,
      buttons,
      cardColors,
      modalButtons,
      changeIndicators,
    }: CardArrayItemProps,
    ref,
  ) => {
    const { children, isNew, index, view } = item;
    const { clearDirtyFlags } = useFormManagerContext();
    const childOptions = useMemo(() => {
      return children?.props?.uiSchema['ui:options'] || {};
    }, [children?.props?.uiSchema]);

    const { check: itemDisabled } = useCheckFrom(
      `${parentId}_${index}`,
      childOptions?.disabledFrom,
      false,
    );

    const { check: itemVisibility } = useCheckFrom(
      `${parentId}_${index}`,
      childOptions?.visibilityFrom,
      true,
    );

    const {
      modalSize = 'sm',
      subform,
      allowCardItemDialogActionsFrom,
      translation = {},
      cardVisibility = true,
      logChangeWhen,
      icon,
    } = JSON.parse(options);

    const { setEntityFormData, getLatestEntityFormData } = useEntityFormData(formId);

    const { populatedField, defaultFields } = subform || {};
    const { removeItem } = useFormField(parentId);
    const { value: itemData, setFieldValue } = useFormField(`${parentId}_${index}`);
    const { clearEntityFormData } = useEntityFormData(TRANSITION_FORM);
    // Keep a reference of initial record data in case user cancels editing
    const refData = useRef(itemData);

    // States are NEW, SAVED, CANCEL, EDIT each corresponding to the array item status each time.
    const [status, setStatus] = useState(isNew ? NEW_STATUS : '');
    const [localData, setLocalData] = useState(itemData);

    useEffect(() => {
      if (status === SAVED_STATUS) {
        backupItemData(itemData);
        setLocalData({});
      }
    }, [status, itemData]);

    const { check: allowModalButtons } = useCheckFrom(parentId, allowCardItemDialogActionsFrom);
    const { check: logChanges } = useCheckFrom(parentId, logChangeWhen, false);
    const { selectedLanguage } = useSystem();
    const { t: translate } = useTranslation([COMMON, namespace || '']);

    useEffect(() => {
      const differentData = !isEqual(localData, itemData);

      if (status === EDIT_STATUS && differentData) {
        if (!itemData || !Object.keys(itemData).length) {
          return;
        }
        if (!localData || !Object.keys(localData).length) {
          setLocalData(itemData);
        }
      }
    }, [status, itemData, localData]);

    const itemDataHasChanged = useMemo(() => {
      return (
        localData &&
        itemData &&
        !isEqual(localData, itemData) &&
        Object.keys(itemData || {}).length > 0
      );
    }, [itemData, localData]);

    const backupItemData = (data) => {
      refData.current = JSON.parse(JSON.stringify(data || {}));
    };

    const title = useMemo(() => {
      return translate(translation?.key || label, { ns: namespace ?? '' });
    }, [translation, namespace]);

    const onDuplicatePressed = useCallback(() => {
      onItemDuplicated(itemData);
    }, [itemData]);

    const onEditPressed = () => {
      const currentDataSnapshot = cloneDeep(itemData || {});
      refData.current = currentDataSnapshot;
      setLocalData(currentDataSnapshot);
      clearDirtyFlags(`${parentId}_${index}`);
      setStatus(EDIT_STATUS);
    };

    // SAVE ITEM ACTIONS FROM ADD OR EDIT
    const onSavePressed = () => {
      const currentSnapshot = cloneDeep(itemData || {});
      refData.current = currentSnapshot;
      setLocalData(currentSnapshot);
      setStatus(SAVED_STATUS);
      onActionComplete();
      clearEntityFormData();
      clearDirtyFlags(`${parentId}_${index}`);
      if (onSaveItem && isNew) {
        onSaveItem();
      }
    };

    const onSaveCancelPressed = () => {
      if (!itemDisabled) {
        if (status === NEW_STATUS) {
          removeItem(index);
        } else {
          setFieldValue(refData.current, undefined, { type: 'CANCEL' });
        }
      }

      setStatus(CANCELED_STATUS);
      onActionComplete();
      setLocalData(cloneDeep(refData.current));
      clearDirtyFlags(`${parentId}_${index}`);
    };

    // DELETE ITEM ACTIONS
    const onDeletePressed = useCallback(() => {
      setStatus(DELETE_STATUS);
      onDeleteItemPressed(index - 1);
    }, []);

    const onDeleteConfirmPressed = (tempFormData) => {
      if (logChanges && tempFormData) {
        // TODO: additions should be treated the same way as deletions for corrections
        const latestFormData = cloneDeep(getLatestEntityFormData());

        const formCorrectionsObj = prepareCorrectionsObject(
          tempFormData,
          parentId,
          latestFormData,
          refData.current,
        );

        setEntityFormData({
          ...latestFormData,
          ['formCorrections']: {
            ...formCorrectionsObj,
          },
        });
      }
      removeItem(index);
      onDeleteItemPressed(index - 1);
      clearEntityFormData();
    };

    const onDeleteCancelPressed = () => {
      setStatus(CANCELED_STATUS);
      onActionComplete();
    };

    const onActionCustomButtonCallback = useCallback(() => {
      setStatus(SAVED_STATUS);
      onActionComplete();
    }, [setStatus, onActionComplete]);

    const hasCustomModalButtons = useMemo(() => {
      return !!cardUiSchema?.actionsButtons;
    }, [cardUiSchema]);

    useEffect(() => {
      if (populatedField || defaultFields) {
        const finalData = {
          ...itemData,
          ...createDisplayValue(itemData, subform),
        };
        setFieldValue(finalData);
      }
    }, [itemData]);

    if (!itemVisibility) {
      return null;
    }

    return (
      <>
        {status === NEW_STATUS ? null : view === 'card' ? (
          <CardItem
            ref={ref}
            id={`${parentId}_${index}`}
            parentId={parentId}
            formId={formId}
            item={item}
            onDelete={onDeletePressed}
            onDeleteConfirmPressed={onDeleteConfirmPressed}
            onEdit={onEditPressed}
            onDuplicate={onDuplicatePressed}
            icon={icon}
            buttons={buttons}
            cardColors={cardColors}
            cardUiSchema={cardUiSchema}
            cardVisibility={cardVisibility}
            changeIndicators={changeIndicators}
          />
        ) : (
          <TableItem
            id={`${parentId}_${index}`}
            parentId={parentId}
            formId={formId}
            item={item}
            onDelete={onDeletePressed}
            onDeleteConfirmPressed={onDeleteConfirmPressed}
            onEdit={onEditPressed}
            onDuplicate={onDuplicatePressed}
            buttons={buttons}
          />
        )}
        <ConfirmationBox
          open={status === DELETE_STATUS}
          onClose={onDeleteCancelPressed}
          message={translate('confirmationDeleteMessage', { ns: COMMON, lng: selectedLanguage })}
          choices={[
            {
              label: translate('cancel', { ns: COMMON, lng: selectedLanguage }),
              variant: 'outlined',
              action: onDeleteCancelPressed,
            },
            {
              label: translate('confirm', { ns: COMMON, lng: selectedLanguage }),
              variant: 'contained',
              action: onDeleteConfirmPressed,
            },
          ]}
        />
        {(status === NEW_STATUS || status === EDIT_STATUS) && (
          <SimpleDialog
            id={`${parentId}_${index}`}
            open={status === NEW_STATUS || status === EDIT_STATUS}
            title={
              disabled
                ? translate('viewItem', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                    title,
                    count: index + 1,
                    ordinal: true,
                  })
                : translate(status === EDIT_STATUS ? 'editItem' : 'addNewItem', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                    title,
                    count: index + 1,
                    ordinal: true,
                  })
            }
            size={modalSize}
            onClose={onSaveCancelPressed}
            buttons={
              (!disabled || allowModalButtons || !itemDisabled) && (
                <ActionDialogButtons
                  id={`${parentId}_${index}`}
                  onSubmit={
                    hasCustomModalButtons || !itemDataHasChanged || itemDisabled
                      ? undefined
                      : () => {
                          onSavePressed();
                        }
                  }
                  onCancel={onSaveCancelPressed}
                  buttons={modalButtons}
                  onSuccessCallback={onActionCustomButtonCallback}
                />
              )
            }
          >
            <>
              {subform && subform.type === 'SUB_SCHEMA' && (
                <ConfigurableSubformItem
                  id={`${parentId}_${index}`}
                  subform={subform}
                  item={item}
                  disabled={disabled}
                  namespace={namespace}
                />
              )}
              {subform && (subform.type === 'ELEMENTS' || subform.type === 'BANK_ELEMENTS') && (
                <DynamicSubformItem
                  id={`${parentId}_${index}`}
                  subform={subform}
                  disabled={disabled}
                  namespace={namespace}
                  schema={item?.children?.props?.schema}
                  uiSchema={item?.children?.props?.uiSchema}
                  formData={item?.children?.props?.formData || {}}
                />
              )}
              {!subform && children}
            </>
          </SimpleDialog>
        )}
      </>
    );
  },
);

export default CardArrayItem;
