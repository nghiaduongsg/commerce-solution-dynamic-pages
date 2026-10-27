import React, { useCallback, useMemo } from 'react';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useFormField from '@pkg-entity/hooks/useFormField';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import useFormArrayFieldSelections from '@pkg-entity/hooks/useFormArrayFieldSelections';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';
import { AnyType } from '@pkg-common/types';
import { ChangeIndicatorsSchema } from '@pkg-form/types';

const InlineEditingNode = ({
  id,
  parentId,
  index,
  schema,
  uiSchema,
  buttons,
  removable,
  selectable,
  disabled,
  multiple,
  item,
  changeIndicators,
}: {
  id: string;
  parentId: string;
  index: number;
  schema: AnyType;
  uiSchema: AnyType;
  removable: boolean;
  selectable: boolean;
  multiple: boolean;
  item: AnyType;
  disabled?: boolean;
  buttons?: AppActionButtons;
  changeIndicators?: ChangeIndicatorsSchema;
}) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

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

  const itemStatus = item?.__STATUS__;

  return (
    <GenericCard
      id={id}
      title={undefined}
      changeIndicators={changeIndicators}
      indicatorStatus={itemStatus}
      actions={
        <>
          {removable && !disabled && (
            <GenericIconButton
              id={`${parentId}_${index}-delete-btn`}
              testId={`delete-item-${index}`}
              label={translate('delete', { ns: COMMON, lng: selectedLanguage })}
              ariaLabel={translate('delete', { ns: COMMON, lng: selectedLanguage })}
              ariaDescription={translate('deleteAriaDescription', {
                ns: ACCESSIBILITY,
                id,
                lng: selectedLanguage,
              })}
              onClick={() => removeItem(index)}
              icon={
                <AssetByType input="icons" name="DeleteForever" props={{ className: 'primary' }} />
              }
            />
          )}
          {selectable && (
            <GenericIconButton
              id={`${parentId}_${index}-select-btn`}
              testId={`select-item-${index}`}
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
      <DynamicForm id={id} schema={schema} uiSchema={uiSchema} data={item} />
    </GenericCard>
  );
};

export default React.memo(
  InlineEditingNode,
  (prev, next) => JSON.stringify(prev.item || {}) === JSON.stringify(next.item || {}),
);
