import React, { useMemo } from 'react';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import MenuActionButton from './MenuActionButton';
import SplitActionButton from './SplitActionButton';
import { AnyType } from '@pkg-common/types';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import { VALID_BUTTONS_RESOURCE_ID } from '@pkg-constants/formCommon';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { ActionButtonType } from '@pkg-common/button/types';
import {
  BOOLEAN_CODELIST_ATTRIBUTES,
  REFDATA_ATTRIBUTE_KEY,
} from '@pkg-constants/codeListVariables';

export default function GroupedActionButton({
  id,
  action,
  defaultActions = {},
  checkPermissions,
  mode,
  index,
  elementId,
  namespace,
  onButtonPress,
}: Readonly<{
  id: string;
  index?: number;
  elementId?: string;
  action: ActionButtonType;
  defaultActions?: AnyType;
  checkPermissions: boolean;
  mode?: 'LOCAL' | 'DEFAULT';
  namespace?: string;
  onButtonPress?: () => void;
}>) {
  const {
    visibilityFrom,
    groups,
    title,
    style,
    source,
    checkValidButtons = false,
    checkChangeReason = false,
  } = action;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const { check: visible } = useCheckFrom(id, visibilityFrom, true);
  const { data: validButtonsTransition } = useApiDataState(VALID_BUTTONS_RESOURCE_ID);

  const finalActions = useMemo(() => {
    if (checkValidButtons) {
      return groups
        ?.filter((button) => {
          const matchingButton = validButtonsTransition?.find(
            (btn: AnyType) => btn.code === button.title,
          );

          return !!matchingButton;
        })
        .map((button) => {
          if (checkChangeReason) {
            const matchingButton = validButtonsTransition?.find(
              (btn: AnyType) => btn.code === button.title,
            );

            const requiresChangeReason = matchingButton?.attributes?.some(
              (attr) =>
                attr.key === REFDATA_ATTRIBUTE_KEY.REQUIRES_CHANGE_REASON &&
                attr.value === BOOLEAN_CODELIST_ATTRIBUTES.YES,
            );

            return {
              ...((defaultActions ?? {})[button.type ?? ''] ?? {}),
              ...button,
              schemas: requiresChangeReason ? button.schemas : {},
              source,
            };
          }

          return {
            ...((defaultActions ?? {})[button.type ?? ''] ?? {}),
            ...button,
            source,
          };
        });
    }
    if (!validButtonsTransition || !validButtonsTransition.length || !checkValidButtons) {
      const displayedButton = groups?.find((button) => button?.localStatusButton === true);

      if (mode === 'LOCAL' && displayedButton) {
        return [
          {
            ...((defaultActions ?? {})[displayedButton?.type ?? ''] ?? {}),
            ...displayedButton,
            source,
          },
        ];
      }

      return groups?.map((button) => {
        return {
          ...((defaultActions ?? {})[button.type ?? ''] ?? {}),
          ...button,
          source,
        };
      });
    }
    return undefined;
  }, [
    groups,
    validButtonsTransition,
    mode,
    defaultActions,
    source,
    checkValidButtons,
    checkChangeReason,
  ]);

  if ((visibilityFrom && !visible) || !finalActions?.length) {
    return null;
  }

  if (style === 'menu') {
    return (
      <MenuActionButton
        id={id}
        index={index}
        elementId={elementId}
        actions={finalActions}
        checkPermissions={checkPermissions}
        namespace={namespace}
        onButtonPress={onButtonPress}
      />
    );
  }

  return (
    <SplitActionButton
      id={id}
      title={translate(title ?? '', { ns: COMMON, lng: selectedLanguage })}
      actions={finalActions}
      onButtonPress={onButtonPress}
    />
  );
}
