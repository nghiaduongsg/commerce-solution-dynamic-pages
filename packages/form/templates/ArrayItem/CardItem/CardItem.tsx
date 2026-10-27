import React, { forwardRef } from 'react';
import { ArrayItemProps } from './../ArrayItem.d';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import { CARD_WITH_TITLE } from '@pkg-constants/formCard';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useItem from '@pkg-form/templates/ArrayTemplate/hooks/useItem';
import { hasValue } from '@pkg-common/utils';

const getItemChildrenOnReadMode = (children, uiSchema) =>
  React.cloneElement(children as React.ReactElement<any>, {
    uiSchema,
  });

const CardItem = forwardRef<HTMLDivElement, ArrayItemProps>(
  (
    {
      id,
      parentId,
      item,
      onDeleteConfirmPressed,
      onDelete,
      onEdit,
      onDuplicate,
      icon,
      buttons,
      cardColors,
      cardUiSchema,
      cardVisibility,
      changeIndicators,
    },
    ref,
  ) => {
    const { children, cardType, title, index } = item;

    const deleteConfirm = buttons?.buttons?.find(
      (btn) => btn.type === 'DELETE' && !hasValue(btn.warnOnAction),
    );

    const { isValid, defaultActions } = useItem(id, {
      onEdit,
      onDuplicate: () => onDuplicate(index),
      onDelete: deleteConfirm ? onDelete : onDeleteConfirmPressed,
    });

    const itemFormData = item?.children?.props?.formData || {};
    const itemStatus = itemFormData?.__STATUS__;

    if (!cardVisibility) {
      return null;
    }

    return (
      <GenericCard
        ref={ref}
        id={id}
        title={title || `${parentId} ${index + 1}`}
        showTitle={cardType === CARD_WITH_TITLE && !!title}
        state={!isValid ? 'INVALID' : 'DEFAULT'}
        icon={icon}
        cardColors={cardColors}
        changeIndicators={changeIndicators}
        indicatorStatus={itemStatus}
        actions={
          buttons ? (
            <AppActions
              page={{ id }}
              actions={buttons}
              checkPermissions={true}
              defaultActions={defaultActions}
            />
          ) : null
        }
      >
        {getItemChildrenOnReadMode(children, cardUiSchema) as JSX.Element}
      </GenericCard>
    );
  },
);

CardItem.displayName = 'CardItem';

export default CardItem;
