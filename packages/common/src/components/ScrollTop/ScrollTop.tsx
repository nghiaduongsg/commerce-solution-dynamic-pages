import React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useSystem from '@pkg-setup/src/system/useSystem';

const getStyles = (theme) => {
  return {
    scrollContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      padding: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      width: 'fit-content',
      bottom: theme.spacing(2),
      height: '45px',
      border: `1px transparent solid`,
      '&:hover,&:focus,&:active': {
        backgroundColor: theme.palette.primary.light,
        border: `0.5px solid ${alpha(theme.palette?.primary.main, 0.6)}`,
        borderRadius: '8px',
      },
    },
    scrollIcon: {
      marginRight: theme.spacing(2),
    },
  };
};

const scrollToTop = () => {
  let el: HTMLElement | null = document.getElementById('scroll-to-top');
  while (el) {
    if (el.scrollHeight > el.clientHeight) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    el = el.parentElement;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const ScrollTop = () => {
  const styles = getStyles(useTheme());
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  return (
    <GenericIconButton
      id="scroll-to-top"
      styles={styles.scrollContainer}
      ariaLabel={translate('scrollToTop', { ns: COMMON, lng: selectedLanguage })}
      ariaDescription={translate('scrollToTopAriaDescription', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
      })}
      label={translate('scrollToTop')}
      onClick={scrollToTop}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          scrollToTop();
        }
      }}
      icon={
        <>
          <AssetByType
            input="icons"
            name="VerticalAlignTop"
            props={{ className: styles.scrollIcon }}
          />
          <Typography variant="caption" color="textPrimary">
            {translate('scrollToTop', { ns: COMMON, lng: selectedLanguage })}
          </Typography>
        </>
      }
    />
  );
};

export default ScrollTop;
