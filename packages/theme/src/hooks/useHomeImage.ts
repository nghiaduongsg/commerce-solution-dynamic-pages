import { useMemo } from 'react';
import { getHomeImage } from '@pkg-theme/src/utils/themeUtils';
import { useUserSettings } from '@pkg-setup/index';

const imgExternal = getHomeImage();

const useHomeImage = (image: string, themes = {}) => {
  const { themeName, themeSource, homeImage } = useUserSettings();

  return useMemo(() => {
    if (themeSource === 'remote' && imgExternal) {
      return `${window.DEPLOYMENT_ENVIRONMENT}${imgExternal}`;
    }
    if (!themeName || !themes[themeName]) {
      return image;
    }

    return homeImage || themes[themeName]()?.homeBackground || {};
  }, [themeName, themeSource, homeImage]);
};

export default useHomeImage;
