import React, { useEffect, useMemo } from 'react';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import useFieldVisibility from '@pkg-form/hooks/useFieldVisibility';
import AccordionFieldTemplate from '@pkg-form/templates/FieldTemplate/AccordionFieldTemplate';
import HeaderFieldTemplate from './HeaderFieldTemplate';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useClearFrom from '@pkg-form/hooks/useClearFrom';
import FormGroupDividerTitle from '@pkg-form/groups/FormGroupDividerTitle';
import useValueFrom from '@pkg-form/hooks/useValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import HeaderTitle from '@pkg-form/templates/FieldTitle/HeaderTitle';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useCalculate from '@pkg-form/hooks/useCalculate';
import { hasValue } from '@pkg-common/utils/utils';
import useDiffsComparison from '@pkg-common/dataComparison/useFieldDiffs';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@pkg-common/utils';
import useDate from '@pkg-common/hooks/useDate';
import { DATE_CODES } from '@pkg-constants/codeListVariables';
import useClearApiData from '@pkg-core/apiData/hooks/useClearApiData';
import { useTheme } from '@mui/material/styles';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import WithInfoPieces from '@pkg-form/groups/WithInfoPieces';
import { Box } from '@mui/material';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const FieldTemplate = ({
  children,
  uiSchema,
  schema,
  disabled,
  readonly,
  id,
  formContext,
  label,
  onChange,
  value: innerValue,
}) => {
  const { namespace, mechanism } = formContext;
  const useDefaultMechanism = mechanism === 'DEFAULT';
  const defaultValue = uiSchema['ui:value'];
  const defaultValueApplyWhen = uiSchema['ui:valueApplyWhen'];
  const name = uiSchema['ui:name'];
  const template = uiSchema['ui:template'];
  const templateStyle = uiSchema['ui:template:style'];
  const options = uiSchema['ui:options'] || {};
  const buttons = uiSchema['ui:template:buttons'] || {};
  const cardTemplateColors = uiSchema['ui:card:colors'];
  const info = uiSchema['ui:information'];
  const widgetButtons = uiSchema['ui:buttons'];
  const isArray = !!uiSchema?.items;
  const isPage = !!uiSchema['ui:page'];
  const isGroupObjectField = uiSchema['ui:field'] === 'GroupObjectField';

  const {
    translation = {},
    clearFrom,
    valueFrom,
    validateWhen,
    calculateFrom,
    collapseStatus,
  } = options;

  const { type } = schema;
  const { key } = translation;
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, COMMON]);
  const { apisFinished } = useClearApiData();

  const allInfoPieces = useMemo(() => {
    if (!info) {
      return [];
    }
    if (Array.isArray(info)) {
      return info.map((p) => (p?.namespace ? p : { ...p, namespace }));
    } else {
      return [{ ...info, namespace: info?.namespace ?? namespace }];
    }
  }, [info, namespace]);

  const { readOnlyLabel, omitValidationHints, required } = useWidgetUtils(
    schema,
    options,
    formContext,
  );

  const { securableObjects, applyPermissions } = useSystem();
  const isElementAllowed = useMemo(() => {
    if (!applyPermissions) {
      return true;
    }
    return securableObjects[name];
  }, [applyPermissions, name, securableObjects]);

  const { hasDiffs } = useDiffsComparison(id);
  const { isFormValid, setFieldErrors } = useValidationsContext();
  const { isFieldDirty, setFieldDirty } = useFormManagerContext();
  const { isFormValidServerSide } = useFormValidity(id);
  const { check: shouldValidate } = useCheckFrom(id, validateWhen, true);
  const { visible, preventRender } = useFieldVisibility(id, readonly, disabled, options);

  const { value, setFieldValue } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  useClearFrom(id, clearFrom);
  useValueFrom(id, valueFrom, type);
  useCalculate(id, calculateFrom);
  const { check: applyDefaultValue } = useCheckFrom(id, defaultValueApplyWhen, true);
  const dateFormat = useDate(DATE_CODES.date) || 'dd/MM/yyyy';

  useEffect(() => {
    if (hasValue(defaultValue) && !hasValue(value) && apisFinished && applyDefaultValue) {
      setFieldValue(
        defaultValue === 'TODAY' ? formatDate(new Date(), dateFormat) : defaultValue,
        'defaultValue',
      );
    }
  }, [defaultValue, value, setFieldValue, apisFinished, applyDefaultValue]);

  useEffect(() => {
    if (!visible) {
      setFieldErrors(id, []);
      setFieldDirty(id, false);
      if (preventRender) {
        setFieldValue(undefined, 'FieldTemplate');
      }
    }

    return () => {
      setFieldErrors(id, []);
    };
  }, [visible, id, preventRender]);

  if (name && !isElementAllowed) {
    return null;
  }

  if (!visible) {
    return preventRender ? null : <div style={{ display: 'none', height: 0 }}>{children}</div>;
  }

  const omitButtons = isArray || isPage || isGroupObjectField;
  const renderedButtons = omitButtons ? undefined : widgetButtons;
  const hasError =
    !isFormValidServerSide || (shouldValidate && isFieldDirty(id) && !isFormValid(id));

  if (readonly && disabled) {
    return (
      <WithButtons
        page={uiSchema['ui:page'] ?? { id }}
        buttons={renderedButtons}
        value={value}
        label={readOnlyLabel}
      >
        {children}
      </WithButtons>
    );
  }

  switch (template) {
    case 'AccordionTemplate':
      return (
        <AccordionFieldTemplate
          id={id}
          title={
            <StyledFieldLabel
              label={translate(key || label, { ns: namespace, lng: selectedLanguage })}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          }
          error={hasError}
          info={hasDiffs}
          collapseStatus={collapseStatus}
          buttons={buttons}
          information={allInfoPieces}
        >
          <WithButtons
            page={uiSchema['ui:page'] ?? { id }}
            buttons={renderedButtons}
            value={value}
            label={readOnlyLabel}
          >
            {children}
          </WithButtons>
        </AccordionFieldTemplate>
      );
    case 'Header':
      return (
        <HeaderFieldTemplate
          id={id}
          title={
            <HeaderTitle
              id={id}
              testId={id}
              title={
                <StyledFieldLabel
                  label={translate(key || label, { ns: namespace, lng: selectedLanguage })}
                  required={required}
                  omitValidationHints={omitValidationHints}
                />
              }
              buttons={buttons}
              information={allInfoPieces}
            />
          }
          isValid={isFormValidServerSide || isFormValid(id)}
        >
          <WithButtons
            page={uiSchema['ui:page'] ?? { id }}
            buttons={renderedButtons}
            value={value}
            label={readOnlyLabel}
          >
            {children}
          </WithButtons>
        </HeaderFieldTemplate>
      );
    case 'Divider':
      return (
        <>
          <FormGroupDividerTitle
            id={id}
            title={
              <StyledFieldLabel
                label={translate(key || label, { ns: namespace, lng: selectedLanguage })}
                required={required}
                omitValidationHints={omitValidationHints}
              />
            }
            buttons={buttons}
            information={allInfoPieces}
          />
          <WithButtons
            page={uiSchema['ui:page'] ?? { id }}
            buttons={renderedButtons}
            value={value}
            label={readOnlyLabel}
          >
            {children}
          </WithButtons>
        </>
      );
    case 'ExpandableCard':
      return (
        <GenericCard
          id={id}
          title={
            <StyledFieldLabel
              label={translate(key || label, { ns: namespace, lng: selectedLanguage })}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          }
          collapsible={true}
          cardColors={cardTemplateColors}
          actions={<AppActions page={{ id }} actions={buttons} checkPermissions={true} />}
          information={allInfoPieces}
        >
          <WithButtons
            page={uiSchema['ui:page'] ?? { id }}
            buttons={renderedButtons}
            value={value}
            label={readOnlyLabel}
          >
            {children}
          </WithButtons>
        </GenericCard>
      );
    case 'Card':
      return (
        <GenericCard
          id={id}
          title={
            <StyledFieldLabel
              label={translate(key || label, { ns: namespace, lng: selectedLanguage })}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          }
          cardColors={cardTemplateColors}
          actions={<AppActions page={{ id }} actions={buttons} checkPermissions={true} />}
          information={allInfoPieces}
        >
          <WithButtons
            page={uiSchema['ui:page'] ?? { id }}
            buttons={renderedButtons}
            value={value}
            label={readOnlyLabel}
          >
            {children}
          </WithButtons>
        </GenericCard>
      );
    default:
      return (
        <WithColoredBackground id={id} templateType={templateStyle}>
          <WithInfoPieces id={id} info={allInfoPieces}>
            <WithButtons
              page={uiSchema['ui:page'] ?? { id }}
              buttons={renderedButtons}
              value={value}
              label={readOnlyLabel}
            >
              {children}
            </WithButtons>
          </WithInfoPieces>
        </WithColoredBackground>
      );
  }
};

export default FieldTemplate;

const WithButtons = ({ children, buttons, page = {} as any, value, label }) => {
  const theme = useTheme();
  if (!buttons || buttons.length === 0) {
    return children;
  }

  return (
    <div style={{ display: 'flex' }}>
      {children}
      <AppActions
        page={{
          ...page,
          refersTo: value || label ? `${label} ${value?.identificationLabel ?? value}` : undefined,
        }}
        actions={buttons || {}}
        checkPermissions={true}
        sx={{ marginTop: theme.spacing(6), marginLeft: theme.spacing(3) }}
        parentId={page?.id}
      />
    </div>
  );
};

const WithColoredBackground = ({
  id,
  children,
  templateType,
}: {
  id: string;
  children: React.ReactElement;
  templateType?: 'FULL' | 'DEFAULT';
}) => {
  const theme = useTheme();

  if (templateType === 'FULL') {
    return (
      <Box
        sx={{ background: theme.palette.primary.light, padding: theme.spacing(4) }}
        id={`${id}-info-tooltip`}
      >
        {children}
      </Box>
    );
  }

  return children;
};
