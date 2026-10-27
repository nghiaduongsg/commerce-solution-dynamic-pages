import React, { useMemo } from 'react';

import TranslationsElementController from '@pkg-core/TranslationsElementController';
import usePage from '@pkg-layout/src/common/hooks/usePage';
import { useLocation } from 'react-router';
import { SxProps } from '@mui/system';
import { Box, Typography } from '@mui/material';
import { useSystem } from '@pkg-setup/index';
import { useTranslation } from 'react-i18next';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import PageEntityName from '@pkg-layout/src/common/PageEntityName';
import SearchBar from '@pkg-common/components/SearchBar/SearchBar';
import UiSchemaContext from '@pkg-form/UISchemaContext';
import PageChanges from '@pkg-layout/src/common/PageChanges';

const PageTitle = ({
  title,
  sx = {},
  includeGlobalSearch = true,
}: {
  title?: string;
  sx?: SxProps;
  includeGlobalSearch: boolean;
}) => {
  const location = useLocation();
  const uiSchema = usePage();

  const bannerNamespace = useMemo(() => {
    return uiSchema?.['ui:labels']?.bannerNamespace;
  }, [uiSchema]);

  const namespace = useMemo(() => {
    return uiSchema?.['ui:labels']?.namespace;
  }, [uiSchema]);

  const headerActions = useMemo(() => {
    return uiSchema?.['ui:headerButtons'] || {};
  }, [uiSchema]);

  const subTitle = uiSchema?.['ui:page']?.subTitle;

  const isList = useMemo(() => {
    return location.pathname.indexOf('/list') > 0;
  }, [location]);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(bannerNamespace ?? namespace);

  const translatedTitle = translate(isList ? 'title' : title ?? 'formTitle', {
    ns: bannerNamespace ?? namespace,
    lng: selectedLanguage,
  });

  const translatedSubTitle = translate(subTitle, {
    ns: bannerNamespace ?? namespace,
    lng: selectedLanguage,
  });

  return (
    <TranslationsElementController
      key={namespace}
      namespace={bannerNamespace ?? namespace}
      skeletonProps={{ width: '200px', variant: 'text', height: '30px' }}
    >
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h2"
              component="h2"
              data-testid={isList ? 'title' : title ?? 'formTitle'}
              aria-label={translatedTitle}
              sx={{ ...sx, marginBottom: subTitle ? 1 : 0 }}
            >
              {translatedTitle}
            </Typography>
            {headerActions && (
              <AppActions
                page={uiSchema?.['ui:page']}
                actions={headerActions}
                checkPermissions={true}
              />
            )}
          </Box>
          {!isList && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <PageChanges />
              {includeGlobalSearch && (
                <Box sx={{ marginLeft: 2, marginRight: 2 }}>
                  <SearchBar />
                </Box>
              )}
              <UiSchemaContext.Provider value={uiSchema}>
                <AppActions
                  page={uiSchema?.['ui:page']}
                  actions={uiSchema?.['ui:buttons'] || {}}
                  checkPermissions={true}
                />
              </UiSchemaContext.Provider>
            </Box>
          )}
        </Box>

        {!isList && <PageEntityName sx={sx} />}
        <Typography
          variant="body1"
          component="p"
          data-testid={'subtitle'}
          aria-label={translatedSubTitle}
          color={'#4A5565'}
          sx={sx}
        >
          {translatedSubTitle}
        </Typography>
      </Box>
    </TranslationsElementController>
  );
};

export default PageTitle;
