import React, { useState, useRef, useId } from 'react';
import { Menu, PopoverOrigin } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import ActionButton from '@pkg-common/components/AppActions/ActionButton';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { getButtonKey, isVisible } from './utils';
import MenuContext from './MenuContext';
import { AnyType } from '@pkg-common/types';
import { useParams, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import useUser from '@pkg-setup/src/user/useUser';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const anchorOrigin = {
  vertical: 'center',
  horizontal: 'right',
} as PopoverOrigin;

const transformOrigin = {
  vertical: 'center',
  horizontal: 'left',
} as PopoverOrigin;

export default function MenuActionButton({
  id,
  index,
  elementId,
  actions,
  checkPermissions,
  namespace,
  onButtonPress,
}: AnyType) {
  const [anchor, setAnchor] = useState(null);
  const storeState = useSelector((state) => state);
  const { state: locationState } = useLocation();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, namespace ?? COMMON]);
  const routeParams = useParams();
  const { partyRoleId, userId } = useUser();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const reactId = useId();

  if (
    !isVisible(actions, id, {
      state: storeState,
      routerData: locationState,
      routeParams,
      user: partyRoleId || userId || '',
    })
  ) {
    return null;
  }

  const onMenuClick = (e: AnyType) => {
    e.stopPropagation();
    setAnchor(e.currentTarget);
  };

  const onClick = (e: AnyType) => {
    e.stopPropagation();
    setAnchor(null);
  };

  const onClose = (e: AnyType) => {
    e?.stopPropagation?.();
    setAnchor(null);
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  const onBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setAnchor(null);
    }
  };

  const tableName = translate(id, { ns: namespace ?? COMMON, lng: selectedLanguage });
  const hasContextualName = Boolean(namespace) || tableName !== id;

  return (
    <>
      <GenericIconButton
        id={`${id}-menu-${elementId ?? index}`}
        testId={'menu-three-dots'}
        ariaLabel={translate(hasContextualName ? 'rowMenuButtonAriaLabel' : 'menuButtonAriaLabel', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
          table: tableName,
        })}
        ref={buttonRef}
        onClick={onMenuClick}
        ariaHasPopup={'menu'}
        ariaExpanded={!!anchor ? true : undefined}
        ariaControls={!!anchor ? `${id}-popover-menu-${reactId}` : undefined}
        icon={<MoreVert />}
      />
      <Menu
        id={`${id}-popover-menu-${reactId}`}
        anchorEl={anchor}
        elevation={0}
        keepMounted
        onBlur={onBlur}
        open={!!anchor}
        onClose={onClose}
        onClick={onClick}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <MenuContext.Provider value={true}>
          {actions?.map((action: AnyType, indicator: AnyType) => {
            const buttonKey = action?.source ? getButtonKey(action.source) : 'default';
            return (
              <ActionButton
                key={`${action.title}-${indicator}-${buttonKey}`}
                id={id}
                elementId={elementId}
                action={action}
                checkPermissions={checkPermissions}
                onSuccessCallback={() => setAnchor(null)}
                onButtonPress={onButtonPress}
              />
            );
          })}
        </MenuContext.Provider>
      </Menu>
    </>
  );
}
