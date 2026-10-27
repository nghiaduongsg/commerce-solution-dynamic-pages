import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { EDIT_ITEM_STATUS, NEW_ITEM_STATUS } from '@pkg-constants/formCard';
import { useEffect, useMemo, useState } from 'react';
import { cleanDuplicatedData, setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import { AnyType } from '@pkg-common/types';
import useDefaultArrayItems from './useDefaultArrayItems';
import useUniqueArrayItems from './useUniqueArrayItems';
import { cloneDeep, isArray } from 'lodash';
import useClearFrom from '@pkg-form/hooks/useClearFrom';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { getFormIdFromWidgetId } from '@pkg-common/utils';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const convertUiSchemaToReadMode = (uiSchema) => {
  const newUiSchema = cloneDeep(uiSchema);
  delete newUiSchema['ui:groups'];

  for (const property in newUiSchema) {
    newUiSchema[property]['ui:readonly'] = true;
    newUiSchema[property]['ui:disabled'] = true;
  }
  newUiSchema['lastUiUpdate'] = new Date().getTime();

  return newUiSchema;
};

const useArrayTemplate = ({ fieldId, items, options, rootFormDisabled, canAdd, disabled }) => {
  const {
    validations,
    uniqueFields,
    disabledFrom,
    defaultValueFrom,
    clearFrom,
    omitAddNew = false,
    unique = false,
    subform,
    applyAddWhen,
    validateWhen,
  } = options;

  const { selectedLanguage } = useSystem();

  const [cardUiSchema, setCardUiSchema] = useState(0);
  const [cardSchema, setCardSchema] = useState<AnyType>(0);

  const { addItem } = useFormField(fieldId);
  const [newItemIndex, setNewItemIndex] = useState<number>(-1);

  const { check: disabledFromValue } = useCheckFrom(fieldId, disabledFrom);
  const { check: shouldValidate } = useCheckFrom(fieldId, validateWhen, true);

  const clearLocalState = () => {
    setNewItemIndex(-1);
  };

  const { check: applyUnderCondition } = useCheckFrom(fieldId, applyAddWhen);

  const shouldApplyAddNew = useMemo(() => {
    let shouldApply = true;

    if (applyAddWhen) {
      shouldApply = applyUnderCondition;
    }

    return shouldApply;
  }, [fieldId, applyUnderCondition, applyAddWhen]);

  const { value, setFieldValue } = useFormField(fieldId);

  useDefaultArrayItems(fieldId, defaultValueFrom, items, subform);
  useUniqueArrayItems(fieldId, items, unique);
  useClearFrom(fieldId, clearFrom);

  useEffect(() => {
    // Calculate card ui schema only ONCE and store it in state for performance reasons
    if (items && items.length > 0 && !cardUiSchema) {
      const newCardUiSchema = convertUiSchemaToReadMode(items[0].children.props.uiSchema);
      setCardUiSchema(newCardUiSchema);
      setCardSchema(items[0].children.props.schema);
    }

    // Clear local state if there are no items
    if (items.length === 0) {
      clearLocalState();
    }
  }, [items]);

  useEffect(() => {
    if (items?.length === 0 && isArray(value) && value?.length > 0 && !cardUiSchema) {
      setFieldValue(value);
    }
  }, [items, value]);

  const formId = getFormIdFromWidgetId(fieldId);
  const { formData: data } = useEntityFormData(formId);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const disabledFromOwner = useMemo(() => {
    if (formId?.includes('filters')) {
      return false;
    }
    if (
      formId === 'CodelistItem' ||
      formId === 'Codelist' ||
      formId === 'IssCodelistItem' ||
      formId === 'IssCodelist' ||
      formId === 'SecurableObject'
    ) {
      return false;
    }
    if (data.ownerCL === 'BASE') {
      return true;
    }
    return false;
  }, [formId, data]);

  const showAddNew = useMemo(() => {
    return (
      canAdd &&
      !rootFormDisabled &&
      !disabled &&
      !disabledFromOwner &&
      !disabledFromValue &&
      (validations?.maxLength || Number.MAX_SAFE_INTEGER) > items.length &&
      !omitAddNew &&
      shouldApplyAddNew
    );
  }, [items, rootFormDisabled, disabled, disabledFromValue, omitAddNew, shouldApplyAddNew]);

  const addNewItem = (status: string, itemData: AnyType) => {
    addItem(itemData);
    if (status === NEW_ITEM_STATUS) {
      setNewItemIndex((items || []).length);
    }
  };

  const onItemAdded = () => {
    addNewItem(NEW_ITEM_STATUS, cardSchema?.type === 'string' ? '' : {});
  };

  const onItemSaved = () => {
    setAnnouncement(
      `${fieldId}-alert-help-text-card`,
      translate('newItemAdded', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
      }),
    );
  };

  const onItemDuplicated = (itemData) => {
    addNewItem(EDIT_ITEM_STATUS, cleanDuplicatedData(uniqueFields, itemData));
    setAnnouncement(
      `${fieldId}-alert-help-text-card`,
      translate('itemDuplicated', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
        count: items?.length + 1,
      }),
    );
  };

  const onItemDeleted = () => {
    setAnnouncement(
      `${fieldId}-alert-help-text-card`,
      translate('itemDeleted', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
        count: items?.length - 1,
      }),
    );
  };

  return {
    clearLocalState,
    onItemAdded,
    onItemSaved,
    onItemDuplicated,
    onItemDeleted,
    newItemIndex,
    isDisabled: disabledFromValue || rootFormDisabled || disabledFromOwner,
    shouldValidate,
    addEnabled: showAddNew,
    cardUiSchema,
    cardSchema,
  };
};

export default useArrayTemplate;
