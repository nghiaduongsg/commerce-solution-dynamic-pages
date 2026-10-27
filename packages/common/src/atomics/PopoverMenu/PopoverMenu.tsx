import React, { ReactElement, useMemo } from 'react';
import { MoreVert } from '@mui/icons-material';
import { Menu, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useSystem from '@pkg-setup/src/system/useSystem';
import { OPEN_HELP_LINK_SHORTCUT, OPEN_SETTINGS_SHORTCUT } from '@pkg-constants/keyboardShortcuts';
import { AnyType } from '@pkg-common/types';
import { SxProps } from '@mui/system';

export interface PopoverMenuProps {
  dataTestId: string;
  id: string;
  icon?: ReactElement;
  label?: string;
  ariaDescription?: string;
  actions?: Array<{
    id: string;
    icon?: ReactElement;
    label?: string | ReactElement;
    onClick: (actionId: string) => void | Promise<AnyType>;
  }>;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  sx?: SxProps;
  shortcuts?: boolean;
}

const keyboardShortcuts = {
  help: OPEN_HELP_LINK_SHORTCUT,
  settings: OPEN_SETTINGS_SHORTCUT,
};

const PopoverMenu: React.FC<PopoverMenuProps> = ({
  id,
  dataTestId,
  icon = <MoreVert />,
  label,
  ariaDescription = '',
  actions,
  onOpen,
  onClose,
  isOpen,
  sx,
  shortcuts = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const shouldRender = useMemo(() => isOpen || shortcuts, [isOpen, shortcuts]);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <GenericIconButton
        id={dataTestId}
        testId={dataTestId}
        ariaLabel={label ?? translate('popoverMenu', { ns: COMMON, lng: selectedLanguage })}
        ariaDescription={ariaDescription}
        ariaControls={shouldRender ? id : undefined}
        onClick={handleClick}
        ariaHasPopup={'menu'}
        icon={icon}
      />
      {shouldRender && (
        <Menu
          id={`${id}-popover-menu`}
          slotProps={{
            paper: {
              id: id,
              'data-testid': `${dataTestId}-menu-paper`,
            },
          }}
          elevation={0}
          anchorEl={anchorEl}
          keepMounted
          open={isOpen ?? Boolean(anchorEl)}
          style={{ top: '50px' }}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
        >
          {actions
            ?.filter((action) => !!action)
            ?.map((action) => (
              <MenuItem
                id={`menu-action-${dataTestId}-${action?.id?.toUpperCase()}`}
                data-testid={`menu-action-${dataTestId}-${action?.id?.toUpperCase()}`}
                key={action.id}
                sx={sx}
                onClick={() => {
                  handleClose();
                  action.onClick(action.id);
                }}
                aria-label={typeof action.label === 'string' ? action.label : undefined}
                aria-description={translate('popoverMenuItemAriaDescription', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                  action: typeof action.label === 'string' ? action.label : action.id,
                })}
                aria-keyshortcuts={
                  keyboardShortcuts[
                    typeof action.label === 'string'
                      ? action.label.toLowerCase()
                      : action.id.toLowerCase()
                  ]
                }
              >
                {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                <ListItemText primary={action.label} />
              </MenuItem>
            ))}
        </Menu>
      )}
    </>
  );
};

export default PopoverMenu;
