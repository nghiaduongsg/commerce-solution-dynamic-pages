import React, { useCallback, useMemo } from 'react';

import { useParams, useNavigate } from 'react-router';
import { BACK_BUTTON_SHORTCUT } from '@pkg-constants/keyboardShortcuts';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useSystem } from '@pkg-setup/index';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import usePage from './hooks/usePage';
import { ArrowBack } from '@mui/icons-material';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { SxProps } from '@mui/system';
import { Box } from '@mui/material';

const PageCategory = ({ backButtonSx = {} }: { backButtonSx?: SxProps }) => {
  const routeParams = useParams<{ category?: string; idKey?: string }>();
  const { selectedLanguage } = useSystem();
  const navigate = useNavigate();
  const uiSchema = usePage();

  const pageId = useMemo(() => {
    return routeParams?.category || '';
  }, [routeParams]);

  const { namespace = '' } = useMemo(() => {
    if (!uiSchema) {
      return {};
    }
    return uiSchema['ui:labels'] || {};
  }, [uiSchema]);

  const backBtnConfig = useMemo(() => {
    return ((uiSchema || {})['ui:page'] || {})['back'];
  }, [uiSchema]);

  const { url, urlReady } = useDynamicApi(`${pageId}_back_btn`, backBtnConfig || {});

  const hasBackButton = useMemo(() => {
    return url && urlReady && backBtnConfig;
  }, [backBtnConfig, url, urlReady]);

  const navigateToUrl = useCallback(() => {
    navigate(url, { state: { from: pageId } });
  }, [url, pageId]);

  const { t: translate } = useTranslation([namespace, COMMON, ACCESSIBILITY]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
      {hasBackButton && (
        <GenericIconButton
          id="back-btn"
          testId="back-btn"
          ariaKeyboardShortcuts={BACK_BUTTON_SHORTCUT}
          ariaLabel={translate('backButton', { ns: COMMON, lng: selectedLanguage })}
          ariaDescription={translate('backAriaDescription', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
          onClick={navigateToUrl}
          size="medium"
          icon={<ArrowBack />}
          styles={backButtonSx}
        />
      )}
    </Box>
  );
};

export default PageCategory;
