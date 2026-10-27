import React, { useMemo } from 'react';
import { AppActionsType } from './types';
import useCheckFrom from '../../dataResolver/useCheckFrom';
import ActionButton from '@pkg-common/components/AppActions/ActionButton';
import GroupedActionButton from './GroupedActionButton';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import {
  USER_ACCESS_PERMISSIONS_RESOURCE_ID,
  VALID_BUTTONS_RESOURCE_ID,
} from '@pkg-constants/formCommon';
import { useSelector } from 'react-redux';
import { selectEntityId } from '@pkg-entity/redux/selectors';
import { AnyType } from '@pkg-common/types';
import { hasValue } from '@pkg-common/utils';
import { isActionAllowed, isActionAllowedBasedOnSecurableObjects } from '@pkg-common/utils/utils';
import { useSystem } from '@pkg-setup/index';
import { Box } from '@mui/material';
import { getButtonKey } from '@pkg-common/components/AppActions/utils';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import FormManagerProvider from '@pkg-form/FormManagerProvider';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { SxProps } from '@mui/system';

const buttonContainerStyles: SxProps = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  gap: 3,
};

const AppActions = ({
  page,
  actions,
  checkPermissions = true,
  defaultActions,
  onSuccessCallback,
  disabled,
  source,
  mode = 'LOCAL',
  namespace,
  parentId,
  sx = {},
  onButtonPress,
}: AppActionsType) => {
  const { id, elementId, refersTo } = page ?? {};
  const { buttons, visibilityFrom, checkValidButtons, checkValidButtonsExceptFrom } = actions ?? {};
  const { check: visible } = useCheckFrom(id, visibilityFrom, true);
  const { data: validButtonsTransition, finished } = useApiDataState(VALID_BUTTONS_RESOURCE_ID);
  const { data: allowedBtns } = useApiDataState(USER_ACCESS_PERMISSIONS_RESOURCE_ID);
  const { applyPermissions, allSymbol, securableObjects } = useSystem();

  // TODO: remove this. Make check permissions dynamic
  // **Fix issue with buttons in Forms by ensuring timely updates to 'isNew' status in 'selectIsNewEntity'.
  const entityId = useSelector(
    selectEntityId(page?.id),
    (left, right) => JSON.stringify(left ?? {}) === JSON.stringify(right ?? {}),
  );

  const allReplacements = useMemo(() => {
    return (
      buttons?.flatMap((button) =>
        typeof button?.permissionKey === 'string' ? [] : button?.permissionKey?.replacements || [],
      ) || []
    );
  }, [buttons]);

  const replacementValues = useMultipleFormData(id, allReplacements, false, source);

  const isNew = useMemo(() => !hasValue(entityId), [entityId]);

  // This extraKey is important because in lists, the buttons get the same key, so we lose some necessary rerenders.
  const extraKey = source ? `-${getButtonKey(source)}` : '';

  const visibleButtons = useMemo(() => {
    if (!applyPermissions) {
      return buttons;
    }
    if (checkValidButtons && !isNew && !finished) {
      return null;
    }
    return buttons?.filter((btn) => {
      const isAllowedBasedOnPermissions = allowedBtns
        ? isActionAllowed(btn.title, allowedBtns, allSymbol)
        : true;

      const isAllowedBasedOnSecurableObjects = isActionAllowedBasedOnSecurableObjects(
        replacementValues,
        btn?.permissionKey ?? 'defaultItemActions',
        securableObjects,
        applyPermissions,
      );

      if (checkValidButtons) {
        let isTransitionAllowed;

        if (btn?.title && checkValidButtonsExceptFrom?.includes(btn.title)) {
          isTransitionAllowed = true;
        } else if (!isNew) {
          isTransitionAllowed = !!validButtonsTransition?.find(
            (button: AnyType) => button.code === btn.title,
          );
        }

        return (
          isTransitionAllowed && isAllowedBasedOnPermissions && isAllowedBasedOnSecurableObjects
        );
      }

      return isAllowedBasedOnPermissions && isAllowedBasedOnSecurableObjects;
    });
  }, [
    buttons,
    applyPermissions,
    allowedBtns,
    securableObjects,
    checkValidButtonsExceptFrom,
    allSymbol,
    validButtonsTransition,
    isNew,
    finished,
  ]);

  if (!actions || !buttons || !visible || !visibleButtons?.length) {
    return null;
  }

  return (
    <ValidationsProvider>
      <FormManagerProvider>
        <Box sx={{ ...buttonContainerStyles, ...sx }}>
          {visibleButtons?.map((btn, index) => {
            if (btn?.groups) {
              return (
                <GroupedActionButton
                  key={`${btn.title}-${index}${extraKey}`}
                  id={id}
                  index={index}
                  elementId={elementId}
                  namespace={namespace}
                  // @ts-ignore
                  action={{ ...btn, disabled, source }}
                  defaultActions={defaultActions}
                  checkPermissions={checkPermissions}
                  mode={mode}
                  onButtonPress={onButtonPress}
                />
              );
            } else {
              return (
                <ActionButton
                  key={`${btn.title}-${index}${extraKey}`}
                  id={id}
                  parentId={parentId}
                  elementId={elementId}
                  action={{
                    ...((defaultActions ?? {})[btn?.type ?? ''] ?? {}),
                    ...btn,
                    disabled,
                    source,
                    refersTo,
                  }}
                  checkPermissions={checkPermissions}
                  onSuccessCallback={onSuccessCallback}
                  onButtonPress={onButtonPress}
                />
              );
            }
          })}
        </Box>
      </FormManagerProvider>
    </ValidationsProvider>
  );
};

export default React.memo(AppActions, (prev, next) => {
  return (
    prev.disabled === next.disabled &&
    JSON.stringify(prev.actions ?? {}) === JSON.stringify(next.actions ?? {}) &&
    JSON.stringify(prev.page ?? {}) === JSON.stringify(next.page ?? {}) &&
    JSON.stringify(prev.source ?? {}) === JSON.stringify(next.source ?? {})
  );
});
