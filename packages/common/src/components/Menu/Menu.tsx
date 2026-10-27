import React from 'react';
import { Menu as MUIMenu, MenuItem } from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { AnyType } from '@pkg-common/types';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import GenericIconButton from '../GenericIconButton/GenericIconButton';
import useSystem from '@pkg-setup/src/system/useSystem';

type MenuProps = {
  readonly styles?: AnyType;
  readonly children: JSX.Element[] | JSX.Element;
  readonly id?: string;
  readonly label?: string;
};

export function Menu({ children, styles, id = 'defaultMenu', label }: MenuProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = React.Children.map(children, (child, index) => {
    if (!child) {
      return null;
    }

    return <MenuItem key={index}>{child}</MenuItem>;
  });

  return (
    <div style={styles}>
      <GenericIconButton
        id={'add-menu-btn'}
        testId={'add-menu-btn'}
        label={label ?? translate('addForm', { ns: COMMON, lng: selectedLanguage })}
        ariaLabel={label ?? translate('addForm', { ns: COMMON, lng: selectedLanguage })}
        ariaDescription={translate('addFormAriaDescription', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        })}
        onClick={handleClick}
        ariaControls={'defaultMenu'}
        ariaHasPopup={true}
        icon={<AssetByType input="icons" name="MoreVert" />}
      />
      <MUIMenu id={id} anchorEl={anchorEl} keepMounted open={open} onClose={handleClose}>
        {menuItems}
      </MUIMenu>
    </div>
  );
}

Menu.propTypes = {
  ...Menu.propTypes,
};
