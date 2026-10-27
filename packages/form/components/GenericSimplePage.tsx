import React, { useCallback, useMemo, useRef } from 'react';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useEntity from '@pkg-entity/hooks/useEntity';
import { useTheme } from '@mui/material/styles';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import MainButton from '@pkg-form/components/MainButton/MainButton';
import ErrorSnackbar from './ErrorSnackbar/ErrorSnackbar';
import UiSchemaContext from '@pkg-form/UISchemaContext';
import { GenericPageProps } from '@pkg-form/components/GenericPage.d';
import { Box } from '@mui/material';
import LoadingBackdrop from '@pkg-common/components/LoadingBackdrop/LoadingBackdrop';
import useLoader from '@pkg-common/loader/useLoader';
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

const GenericSimplePage = ({
  schema,
  uiSchema,
  disabled = false,
  hideActionButtons = false,
  parentPageId = '',
  onSuccessCallback,
}: GenericPageProps) => {
  const styles = useStyles();
  const { visible } = useLoader();

  const pageId = uiSchema['ui:page']?.id;

  const { 'ui:mechanism': mechanism } = uiSchema;

  const { enabled = true, warnOnAction } = uiSchema['ui:mainButton'] || {};

  const { saveEntity, error, errorMessage, loading: loadingEntity, entity } = useEntity(pageId);
  const { formData, lastUpdate } = useEntityFormData(pageId);
  const { loading } = useApiDataState(pageId);
  const lastUpdateRef = useRef<number | undefined>(lastUpdate);
  const { clearDirtyFlags } = useFormManagerContext();

  const onSaveEntity = useCallback(
    (options?: { contextToken?: string }) => {
      if (options?.contextToken) {
        saveEntity(uiSchema, options.contextToken);
      } else {
        saveEntity(uiSchema);
      }
      clearDirtyFlags(pageId);
    },
    [uiSchema, saveEntity],
  );

  const finalData = useMemo(() => {
    if (lastUpdateRef.current !== lastUpdate) {
      lastUpdateRef.current = lastUpdate;
      return formData;
    }
    return entity;
  }, [entity, formData, lastUpdate]);

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
        {!hideActionButtons && (
          <Box sx={styles.buttonContainer}>
            <AppActions
              page={uiSchema['ui:page']}
              actions={uiSchema['ui:buttons'] || {}}
              checkPermissions={true}
            />
          </Box>
        )}

        <DynamicForm
          id={pageId}
          schema={schema}
          uiSchema={uiSchema}
          data={finalData}
          submitButton={
            enabled ? (
              <MainButton
                id={pageId}
                data={finalData[uiSchema['ui:page']?.idKey]}
                onSaveEntity={onSaveEntity}
                buttonProperties={uiSchema['ui:mainButton']}
                parentPageId={parentPageId}
              />
            ) : undefined
          }
          disabled={disabled}
          loading={loadingEntity}
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

export default GenericSimplePage;
