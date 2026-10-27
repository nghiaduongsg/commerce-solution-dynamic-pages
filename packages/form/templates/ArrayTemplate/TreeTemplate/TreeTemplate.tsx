import React, { useCallback, useEffect, useState } from 'react';
import CardButton from '@pkg-common/atomics/CardButton/CardButton';
import { Box, Grid, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TreeItem from './TreeItem/TreeItem';
import { getAddNewButtonPaddingLeft } from './utils';
import useItemsPrefilling from '@pkg-form/templates/hooks/useItemsPrefilling';
import { ArrayTemplateProps } from '../ArrayTemplate.d';
import useFormField from '@pkg-entity/hooks/useFormField';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { EDIT_ITEM_STATUS, NEW_ITEM_STATUS } from '@pkg-constants/formCard';
import ArrayErrorContainer from '@pkg-form/templates/ArrayTemplate/ArrayErrorContainer';
import { cleanDuplicatedData } from '@pkg-form/validations/utils/formUtils';
import useDefaultArrayItems from '../hooks/useDefaultArrayItems';
import { AnyType } from '@pkg-common/types';
import useValueFrom from '@pkg-form/hooks/useValueFrom';
import useUniqueArrayItems from '../hooks/useUniqueArrayItems';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const useStyles = (depth: number, theme: Theme): { addNewButtonContainer: object } => {
  return {
    addNewButtonContainer: {
      paddingLeft: getAddNewButtonPaddingLeft(depth),
      marginBottom: theme?.spacing(3),
    },
  };
};

const getButtons = (
  omitActions: boolean,
  rootFormDisabled: boolean,
  itemViewAction: AnyType,
  buttons: AnyType,
): AnyType => {
  if (omitActions) {
    return null;
  }

  if (rootFormDisabled) {
    return itemViewAction;
  }

  return buttons;
};

const TreeTemplate = ({
  items = [],
  uiSchema,
  schema,
  idSchema,
  formContext,
  defaultItemActions,
  itemViewAction,
  disabled: rootFormDisabled,
}: ArrayTemplateProps) => {
  const {
    depth,
    defaultValueFrom,
    translation,
    childrenVisibilityProperty = '',
    validations,
    subform,
    sortBy,
    omitAddNew = false,
    uniqueFields,
    collapsed: initialCollapsedState = true,
    valueFrom,
    omitActions = false,
    unique = false,
    modalSize = 'sm',
    changeIndicators,
  } = uiSchema['ui:options'];
  const buttons = uiSchema['ui:buttons'] || defaultItemActions;
  const modalButtons = uiSchema['ui:modal:buttons'];
  const info = uiSchema['ui:info'] || [];
  const theme: Theme = useTheme();
  const styles: { addNewButtonContainer: object } = useStyles(depth, theme);
  const fieldId: string = idSchema.$id;
  const { addItem, reorderItems } = useFormField(fieldId);
  const [newItemIndex, setNewItemIndex] = useState<number>(-1);
  const [expandedStateInitialised, setExpandedStateInitialised] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<Array<string>>([]);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, formContext?.namespace || '']);

  useEffect(() => {
    if (items.length > 0 && !initialCollapsedState && !expandedStateInitialised) {
      setExpandedItems(items?.map((item) => `${fieldId}_${item.index}`));
      setExpandedStateInitialised(true);
    }
  }, [items, initialCollapsedState, expandedStateInitialised, fieldId]);

  const clearLocalState = useCallback(() => {
    setNewItemIndex(-1);
    if (sortBy) {
      reorderItems(sortBy?.field);
    }
  }, [reorderItems, sortBy]);

  const addNewItem = (status: string, itemData: AnyType) => {
    addItem(itemData);
    if (status === NEW_ITEM_STATUS) {
      setNewItemIndex((items || []).length);
    }
  };

  const onItemAdded = (): void => {
    addNewItem(NEW_ITEM_STATUS, {});
  };

  const onItemDuplicated = (itemData: AnyType): void => {
    addNewItem(EDIT_ITEM_STATUS, cleanDuplicatedData(uniqueFields, itemData));
  };

  const handleToggleCollapse = (id: string, collapsed: boolean): void => {
    setExpandedItems((itemsData: string[]) =>
      collapsed
        ? [...itemsData, id]
        : itemsData?.filter((itemId: string): boolean => itemId !== id),
    );
  };

  useItemsPrefilling(fieldId, items, defaultValueFrom);
  useDefaultArrayItems(fieldId, defaultValueFrom, items, subform);
  useValueFrom(fieldId, valueFrom);
  useUniqueArrayItems(fieldId, items, unique);

  return (
    <Grid container>
      <Box
        id={`${fieldId}-alert-help-text`}
        role="alert"
        aria-live="polite"
        sx={{ fontSize: theme?.typography?.body2?.fontSize, margin: '8px 0px 8px 32px' }}
      />
      <ArrayErrorContainer fieldId={fieldId} items={items} validations={validations} />
      <Grid size={{ xs: 12 }}>
        {items?.map((item) => (
          <TreeItem
            key={item.key}
            parentId={fieldId}
            formContext={formContext}
            depth={depth}
            item={{ ...item, isNew: item.index === newItemIndex }}
            entityTitle={
              translation?.key
                ? translate(translation?.key, { ns: formContext.namespace ?? '' })
                : schema.title
            }
            onItemDuplicated={onItemDuplicated}
            onActionComplete={clearLocalState}
            visibilityProperty={childrenVisibilityProperty}
            onToggleCollapse={handleToggleCollapse}
            collapsed={expandedItems.indexOf(`${fieldId}_${item.index}`) < 0}
            buttons={getButtons(omitActions, rootFormDisabled, itemViewAction, buttons)}
            info={info}
            modalButtons={modalButtons}
            modalSize={modalSize}
            changeIndicators={changeIndicators}
          />
        ))}
      </Grid>
      {!omitAddNew && (
        <Grid size={{ xs: 12 }} sx={styles.addNewButtonContainer}>
          <CardButton
            id={idSchema.$id}
            fullHeight
            ctaAction={onItemAdded}
            ctaLabel={translate('addNew', { ns: COMMON, lng: selectedLanguage })}
            ariaDescription={translate('addNewAriaDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
              field: translation?.key
                ? translate(translation?.key, {
                    ns: formContext.namespace ?? '',
                    lng: selectedLanguage,
                  })
                : schema.title,
            })}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default TreeTemplate;
