import React, { useContext, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { Box, Grid } from '@mui/material';
import { DynamicFormProps } from './DynamicForm.d';
import ArrayTemplate from '@pkg-form/templates/ArrayTemplate/ArrayTemplate';
import FieldTemplate from '@pkg-form/templates/FieldTemplate/FieldTemplate';
import ObjectFieldTemplate from '@pkg-form/templates/ObjectTemplate/ObjectFieldTemplate';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import Form from './WidgetRenderer';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import Resource from '@pkg-common/components/Resource/Resource';
import { useTranslation } from 'react-i18next';
import {
  APPLY_SELECTED_FILTER_TO_LIST_SHORTCUT,
  CLEAR_SELECTED_FILTERS_SHORTCUT,
} from '@pkg-constants/keyboardShortcuts';
import { useParams } from 'react-router';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTheme } from '@mui/material/styles';
import FormManagerContext from '@pkg-form/FormManagerContext';
import useFormManager from '@pkg-form/useFormManager';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import validator from '@rjsf/validator-ajv8';

const DynamicForm = ({
  id,
  dataTestId,
  schema = {},
  uiSchema = {},
  data = {},
  disabled = false,
  locked = false,
  onSubmit,
  onChange,
  onClear,
  submitButton,
  lockButton,
  formContext = {},
  loading,
}: DynamicFormProps) => {
  const theme = useTheme();
  const { 'ui:disabled': uiDisabled, disabledFrom } = uiSchema;

  const routeParams = useParams<{ idKey?: string; category: string }>();
  const entityId = useMemo(() => {
    return routeParams?.idKey;
  }, [routeParams]);

  const disabledFromOwner = useMemo(() => {
    if (id?.includes('filters')) {
      return false;
    }
    return data.ownerCL === 'BASE';
  }, [data, id]);

  const namespace = useMemo(() => {
    if (!uiSchema) {
      return COMMON;
    }
    return uiSchema['ui:labels']?.namespace || COMMON;
  }, [uiSchema]);

  const apisToCall = useMemo(() => {
    if (!uiSchema) {
      return [];
    }
    return uiSchema?.callApis || [];
  }, [uiSchema]);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, COMMON]);

  const { check: disabledFromCondition } = useCheckFrom(id, disabledFrom);
  const { closeSnackbar } = useSnackbar();

  const disabledFromBaseOwner = useMemo(() => {
    return (
      disabledFromOwner &&
      !uiSchema['ui:ignoreOwnerCL'] &&
      id !== 'EntitySchema' &&
      id !== 'TranslationsManagement' &&
      id !== 'IssPageSchema' &&
      id !== 'CodelistItem' &&
      id !== 'Codelist' &&
      id !== 'IssCodelistItem' &&
      id !== 'IssCodelist' &&
      id !== 'SecurableObject'
    );
  }, [uiSchema, disabledFromOwner, data, id]);

  const isFormDisabled = useMemo(() => {
    return disabled || uiDisabled || disabledFromCondition || disabledFromBaseOwner || locked;
  }, [disabled, uiDisabled, disabledFromCondition, disabledFromBaseOwner, locked]);

  const isFormLocked = useMemo(() => {
    return !(disabled || uiDisabled || disabledFromCondition || disabledFromBaseOwner) && locked;
  }, [disabled, uiDisabled, disabledFromCondition, disabledFromBaseOwner, locked]);

  const hideFormButtons = formContext?.hideButtons;

  const omitValidationHints = useMemo(() => {
    if (!uiSchema) {
      return false;
    }
    return uiSchema['ui:labels']?.omitValidationHints || false;
  }, [uiSchema]);

  const avoidDefaultLoad = useMemo(() => {
    if (!uiSchema) {
      return false;
    }
    return uiSchema['ui:common']?.avoidDefaultLoad || false;
  }, [uiSchema]);

  const { idKey, url, customFieldsKey } = useMemo(() => {
    if (!uiSchema) {
      return {};
    }
    return uiSchema['ui:page'] || {};
  }, [uiSchema]);

  const mainButtonPosition = useMemo(() => {
    if (!uiSchema) {
      return {};
    }
    return uiSchema['ui:mainButton']?.position ?? 'DEFAULT';
  }, [uiSchema]);

  const onFormSubmit = ({ formData }) => {
    closeSnackbar();
    onSubmit && onSubmit(formData);
  };

  const includeButtons = useMemo(() => {
    if (isFormDisabled) {
      return false;
    }
    return !(!onClear && !onSubmit && !submitButton);
  }, [isFormDisabled, onClear, onSubmit, submitButton]);

  const formManager = useFormManager();
  const parentFormManager = useContext(FormManagerContext);

  return (
    <Box sx={formContext?.buttonPosition === 'ABSOLUTE' ? { paddingBottom: theme.spacing(0) } : {}}>
      {apisToCall.map((resource: { resourceId?: string; url: string }, i: number) => (
        <Resource
          key={`${resource.resourceId}-${i}`}
          resource={resource}
          resourceExtras={{ idKey, url, customFieldsKey }}
        />
      ))}

      {!loading && (
        <Box
          sx={formContext?.buttonPosition === 'ABSOLUTE' ? { marginBottom: theme.spacing(14) } : {}}
        >
          <ValidationsProvider>
            <FormManagerContext.Provider value={parentFormManager ?? formManager}>
              {includeButtons && !hideFormButtons && submitButton && mainButtonPosition === 'TOP'
                ? submitButton
                : null}
              {isFormLocked && !hideFormButtons && !submitButton && lockButton ? lockButton : null}
              <Form
                validator={validator}
                templates={{
                  ArrayFieldTemplate: ArrayTemplate,
                  FieldTemplate,
                  ObjectFieldTemplate,
                }}
                id={`${id}_FORM`}
                data-testid={`${id}_FORM`}
                idPrefix={id}
                disabled={isFormDisabled}
                schema={schema}
                uiSchema={uiSchema}
                formData={data}
                onSubmit={onFormSubmit}
                onChange={(data) => {
                  onChange && onChange(data?.formData ?? {});
                }}
                showErrorList={false}
                transformErrors={() => []}
                noValidate={false}
                noHtml5Validate={true}
                ArrayFieldTemplate={ArrayTemplate}
                FieldTemplate={FieldTemplate}
                ObjectFieldTemplate={ObjectFieldTemplate}
                formContext={{
                  formId: id,
                  dataTestId: dataTestId || id,
                  ...formContext,
                  namespace,
                  omitValidationHints,
                  avoidDefaultLoad,
                  entityId,
                  idKey: uiSchema['ui:page']?.idKey,
                  changeIndicators: uiSchema['ui:page']?.changeIndicators,
                  debounceUpdates: formContext?.debounceUpdates || false,
                  onChange,
                }}
              >
                <div></div>
              </Form>
            </FormManagerContext.Provider>
          </ValidationsProvider>
        </Box>
      )}

      {includeButtons && !hideFormButtons && submitButton && mainButtonPosition === 'DEFAULT'
        ? submitButton
        : null}
      {includeButtons && !submitButton && !hideFormButtons ? (
        <Grid
          container
          alignItems="center"
          justifyContent="flex-end"
          direction="row"
          spacing={2}
          sx={
            formContext?.buttonPosition === 'ABSOLUTE'
              ? {
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.palette.common.white,
                  width: '100%',
                  padding: theme.spacing(4),
                  borderTop: `1px solid ${theme.palette.grey[300]}`,
                  zIndex: 9,
                }
              : { marginTop: theme.spacing(4) }
          }
        >
          {onClear && (
            <Grid size={{ xs: 'auto' }}>
              <GenericButton
                id={`${id}-clear-btn`}
                testId={`${id}-clear-btn`}
                label={translate('clear', { ns: COMMON, lng: selectedLanguage })}
                ariaKeyboardShortcuts={CLEAR_SELECTED_FILTERS_SHORTCUT}
                ariaLabel={translate('clearButtonAriaLabel', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                })}
                variant="outlined"
                onClick={() => {
                  onClear && onClear();
                }}
              />
            </Grid>
          )}

          {onSubmit && (
            <Grid size={{ xs: 'auto' }}>
              <GenericButton
                id={`${id}-apply-btn`}
                testId={`${id}-apply-btn`}
                label={translate('apply', { ns: COMMON, lng: selectedLanguage })}
                ariaKeyboardShortcuts={APPLY_SELECTED_FILTER_TO_LIST_SHORTCUT}
                ariaLabel={translate('applyButtonAriaLabel', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                })}
                type="button"
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  onSubmit(data);
                }}
              />
            </Grid>
          )}
        </Grid>
      ) : null}
    </Box>
  );
};

export default DynamicForm;
