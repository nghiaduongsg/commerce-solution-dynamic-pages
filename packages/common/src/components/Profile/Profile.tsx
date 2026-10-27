import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { Avatar } from '@mui/material';
import PopoverMenu from '@pkg-common/atomics/PopoverMenu/PopoverMenu';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useAssetTypeUrl } from '@pkg-common/components/AssetByType/AssetByType';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useNavigate } from 'react-router';
import useAuth from '@pkg-setup/src/auth/useAuth';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import { SINGLE_RECORD_FORM, SEARCH_FORM } from '@pkg-constants/screenTypeIds';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';
import { ProfileProps } from './Profile.d';
import { USER_PREFERENCES } from '@pkg-constants/formIds';
import useDrawer from '@pkg-common/drawer/useDrawer';
import { registerKeyboardShortcuts } from '@pkg-common/utils/utils';
import ProductInfo from '../ProductInfo/ProductInfo';

const getPageId = (path: string) => {
  const parts = path?.split('/page/');
  const end = parts?.length ? parts[1] : '';
  const categoryParts = end?.split('/');
  return categoryParts?.length ? categoryParts[0] : '';
};

function replaceInitialHelpUrl(initialUrl: string) {
  return initialUrl
    .replace('${USER_HELP_DOCS_BASE_URL}', window['USER_HELP_DOCS_BASE_URL'])
    .replace('${ADMIN_HELP_DOCS_BASE_URL}', window['ADMIN_HELP_DOCS_BASE_URL']);
}

const PRODUCT_VERSION = 'ProductVersion';

const Profile: React.FC<ProfileProps> = ({ customActions = [], userAccountUrl }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { selectedLanguage, application } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { profileImage, shortcutsOn } = useUserSettings();
  const avatarUrl = useAssetTypeUrl('images', 'avatar');
  const { openUniqueDrawer: openProductInfo } = useDrawer(PRODUCT_VERSION);

  useEffect(() => {
    registerKeyboardShortcuts(shortcutsOn || false);
  }, [shortcutsOn]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [productInfoOpen, setProductInfoOpen] = useState(false);

  const pageId = getPageId(window?.location?.pathname);
  const { data } = useApiDataState(`${pageId}_${SINGLE_RECORD_FORM}_SCHEMAS`);
  const { data: data2 } = useApiDataState(`${pageId}_${SEARCH_FORM}_SCHEMAS`);

  const helpUrl = useMemo(() => {
    return replaceInitialHelpUrl(data?.helpURL || data2?.helpURL || '');
  }, [data, data2, pageId]);

  const defaultActions = useMemo(() => {
    const baseActions = [
      {
        id: 'Account Management',
        icon: <AssetByType input="icons" name="VpnKey" />,
        label: 'Account Management',
        onClick: () => {
          window.open(userAccountUrl);
        },
      },
      {
        id: 'Logout',
        icon: <AssetByType input="icons" name="ExitToApp" />,
        label: 'Logout',
        onClick: () => logout(),
      },
    ];

    const productInfoAction = {
      id: PRODUCT_VERSION,
      icon: <AssetByType input="icons" name="InfoRounded" />,
      label: 'Product Info',
      onClick: () => setProductInfoOpen(true),
    };

    if (application === 'ISS') {
      return [
        {
          id: 'Favorite',
          icon: <AssetByType input="icons" name="FavoriteBorder" />,
          label: 'Preferences',
          onClick: () => navigate('/Settings'),
        },
        ...baseActions,
        {
          id: 'Accessibility',
          icon: <AssetByType input="icons" name="Accessibility" />,
          label: 'Accessibility',
          onClick: () => navigate('/accessibility'),
        },
        productInfoAction,
      ];
    }

    const advancedActions = [
      {
        id: USER_PREFERENCES,
        icon: <AssetByType input="icons" name="Settings" />,
        label: 'Settings',
        onClick: () => navigate(`/page/${USER_PREFERENCES}`),
      },
      ...baseActions,
      {
        id: 'Accessibility',
        icon: <AssetByType input="icons" name="Accessibility" />,
        label: 'Accessibility',
        onClick: () => navigate('/Accessibility-Statement'),
      },
      helpUrl && {
        id: 'Help',
        icon: <AssetByType input="icons" name="Help" />,
        label: 'Help',
        onClick: () => {
          window.open(helpUrl, '_blank');
        },
      },
      productInfoAction,
    ].filter(Boolean);

    return [...advancedActions, ...customActions];
  }, [application, helpUrl, customActions, openProductInfo]);

  return (
    <>
      <PopoverMenu
        id={`profile-menu-options`}
        dataTestId={`profile-menu-${application}`}
        icon={<Avatar alt="Avatar" src={profileImage || avatarUrl} />}
        actions={defaultActions as any}
        label={translate('profile', { ns: COMMON, lng: selectedLanguage })}
        onOpen={() => setMenuOpen(true)}
        onClose={() => setMenuOpen(false)}
        isOpen={menuOpen}
        shortcuts={shortcutsOn}
      />
      {productInfoOpen && (
        <ProductInfo open={productInfoOpen} onClose={() => setProductInfoOpen(false)} />
      )}
    </>
  );
};

export default Profile;
