import React, { useMemo } from 'react';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import { Box, Chip, Typography } from '@mui/material';
import { ConfigurableListWidgetProps } from './ConfigurableListWidget.d';
import { getFieldLabel, getLinkRoute, getRawValue } from './utils/formWidgetUtils';
import useFormData from '@pkg-common/dataResolver/useFormData';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import Resource from '@pkg-common/components/Resource/Resource';
import { useTranslation } from 'react-i18next';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import useFormField from '@pkg-entity/hooks/useFormField';
import useSystem from '@pkg-setup/src/system/useSystem';
import { hasValue } from '@pkg-common/utils';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import useEntity from '@pkg-entity/hooks/useEntity';

const useStyles = () => {
  return {
    container: {
      width: 700,
    },
  };
};

const EntityReadOnlyWidget = ({
  id,
  options,
  uiSchema,
  formContext,
  serverErrors,
  diffs,
}: ConfigurableListWidgetProps) => {
  const {
    translation,
    dependency,
    slim,
    applyValueFromComparison,
    enableLinkFrom,
    defaultValueFrom,
    callApis,
    validations,
    validateFrom,
    validateWhen,
  } = options;

  const {
    entityFields = [],
    fieldKeyAs,
    isFlat = false,
    redirectLinkEnabled = true,
    entityIdKey,
    idKeyAs,
    entitySource,
    entityId,
    configuration = {},
    pageRedirectUrl,
    overrides,
    loadDetails,
    entitySchema,
    entityUiSchema,
    excludeFromLabel = [],
  } = dependency;
  const { key } = translation || {};
  const styles = useStyles();

  const { selectedLanguage } = useSystem();
  const { value } = useFormField(id, undefined, false);

  const { value: entitySourceId } = useFormData(id, entitySource, true);

  const { entity } = useEntity(entityId);
  const { dependency: overridesDependency } = useMemo(() => {
    if (overrides && entitySourceId && overrides[entitySourceId]) {
      return overrides[entitySourceId];
    }
    return {};
  }, [entitySourceId, overrides]);

  const { errors } = useTextWidgetValidations(
    id,
    getRawValue(
      isFlat,
      value,
      idKeyAs || entityIdKey || overridesDependency?.idKeyAs || overridesDependency?.entityIdKey,
    ),
    validations,
    serverErrors || [],
    validateFrom,
    validateWhen,
  );

  const finalIdKey =
    idKeyAs || entityIdKey || overridesDependency?.idKeyAs || overridesDependency?.entityIdKey;

  const { t: translate } = useTranslation([formContext?.namespace || '']);
  const { entityUrl } = configuration;
  const { multiple = false } = configuration?.selections || {};

  useDefaultValueFrom(id, defaultValueFrom);
  useApplyValueFromComparison(id, 'READ', applyValueFromComparison);
  const { check: showLink } = useCheckFrom(id, enableLinkFrom, true);

  const linkRoute = useMemo(() => {
    const redirectUrl = pageRedirectUrl ?? entityUrl;
    return getLinkRoute(
      entityId || entitySourceId,
      !!entitySourceId,
      redirectUrl,
      getRawValue(isFlat, value, idKeyAs || entityIdKey),
    );
  }, [entityId, entitySourceId, entityUrl, entityIdKey, idKeyAs, value, isFlat]);

  const finalRoute = useMemo(() => {
    if (getRawValue(isFlat, value, idKeyAs || entityIdKey) && showLink && redirectLinkEnabled) {
      return linkRoute;
    }
    return undefined;
  }, [linkRoute, showLink]);

  return (
    <>
      <Box key={`${id}-${entityFields[0]}`}>
        {callApis?.map((resource) => (
          <Resource key={resource.resourceId} resource={resource} widgetId={id} />
        ))}
        {multiple && hasValue(value) ? (
          <Box sx={styles.container}>
            <Typography
              variant="overline"
              color="textSecondary"
              component="div"
              align={'left'}
              id={`content-${id}-title`}
              data-testid={`content-${id}-title`}
            >
              {translate(key, { ns: formContext?.namespace, lng: selectedLanguage })}
            </Typography>
            {value.map((v) => (
              <Chip
                key={`${id}_${v}-readonly`}
                id={`${id}-${v}`}
                data-testid={`${id}-${v}`}
                size="medium"
                variant="outlined"
                clickable={false}
                label={getFieldLabel(
                  v,
                  isFlat,
                  fieldKeyAs ? [fieldKeyAs] : entityFields,
                  excludeFromLabel,
                  finalIdKey,
                )}
              />
            ))}
            <ValidationErrors
              id={id}
              clientErrors={errors}
              serverErrors={serverErrors}
              diffs={diffs}
              dirty={true}
            />
          </Box>
        ) : (
          <ReadOnlyField
            id={id}
            title={translate(key, { ns: formContext?.namespace, lng: selectedLanguage })}
            value={
              getFieldLabel(
                value,
                isFlat,
                overrides
                  ? overridesDependency?.fieldKeyAs
                    ? [overridesDependency?.fieldKeyAs]
                    : overridesDependency?.entityFields
                  : fieldKeyAs
                    ? [fieldKeyAs]
                    : entityFields,
                excludeFromLabel,
                finalIdKey,
              ) || '-'
            }
            slim={slim}
            linkRoute={finalRoute}
            uiSchema={uiSchema}
            errors={
              <ValidationErrors
                id={id}
                clientErrors={errors}
                serverErrors={serverErrors}
                diffs={diffs}
                dirty={true}
              />
            }
          />
        )}
      </Box>
      {loadDetails && (
        <Box>
          <DynamicForm
            id={entityId}
            schema={entitySchema}
            uiSchema={entityUiSchema}
            data={entity}
            disabled={true}
            loading={false}
          />
        </Box>
      )}
    </>
  );
};

export default EntityReadOnlyWidget;
