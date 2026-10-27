import { useMemo } from 'react';
import { getLogo } from '@pkg-theme/src/utils/themeUtils';
import { useUserSettings } from '@pkg-setup/index';

const logoExternal = getLogo();

const useLogo = (defaultLogo: string, themes = {}) => {
  const { themeName, themeSource, logo } = useUserSettings();

  return useMemo(() => {
    if (themeSource === 'remote' && logoExternal) {
      return `${window.DEPLOYMENT_ENVIRONMENT}${logoExternal}`;
    }
    if (!themeName || !themes[themeName]) {
      return defaultLogo;
    }

    return logo || themes[themeName]()?.logo || {};
  }, [themeName, themeSource, logo]);
};

export default useLogo;
