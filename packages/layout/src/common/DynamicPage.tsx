import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router';
import { Box, Typography } from '@mui/material';
import PageProvider from '@pkg-layout/src/common/PageProvider';
import SelfServicePageProvider from '@pkg-layout/src/self-service/SelfServicePageProvider';
import PageListProvider from '@pkg-layout/src/list/PageListProvider';
import PageContainer from '@pkg-layout/src/common/PageContainer';
import useNotificationsManager from '@pkg-setup/src/serverEvents/useNotificationsManager';
import { HOME_ID } from '@pkg-constants/formIds';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import FormManagerProvider from '@pkg-form/FormManagerProvider';
import { SxProps } from '@mui/system';
import { getPageView } from '@pkg-core/schemas/pageViews';

const DynamicPage = ({
  id,
  layout = 'standard',
  forbiddenImage,
  errorImage,
  serverErrorImage,
  heroImage,
  overrides,
}: {
  id?: string;
  layout?: 'standard' | 'self-service';
  forbiddenImage: string;
  errorImage: string;
  serverErrorImage: string;
  heroImage: string;
  overrides: {
    includeGlobalSearch: boolean;
    textSx?: SxProps;
    backButtonSx?: SxProps;
  };
}) => {
  const { t: localizeUi } = useTranslation('common');

  const routeParams = useParams<{ category?: string; idKey?: string }>();
  const location = useLocation();

  const pageId = useMemo(() => {
    return id || routeParams?.category;
  }, [routeParams, id]);

  const idKey = useMemo(() => {
    return routeParams?.idKey;
  }, [routeParams]);

  const versionId = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get('versionId') as string;
  }, [location]);

  const isList = useMemo(() => {
    return location.pathname.indexOf('/list') > 0;
  }, [location]);

  useNotificationsManager(pageId, isList);

  const querySubType = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get('subType') as string;
  }, [location]);

  if (!pageId) {
    return <Typography>{localizeUi('ui.noSchema')}</Typography>;
  }

  if (isList) {
    return (
      <Box sx={{ marginTop: 20 }}>
        <ValidationsProvider>
          <FormManagerProvider>
            <PageContainer>
              <PageListProvider
                baseDataTestId={pageId}
                pageId={pageId}
                errorImage={errorImage}
                serverErrorImage={serverErrorImage}
                forbiddenImage={forbiddenImage}
                heroImage={heroImage}
                overrides={overrides}
              />
            </PageContainer>
          </FormManagerProvider>
        </ValidationsProvider>
      </Box>
    );
  }

  const Provider = layout === 'self-service' ? SelfServicePageProvider : PageProvider;
  const viewMode =
    getPageView(pageId, location.pathname, idKey, location.search) === 'detail' ? 'detail' : 'form';

  return (
    <Box sx={{ marginTop: pageId === HOME_ID ? 20 : 62 }}>
      <ValidationsProvider>
        <FormManagerProvider>
          <PageContainer>
            <Provider
              key={`${pageId}-${viewMode}-${idKey || 'new'}`}
              viewMode={viewMode}
              pageId={pageId}
              idKey={idKey}
              subType={querySubType}
              disabled={versionId?.length > 0}
              forbiddenImage={forbiddenImage}
              serverErrorImage={serverErrorImage}
              errorImage={errorImage}
              heroImage={heroImage}
              overrides={overrides}
            />
          </PageContainer>
        </FormManagerProvider>
      </ValidationsProvider>
    </Box>
  );
};

export default DynamicPage;
