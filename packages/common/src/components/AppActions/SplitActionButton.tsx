import React, { useRef } from 'react';
import { ButtonGroup, Menu, Box } from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import ActionButton from '@pkg-common/components/AppActions/ActionButton';
import { ActionButtonProps } from '@pkg-common/components/AppActions/ActionButton.d';
import { isVisible } from './utils';
import MenuContext from './MenuContext';
import { AnyType } from '@pkg-common/types';
import { useParams, useLocation } from 'react-router';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericButton from '../GenericButton/GenericButton';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import { useSelector } from 'react-redux';
import useUser from '@pkg-setup/src/user/useUser';
import { useTheme } from '@mui/material/styles';

export default function SplitActionButton({
  id,
  title,
  actions,
  onButtonPress,
}: Readonly<{
  id: string;
  title: string;
  actions: Array<ActionButtonProps>;
  onButtonPress?: () => void;
}>) {
  const theme = useTheme();
  const anchor = useRef<AnyType>(undefined);
  const [open, setOpen] = React.useState(false);
  const storeState = useSelector((state) => state);
  const { state: locationState } = useLocation();
  const routeParams = useParams();
  const { selectedLanguage } = useSystem();
  const { partyRoleId, userId } = useUser();
  const { t: translate } = useTranslation([ACCESSIBILITY]);

  if (
    !isVisible(actions, id, {
      state: storeState,
      routerData: locationState,
      routeParams,
      user: partyRoleId ?? userId ?? '',
    })
  ) {
    return null;
  }

  return (
    <>
      {/*@ts-ignore*/}
      <ButtonGroup ref={anchor}>
        <GenericButton
          id={id}
          disabled={false}
          variant="outlined"
          endIcon={<AssetByType input="icons" name="ArrowDropDown" />}
          onClick={() => setOpen(true)}
          label={title}
          ariaLabel={title}
          ariaDescription={translate('splitMenuAriaDescription', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
          ariaHasPopup={true}
        />
      </ButtonGroup>
      <Menu
        id="popover-menu"
        slotProps={{
          paper: {
            id: id,
            'data-testid': `${id}-menu-paper`,
          },
        }}
        elevation={0}
        anchorEl={anchor.current}
        keepMounted
        open={open}
        style={{ top: '100px' }}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <MenuContext.Provider value={true}>
          {actions?.map((action: AnyType, index: AnyType) => (
            <Box sx={{ paddingTop: 2, paddingLeft: 4 }} key={`${id}-${action.title}-${index}`}>
              <ActionButton
                id={id}
                action={action}
                checkPermissions={true}
                onButtonPress={onButtonPress}
              />
            </Box>
          ))}
        </MenuContext.Provider>
      </Menu>
    </>
  );
}
