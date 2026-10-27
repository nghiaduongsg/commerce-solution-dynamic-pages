import React, { useRef } from 'react';
import CardButton from '@pkg-common/atomics/CardButton/CardButton';
import { Box, Grid, useTheme } from '@mui/material';
import CardArrayItem from '@pkg-form/templates/ArrayItem/CardArrayItem';
import { ArrayTemplateProps } from '../ArrayTemplate.d';
import { CARD_WITH_TITLE } from '@pkg-constants/formCard';
import ArrayErrorContainer from '../ArrayErrorContainer';
import { calculateGridSize } from '@pkg-form/validations/utils/formUtils';
import useArrayTemplate from '../hooks/useArrayTemplate';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useDisableValues from '@pkg-form/templates/ArrayTemplate/hooks/useDisableValues';
import { AnyType } from '@pkg-common/types';
import GenericInfoCard from '@pkg-common/atomics/GenericInfoCard/GenericInfoCard';

const CardsTemplate = (props: ArrayTemplateProps) => {
  const {
    canAdd,
    items,
    uiSchema,
    idSchema,
    formContext,
    disabled: rootFormDisabled,
    title: arrayLabel,
    itemViewAction,
    defaultItemActions,
  } = props;
  const theme = useTheme();

  const fieldId = idSchema.$id;
  const { namespace, changeIndicators: globalChangeIndicators, formId } = formContext ?? {};

  const options = uiSchema['ui:options'] || {};
  const buttons = uiSchema['ui:buttons'] || defaultItemActions;
  const modalButtons = uiSchema['ui:modal:buttons'];
  const disabled = uiSchema['ui:disabled'];
  const readonly = uiSchema['ui:readonly'];
  const cardColors = uiSchema['ui:card:colors'];

  const {
    validations,
    arrayColumns = {},
    cardType = CARD_WITH_TITLE,
    title,
    visibleInCard = true,
    cardVisibility = true,
    allowActionsIfDisabled,
    changeIndicators,
  } = options;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const {
    clearLocalState,
    onItemAdded,
    onItemSaved,
    onItemDuplicated,
    onItemDeleted,
    newItemIndex,
    addEnabled,
    isDisabled,
    shouldValidate,
    cardUiSchema,
  } = useArrayTemplate({
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

  const cardRefs = useRef<AnyType>([]);

  const actionIndexFocus = (index) => {
    setTimeout(() => {
      if (index !== -1 && cardRefs.current[index]) {
        cardRefs.current[index].focus();
      }
    }, 0);
  };

  if (readonly && disabled && !visibleInCard) {
    return null;
  }

  return (
    <Grid container rowSpacing={2} columnSpacing={2} size={12}>
      <Box
        id={`${fieldId}-alert-help-text-card`}
        role={'alert'}
        aria-live={'polite'}
        sx={{
          marginRight: theme.spacing(1),
          fontSize: theme.typography.body2.fontSize,
        }}
      />
      <ArrayErrorContainer
        fieldId={fieldId}
        items={items}
        validations={shouldValidate ? validations : undefined}
      />

      <Grid
        container
        alignItems="stretch"
        justifyContent="flex-start"
        flex-wrap="wrap"
        direction="row"
        rowSpacing={3}
        columnSpacing={3}
        size={12}
      >
        {items.map((item) => (
          <Grid
            key={item.key}
            size={{
              xs: arrayColumns['xs'] || 12,
              sm: arrayColumns['sm'] || 12,
              md: arrayColumns['md'] || 12,
              lg: arrayColumns['lg'] || 12,
            }}
            style={!cardVisibility ? { display: 'none' } : { height: 'auto' }}
          >
            <CardArrayItem
              ref={(el) => {
                cardRefs.current[item.index] = el;
              }}
              key={item.key}
              parentId={fieldId}
              formId={formId}
              label={arrayLabel}
              namespace={namespace}
              item={{
                ...item,
                isNew: item.index === newItemIndex,
                title,
                cardType,
                view: 'card',
              }}
              onItemDuplicated={(itemData) => {
                onItemDuplicated(itemData);
                actionIndexFocus(items.length);
              }}
              onDeleteItemPressed={(index) => {
                onItemDeleted();
                actionIndexFocus(index);
                clearLocalState();
              }}
              onActionComplete={() => {
                actionIndexFocus(item.index);
                clearLocalState();
              }}
              onSaveItem={onItemSaved}
              disabled={isDisabled}
              buttons={isDisabled && !allowActionsIfDisabled ? itemViewAction : buttons}
              cardColors={cardColors}
              modalButtons={modalButtons}
              options={JSON.stringify(options)}
              cardUiSchema={cardUiSchema}
              changeIndicators={globalChangeIndicators ?? changeIndicators}
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
              xs: calculateGridSize(cardVisibility ? items.length : 0, arrayColumns['xs']),
              sm: calculateGridSize(cardVisibility ? items.length : 0, arrayColumns['sm']),
              md: calculateGridSize(cardVisibility ? items.length : 0, arrayColumns['md']),
              lg: calculateGridSize(cardVisibility ? items.length : 0, arrayColumns['lg']),
            }}
          >
            <CardButton
              fullHeight
              ctaAction={onItemAdded}
              ctaLabel={title || translate('addNew', { ns: COMMON, lng: selectedLanguage })}
              id={fieldId}
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default CardsTemplate;
