import React, { useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import BasicItem from './BasicItem/BasicItem';
import ArrayErrorContainer from '@pkg-form/templates/ArrayTemplate/ArrayErrorContainer';
import { ArrayTemplateProps } from '../ArrayTemplate.d';
import { calculateGridSize } from '@pkg-form/validations/utils/formUtils';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useTranslation } from 'react-i18next';
import useArrayTemplate from '@pkg-form/templates/ArrayTemplate/hooks/useArrayTemplate';
import useSystem from '@pkg-setup/src/system/useSystem';
import useItemsPrefilling from '@pkg-form/templates/hooks/useItemsPrefilling';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useDisableValues from '@pkg-form/templates/ArrayTemplate/hooks/useDisableValues';
import { hasValue } from '@pkg-common/utils';
import GenericInfoCard from '@pkg-common/atomics/GenericInfoCard/GenericInfoCard';

const itemTemplateStyle = {
  height: '100%',
  marginBottom: 8,
};

const BasicTemplate = (props: ArrayTemplateProps) => {
  const {
    canAdd,
    items,
    uiSchema,
    onAddClick,
    idSchema,
    disabled: rootFormDisabled,
    itemViewAction,
    defaultItemActions,
  } = props;

  const fieldId = idSchema.$id;

  const options = uiSchema['ui:options'] || {};
  const buttons = uiSchema['ui:buttons'] || defaultItemActions;
  const disabled = uiSchema['ui:disabled'];
  const readonly = uiSchema['ui:readonly'];

  const {
    validations,
    arrayColumns = {},
    visibleInCard = true,
    shouldConvertToCards,
    selectable,
    multiple,
    hasRemove,
    uniqueFields,
    defaultValueFrom,
    warnOnAction,
    changeIndicators,
  } = options;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const { onItemAdded, addEnabled, isDisabled, shouldValidate, cardSchema, cardUiSchema } =
    useArrayTemplate({
      fieldId,
      items,
      options,
      rootFormDisabled,
      canAdd,
      disabled,
    });

  useDisableValues({
    fieldId,
    items,
    options,
  });
  useItemsPrefilling(fieldId, items, defaultValueFrom);
  useDefaultValueFrom(fieldId, defaultValueFrom);

  const addNewItem = useCallback(() => {
    onItemAdded();
    onAddClick();
  }, []);

  if (readonly && disabled && !visibleInCard) {
    return null;
  }

  return (
    <Grid container spacing={2} style={{ width: '100%' }}>
      <ArrayErrorContainer
        fieldId={fieldId}
        items={items}
        validations={shouldValidate ? validations : undefined}
      />
      <Grid size={{ xs: 12 }}>
        <Grid
          container
          alignItems="stretch"
          justifyContent="flex-start"
          wrap="wrap"
          direction="row"
          spacing={3}
        >
          {items.map((item, index) => (
            <Grid
              key={item.key}
              size={{
                xs: arrayColumns['xs'] || 12,
                sm: arrayColumns['sm'] || 12,
                md: arrayColumns['md'] || 12,
                lg: arrayColumns['lg'] || 12,
              }}
              style={shouldConvertToCards ? {} : itemTemplateStyle}
            >
              <BasicItem
                id={`${fieldId}_${index}`}
                item={{
                  ...item,
                  uniqueFields,
                  selectable,
                  multiple,
                  disabled: isDisabled,
                  hasRemove,
                }}
                buttons={disabled && !shouldConvertToCards ? itemViewAction : buttons}
                parentId={fieldId}
                warnOnAction={warnOnAction}
                schema={cardSchema}
                uiSchema={cardUiSchema}
                changeIndicators={changeIndicators}
              />
            </Grid>
          ))}
          {!addEnabled && items?.length <= 0 && (
            <GenericInfoCard
              info={translate('noItemsAdded', { ns: COMMON, lng: selectedLanguage })}
            />
          )}
          {addEnabled && (
            <Grid
              size={{
                xs: calculateGridSize(items.length, arrayColumns['xs']),
                sm: calculateGridSize(items.length, arrayColumns['sm']),
                md: calculateGridSize(items.length, arrayColumns['md']),
                lg: calculateGridSize(items.length, arrayColumns['lg']),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'left',
                  paddingBottom: 4,
                  alignItems: 'center',
                }}
              >
                {!items.length && (
                  <Typography style={{ paddingTop: 2, color: '#0000008a', fontSize: 13 }}>
                    {translate('pressAdd', { ns: COMMON, lng: selectedLanguage })}
                  </Typography>
                )}
                <GenericIconButton
                  id={`${fieldId}-add-new`}
                  testId={`${fieldId}-add-new`}
                  label={translate('addNew', { ns: COMMON, lng: selectedLanguage })}
                  ariaLabel={translate('addNew', { ns: COMMON, lng: selectedLanguage })}
                  ariaDescription={translate('addNewAriaDescription', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  onClick={addNewItem}
                  ariaHasPopup={true}
                  ariaControls={'confirmation-dialog'}
                  icon={<AssetByType input="icons" name="AddCircle" />}
                  warning={hasValue(warnOnAction) ? { ...warnOnAction, fieldId } : undefined}
                />
              </div>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default BasicTemplate;
