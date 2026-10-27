import { useMemo } from 'react';
import { getBanner } from '@pkg-theme/src/utils/themeUtils';
import { useUserSettings } from '@pkg-setup/index';

const bannerExternal = getBanner();

const useBanner = (banner: string, themes = {}) => {
  const { themeName, themeSource } = useUserSettings();

  return useMemo(() => {
    if (themeSource === 'remote' && bannerExternal) {
      return `${window.DEPLOYMENT_ENVIRONMENT}${bannerExternal}`;
    }
    if (!themeName || !themes[themeName]) {
      return banner;
    }
    return themes[themeName]()?.bgHero || {};
  }, [themeName, themeSource]);
};

export default useBanner;
