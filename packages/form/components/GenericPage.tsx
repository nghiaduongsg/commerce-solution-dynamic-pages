import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useEntity from '@pkg-entity/hooks/useEntity';
import { useTheme } from '@mui/material/styles';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import useButtonPress from '@pkg-common/button/useButtonPress';
import MainButton from '@pkg-form/components/MainButton/MainButton';
import { useNavigate, useLocation, useParams } from 'react-router';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import ErrorSnackbar from './ErrorSnackbar/ErrorSnackbar';
import UiSchemaContext from '@pkg-form/UISchemaContext';
import { GenericPageProps } from '@pkg-form/components/GenericPage.d';
import useSystem from '@pkg-setup/src/system/useSystem';
import { encodeText, hasValue } from '@pkg-common/utils';
import { Box, Fab } from '@mui/material';
import LoadingBackdrop from '@pkg-common/components/LoadingBackdrop/LoadingBackdrop';
import useLoader from '@pkg-common/loader/useLoader';
import usePageSubtype from '@pkg-layout/src/common/hooks/usePageSubtype';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useTranslation } from 'react-i18next';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const useStyles = () => {
  return {
    container: {
      width: '100%',
    },
    buttonContainer: {
      marginBottom: useTheme().spacing(3),
    },
    buttonContainerBottom: {
      display: 'flex',
      alignItems: 'flex-end',
      flexDirection: 'column',
    },
  };
};

