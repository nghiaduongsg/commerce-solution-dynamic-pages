import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Popover, Box } from '@mui/material';
import { useNavigate } from 'react-router';
import {
  FolderSharp,
  SupervisorAccount,
  KeyboardArrowDown,
  PersonAdd,
  Link,
} from '@mui/icons-material';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import usePartyRole from '@pkg-setup/src/partyRole/usePartyRole';
import useUser from '@pkg-setup/src/user/useUser';
import GenericButton from '../GenericButton/GenericButton';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import FormManagerProvider from '@pkg-form/FormManagerProvider';

const AccountInfo = () => {
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { selectedLanguage } = useSystem();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { partyRoleId: accountId } = useUser();
  const { partyRoleIdentifier, subUserCreation, partyRoleId } = usePartyRole();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const isCurrentPageAccountPage = window.location.href?.indexOf('/page/Accounts') >= 0;

  return (
    <ValidationsProvider>
      <FormManagerProvider>
        <div style={{ marginRight: '10px' }}>
          <GenericButton
            id="demo-customized-button"
            variant="contained"
            ariaLabel={translate('account', { ns: COMMON, lng: selectedLanguage })}
            ariaDescription={translate('accountAriaDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            ariaHasPopup={true}
            ariaControls={'pop-over-menu'}
            onClick={handleClick}
            endIcon={<KeyboardArrowDown />}
            label={
              accountId
                ? partyRoleIdentifier
                : translate('noAccountSelected', { ns: COMMON, lng: selectedLanguage })
            }
          />
        </div>
        <Popover
          id="pop-over-menu"
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              style: {
                width: anchorEl ? anchorEl.clientWidth : 'auto',
                borderRadius: '12px',
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #e0e0e0',
              },
            },
          }}
        >
          {partyRoleId && (
            <MenuItem
              onClick={() => navigate('/page/IssPartyRoleAccount')}
              aria-label={translate('accountOverview', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              aria-description={translate('accountOverviewDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              tabIndex={0}
              disableRipple
            >
              <Box display="flex" alignItems="center">
                <FolderSharp color="primary" />
                <Box ml={2}>
                  {translate('accountOverview', { ns: COMMON, lng: selectedLanguage })}
                </Box>
              </Box>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => navigate('/page/Accounts')}
            aria-label={translate('accounts', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            aria-description={translate('accountsDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            tabIndex={0}
            disableRipple
          >
            <Box display="flex" alignItems="center">
              <SupervisorAccount color="primary" />
              <Box ml={2}>{translate('accounts', { ns: COMMON, lng: selectedLanguage })}</Box>
            </Box>
          </MenuItem>
          {isCurrentPageAccountPage && (
            <MenuItem
              onClick={() => navigate('/page/FormDefinition?subType=PaRoleLink')}
              aria-label={translate('linkAccount', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              aria-description={translate('linkAccountDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              tabIndex={0}
              disableRipple
            >
              <Box display="flex" alignItems="center">
                <Link color="primary" />
                <Box ml={2}>{translate('linkAccount', { ns: COMMON, lng: selectedLanguage })}</Box>
              </Box>
            </MenuItem>
          )}
          {subUserCreation && isCurrentPageAccountPage && (
            <MenuItem
              onClick={() => navigate('/page/IssSubUser')}
              aria-label={translate('subUserCreation', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              aria-description={translate('subUserCreationDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              tabIndex={0}
              disableRipple
            >
              <Box display="flex" alignItems="center">
                <PersonAdd color="primary" />
                <Box ml={2}>
                  {translate('subUserCreation', { ns: COMMON, lng: selectedLanguage })}
                </Box>
              </Box>
            </MenuItem>
          )}
        </Popover>
      </FormManagerProvider>
    </ValidationsProvider>
  );
};

export default AccountInfo;
