import React, { useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import ArrayErrorContainer from '@pkg-form/templates/ArrayTemplate/ArrayErrorContainer';
import { calculateGridSize } from '@pkg-form/validations/utils/formUtils';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useItemsPrefilling from '@pkg-form/templates/hooks/useItemsPrefilling';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useDisableValues from '@pkg-form/templates/ArrayTemplate/hooks/useDisableValues';
import useFormField from '@pkg-entity/hooks/useFormField';
import InlineEditingNode from '@pkg-form/components/ArrayInlineEditingHandler/InlineEditingNode';
import { ArrayHandlerOptions, FormWidgetProps } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

const itemTemplateStyle = {
  height: '100%',
  marginBottom: 8,
};

const ArrayInlineEditingHandler = ({
  id,
  options,
  formContext,
  onChange,
  value: innerValue,
  schema,
  uiSchema,
  disabled: isArrayDisabled,
}: FormWidgetProps & { options: ArrayHandlerOptions }) => {
  const { mechanism, changeIndicators: globalChangeIndicators } = formContext || {};

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { value: items, addItem } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const {
    validations,
    arrayColumns = {},
    selectable = false,
    multiple,
    removable = true,
    defaultValueFrom,
    visibleInCard,
    changeIndicators,
  } = options;

  useDisableValues({
    fieldId: id,
    items,
    options,
  });
  useItemsPrefilling(id, items, defaultValueFrom!);
  useDefaultValueFrom(id, defaultValueFrom);

  const disabled = uiSchema['ui:disabled'];
  const isDisabled = useMemo(() => {
    return disabled || isArrayDisabled;
  }, [disabled, isArrayDisabled]);

  const itemsLength = useMemo(() => {
    return items?.length || 12;
  }, [items]);

  if (isDisabled && !visibleInCard) {
    return null;
  }

  return (
    <Grid container spacing={2} style={{ width: '100%' }}>
      <ArrayErrorContainer fieldId={id} items={items} validations={validations} />
      <Grid size={{ xs: 12 }}>
        <Grid
          container
          alignItems="stretch"
          justifyContent="flex-start"
          wrap="wrap"
          direction="row"
          spacing={3}
        >
          {items?.map((item: AnyType, index: number) => (
            <Grid
              key={index}
              size={{
                xs: arrayColumns['xs'] || 12,
                sm: arrayColumns['sm'] || 12,
                md: arrayColumns['md'] || 12,
                lg: arrayColumns['lg'] || 12,
              }}
              style={itemTemplateStyle}
            >
              <InlineEditingNode
                id={`${id}_${index}`}
                parentId={id}
                index={index}
                schema={{ ...schema?.items, type: 'object' }}
                uiSchema={{
                  ...uiSchema?.items,
                  'ui:labels': { namespace: formContext?.namespace },
                }}
                removable={removable}
                selectable={selectable}
                multiple={multiple}
                item={item}
                changeIndicators={globalChangeIndicators ?? changeIndicators}
              />
            </Grid>
          ))}

          {!isDisabled && (
            <Grid
              size={{
                xs: calculateGridSize(itemsLength, arrayColumns['xs']),
                sm: calculateGridSize(itemsLength, arrayColumns['sm']),
                md: calculateGridSize(itemsLength, arrayColumns['md']),
                lg: calculateGridSize(itemsLength, arrayColumns['lg']),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'left',
                  paddingBottom: 20,
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" style={{ paddingTop: 2, color: '#0000008a' }}>
                  {translate('pressAdd', { ns: COMMON, lng: selectedLanguage })}
                </Typography>
                <GenericIconButton
                  id={`${id}-add-new`}
                  label={translate('addNew', { ns: COMMON, lng: selectedLanguage })}
                  ariaLabel={translate('addNew', { ns: COMMON, lng: selectedLanguage })}
                  ariaDescription={translate('addNewAriaDescription', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  onClick={() => addItem({})}
                  ariaHasPopup={true}
                  icon={<AssetByType input="icons" name="AddCircle" />}
                />
              </div>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ArrayInlineEditingHandler;