const GenericPage = ({
  schema,
  uiSchema,
  disabled = false,
  hideActionButtons = false,
  onSuccessCallback,
}: GenericPageProps) => {
  const styles = useStyles();
  const { application, selectedLanguage } = useSystem();
  const { visible } = useLoader();
  const { t: translate } = useTranslation([COMMON]);

  const { search, pathname } = useLocation();

  const routeParams = useParams<{ idKey?: string; category: string }>();

  const isLocked = useMemo(() => {
    const query = new URLSearchParams(search);

    return query.get('readOnly') === 'true';
  }, [search]);

  const { 'ui:mechanism': mechanism } = uiSchema;

  const issApplication = useMemo(() => application === 'ISS', [application]);

  const lastUpdateRef = useRef<number | undefined>(undefined);

  const {
    type: mainButtonType,
    markPresses = true,
    enabled = true,
    values = {},
    warnOnAction,
  } = uiSchema['ui:mainButton'] || {};

  const { state } = useLocation();
  const navigate = useNavigate();
  const prefilledDataRef = useRef({});

  const {
    idKey,
    id: pageId,
    subTypeKey,
  } = useMemo(() => {
    return uiSchema['ui:page'] || {};
  }, [uiSchema['ui:page']]);

  const { formData, lastUpdate, setEntityFormData } = useEntityFormData(pageId);
  const mainButtonRoute = useDynamicApi(pageId, values);
  const { saveEntity, entity, error, errorMessage, loading: loadingEntity } = useEntity(pageId);
  const { loading } = useApiDataState(pageId);

  const category = useMemo(() => {
    return routeParams?.category;
  }, [routeParams]);

  const { pressed } = useButtonPress('submitButtonPressed');

  const shouldShowPage = useMemo(() => {
    if (hasValue(uiSchema) && !idKey) {
      return true;
    }
    if (!routeParams?.idKey) {
      return true;
    }
    if (routeParams?.category !== pageId) {
      return true;
    }
    if (entity[idKey] && loading === false) {
      return true;
    }
    return false;
  }, [loading, routeParams, entity, idKey, uiSchema, pageId]);
  const { clearDirtyFlags } = useFormManagerContext();

  const onSaveEntity = useCallback(
    (options?: { contextToken?: string }) => {
      if (options?.contextToken) {
        saveEntity(uiSchema, options?.contextToken);
      } else {
        saveEntity(uiSchema);
      }
      clearDirtyFlags(pageId);
    },
    [uiSchema, saveEntity],
  );

  const subType = usePageSubtype();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (entity && entity[idKey] && pressed && markPresses) {
      const encodedId = encodeText(entity[idKey]);

      if (location.pathname.indexOf(`/${encodedId}`) < 0 && !issApplication) {
        timeout = setTimeout(() => {
          const isFormDefinitionPage = pageId === 'FormDefinition';
          const subTypeQuery = isFormDefinitionPage ? '' : `?subType=${subType}`;

          clearTimeout(timeout);
          const path = subType
            ? `/${location.pathname.replace(
                window['CONTEXT_PATH'],
                '',
              )}/${encodedId}${subTypeQuery}`
            : `/${location.pathname.replace(window['CONTEXT_PATH'], '')}/${encodedId}`;
          if (location.pathname.slice(-5) !== '/list') {
            navigate(path);
          }
        }, 2000);
      } else if (issApplication) {
        const path =
          entity && entity[subTypeKey]
            ? `/page/${category}/${encodedId}?subType=${entity[subTypeKey]}`
            : `/page/${category}/${encodedId}`;
        navigate(path);
      }
    }
  }, [entity, pressed, subType]);

  const onNavigateEntity = useCallback(() => {
    localStorage.setItem('FORM_WIZARD_CONTEXT', JSON.stringify(formData));

    navigate(mainButtonRoute.url, {
      state: {
        prefilledData: formData,
      },
    });
  }, [formData, mainButtonRoute]);

  useEffect(() => {
    let prefilledData = state?.prefilledData;

    if (!prefilledData) {
      try {
        const storedContext = localStorage.getItem('FORM_WIZARD_CONTEXT');
        if (storedContext) {
          const contextData = JSON.parse(storedContext);
          if (pageId === 'FormDefinition' && subType === contextData.formTypeCode) {
            prefilledData = contextData;
          }
        }
      } catch {}
    }

    if (
      prefilledData &&
      JSON.stringify(prefilledDataRef.current) !== JSON.stringify(prefilledData)
    ) {
      prefilledDataRef.current = prefilledData;
      setEntityFormData(prefilledData, true);
    }
  }, [state?.prefilledData]);

  const finalData = useMemo(() => {
    if (lastUpdateRef.current !== lastUpdate) {
      lastUpdateRef.current = lastUpdate;
      return formData;
    }
    return entity;
  }, [entity, formData, lastUpdate, state?.prefilledData]);

  return (
    <UiSchemaContext.Provider value={uiSchema}>
      <LoadingBackdrop open={loading || loadingEntity || visible} />
      <Box sx={styles.container}>
        {error && (error?.innerViolations || [])?.length > 0 && (
          <ErrorSnackbar
            pageId={pageId}
            message={errorMessage}
            violations={error?.innerViolations || []}
            open={!!error?.innerViolations}
          />
        )}
        <DynamicForm
          id={pageId}
          schema={schema}
          uiSchema={uiSchema}
          data={finalData}
          lockButton={
            !disabled && isLocked ? (
              <Box
                sx={{
                  position: 'fixed',
                  top: '170px',
                  right: '5%',
                  zIndex: 1100,
                }}
              >
                <Fab
                  aria-label={translate('unlockPage', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  })}
                  id={`${pageId}-unlock-btn`}
                  color={'primary'}
                  onClick={() => navigate(pathname)}
                  data-testid={`${pageId}-unlock-btn`}
                  type="button"
                >
                  <AssetByType input="icons" name="Edit" />
                </Fab>
              </Box>
            ) : null
          }
          submitButton={
            enabled && !isLocked ? (
              <MainButton
                id={pageId}
                data={finalData[uiSchema['ui:page']?.idKey]}
                onSaveEntity={mainButtonType === 'redirect' ? onNavigateEntity : onSaveEntity}
                buttonProperties={uiSchema['ui:mainButton']}
              />
            ) : null
          }
          disabled={disabled}
          locked={isLocked}
          loading={!shouldShowPage}
          formContext={mechanism ? { mechanism } : undefined}
        />
        {!hideActionButtons && (
          <Box sx={styles.buttonContainerBottom}>
            <AppActions
              page={uiSchema['ui:page']}
              actions={uiSchema['ui:buttons:bottom'] || {}}
              checkPermissions={true}
              onSuccessCallback={onSuccessCallback}
            />
          </Box>
        )}
      </Box>
    </UiSchemaContext.Provider>
  );
};

export default GenericPage;
