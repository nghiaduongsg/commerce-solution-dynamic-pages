import React, { useCallback, useMemo } from 'react';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { BasicItemProps } from './BasicItem.d';
import useFormField from '@pkg-entity/hooks/useFormField';
import useFormArrayFieldSelections from '@pkg-entity/hooks/useFormArrayFieldSelections';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { hasValue } from '@pkg-common/utils';
import useValidations from '@pkg-form/validations/hooks/useValidations';

const BasicItem = ({
  id,
  item,
  buttons,
  parentId,
  warnOnAction,
  schema,
  uiSchema,
  changeIndicators,
}: BasicItemProps) => {
  const { children, hasRemove = false, index, selectable, multiple = true, disabled } = item;
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const validations = useMemo(() => {
    const isObject = schema?.type === 'object';

    return isObject ? {} : uiSchema?.['ui:options']?.validations || {};
  }, [uiSchema, schema]);

  useValidations(id, item?.children?.props?.formData, schema?.type, validations);

  const { removeItem } = useFormField(parentId);
  const { fieldSelectedIndices, selectArrayItems, deselectArrayItems } =
    useFormArrayFieldSelections(parentId);

  const isSelected = useMemo(() => {
    return fieldSelectedIndices?.indexOf(index) >= 0;
  }, [index, fieldSelectedIndices]);

  const toggleItemSelection = useCallback(() => {
    if (isSelected) {
      deselectArrayItems([index]);
    } else {
      selectArrayItems([index], multiple);
    }
  }, [isSelected, index, selectArrayItems, deselectArrayItems]);

  const onDelete = useCallback(() => {
    removeItem(item.index);
    item.onDropIndexClick(item.index)();
  }, [removeItem, item]);

  const itemFormData = item?.children?.props?.formData || {};
  const itemStatus = itemFormData?.__STATUS__;

  return (
    <GenericCard
      id={id}
      title={`${parentId}_${index}`}
      showTitle={false}
      changeIndicators={changeIndicators}
      indicatorStatus={itemStatus}
      actions={
        <>
          {hasRemove && !disabled && (
            <GenericIconButton
              id={`${parentId}_${index}-delete-btn`}
              testId={`delete-item-${item.index}`}
              label={translate('delete', { ns: COMMON, lng: selectedLanguage })}
              ariaLabel={translate('delete', { ns: COMMON, lng: selectedLanguage })}
              ariaDescription={translate('deleteAriaDescription', {
                ns: ACCESSIBILITY,
                id,
                lng: selectedLanguage,
              })}
              onClick={onDelete}
              icon={<AssetByType input="icons" name="DeleteForever" />}
              warning={hasValue(warnOnAction) ? { ...warnOnAction, fieldId: id } : undefined}
            />
          )}
          {selectable && (
            <GenericIconButton
              id={`${parentId}_${index}-select-btn`}
              testId={`select-item-${item.index}`}
              label={translate('select', { ns: COMMON, lng: selectedLanguage })}
              ariaLabel={translate('select', { ns: COMMON, lng: selectedLanguage })}
              ariaDescription={translate('selectAriaDescription', {
                ns: ACCESSIBILITY,
                id,
                lng: selectedLanguage,
              })}
              onClick={toggleItemSelection}
              icon={
                <AssetByType
                  input="icons"
                  name="CheckBox"
                  props={{ style: { color: isSelected ? 'green' : 'gray' } }}
                />
              }
            />
          )}
          <AppActions page={{ id }} actions={buttons} checkPermissions={true} defaultActions={{}} />
        </>
      }
    >
      {children}
    </GenericCard>
  );
};
export default BasicItem;
