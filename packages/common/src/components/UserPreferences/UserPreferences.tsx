import React, { useCallback, useMemo, useState } from 'react';
import GenericPage from '@pkg-form/components/GenericPage';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import { AnyType } from '@pkg-common/types';
import { DEFAULT_CODELISTS } from '@pkg-constants/apiRequests';
import TranslationsController from '@pkg-core/TranslationsController';
import { USER_PREFERENCES } from '@pkg-constants/formIds';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import FormManagerProvider from '@pkg-form/FormManagerProvider';

const getStyles = (theme) => {
  return {
    mainContent: {
      padding: theme.spacing(6),
      marginTop: '80px',
    },
  };
};

const UserPreferences = () => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const [schemas, setSchemas] = useState<AnyType>({});

  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const { namespace = '' } = useMemo(() => {
    if (!schemas.uiSchema) {
      return {};
    }
    return schemas.uiSchema['ui:labels'] || {};
  }, [schemas.uiSchema]);

  return (
    <ValidationsProvider>
      <FormManagerProvider>
        <Box sx={styles.mainContent}>
          <SchemasController
            pageId={USER_PREFERENCES}
            screenType={SINGLE_RECORD_FORM}
            onSchemasReady={setAllSchemas}
          >
            <TranslationsController
              pageId={USER_PREFERENCES}
              namespace={namespace}
              codelists={DEFAULT_CODELISTS}
            >
              <GenericPage schema={schemas?.schema} uiSchema={schemas?.uiSchema} />
            </TranslationsController>
          </SchemasController>
        </Box>
      </FormManagerProvider>
    </ValidationsProvider>
  );
};

export default UserPreferences;
