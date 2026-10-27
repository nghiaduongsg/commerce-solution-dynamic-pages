import React, { useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import SearchEntityWidget from '@pkg-form/components/ConfigurableListWidget/SearchEntityWidget';
import NewEntityWidget from '@pkg-form/components/ConfigurableListWidget/NewEntityWidget';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import { ConfigurableListWidgetProps } from './ConfigurableListWidget.d';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import useTable from '@pkg-list/hooks/useTable';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useFormField from '@pkg-entity/hooks/useFormField';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { getLinkRoute, getRawValue } from './utils/formWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import Resource from '@pkg-common/components/Resource/Resource';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import SearchWidgetList from '@pkg-form/components/ConfigurableListWidget/SearchWidgetList';
import useEntity from '@pkg-entity/hooks/useEntity';

const EntityWidget = ({
  id,
  options,
  serverErrors,
  diffs,
  value: innerValue,
  onChange,
  label: widgetLabel,
  formContext,
  disabled,
}: ConfigurableListWidgetProps) => {
  const {
    translation,
    validations,
    validateWhen,
    dependency,
    applyValueFromComparison,
    defaultValueFrom,
    enableLinkFrom,
    callApis,
    warnOnChange,
  } = options;

  const {
    entityId,
    entityIdKey: entityIdKeyProvided,
    idKeyAs,
    fieldKeyAs,
    entitySource,
    entityFields = [],
    isFlat = false,
    redirectLinkEnabled = true,
    selectEnabled = true,
    createEnabled = true,
    filterUiSchema,
    filterSchema,
    configuration,
    entitySchema,
    entityUiSchema,
    overrides,
    selectAll,
    pageRedirectUrl,
    excludeFromLabel,
    loadDetails = false,
    editable = false,
    searchById = {
      enabled: false,
      idParam: 'ids',
    },
    enableConfigMerge = false,
  } = dependency || {};

  const { key } = translation || {};

  const useDefaultMechanism = formContext?.mechanism === 'DEFAULT';
  const { value, setFieldValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    false,
  );

  const { entityUrl, tableId } = configuration || {};
  const { rowIdKey: entityIdKeyStore } = useTable(tableId || entityId);
  const entityIdKey =
    entityIdKeyStore && entityIdKeyStore.length > 0 ? entityIdKeyStore : entityIdKeyProvided;
  // @ts-ignore
  const { value: entitySourceId } = useFormData(id, { ...entitySource, operator: 'first' });

  useDefaultValueFrom(id, defaultValueFrom, !isFlat ? entityIdKey : undefined);
  useApplyValueFromComparison(id, 'EDIT', applyValueFromComparison);
  const { check: showLink } = useCheckFrom(id, enableLinkFrom, true);

  const { clearEntity } = useEntity(entityId || entitySourceId);

  const [selectedTab, setSelectedTab] = useState(0);

  const {
    dependency: overridesDependency,
    configuration: overridesConfiguration,
    filterUiSchema: overridesFilterUiSchema,
    filterSchema: overridesFilterSchema,
  } = useMemo(() => {
    if (overrides && entitySourceId && overrides[entitySourceId]) {
      return overrides[entitySourceId];
    }
    return {};
  }, [entitySourceId, overrides]);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([formContext?.namespace || '', ACCESSIBILITY, COMMON]);
  const { errors } = useTextWidgetValidations(
    id,
    getRawValue(
      isFlat,
      value,
      idKeyAs || entityIdKey || overridesDependency?.idKeyAs || overridesDependency?.entityIdKey,
    ),
    validations,
    serverErrors || [],
    undefined,
    validateWhen,
  );

  const linkRoute = useMemo(() => {
    const redirectUrl =
      (pageRedirectUrl || overridesDependency?.pageRedirectUrl) ??
      (entityUrl || overridesDependency?.entityUrl);
    return getLinkRoute(
      entityId || entitySourceId,
      !!entitySourceId,
      redirectUrl,
      getRawValue(isFlat, value, idKeyAs || overridesDependency?.idKeyAs || entityIdKey),
    );
  }, [entityId, entitySourceId, entityUrl, entityIdKey, idKeyAs, value, isFlat]);

  const finalRoute = useMemo(() => {
    if (redirectLinkEnabled && showLink) {
      return linkRoute;
    }

    return undefined;
  }, [linkRoute, showLink, redirectLinkEnabled]);

  const { idKey, url, customFieldsKey } = useMemo(() => {
    if (!entityUiSchema) {
      return {};
    }
    return entityUiSchema['ui:page'] || {};
  }, [entityUiSchema]);

  const NewWidget = (
    <>
      {callApis?.map((resource, i) => (
        <Resource
          key={`${resource.resourceId || resource.resourcePath?.toString()}_${value}-${i}`}
          resource={resource}
          widgetId={id}
          resourceExtras={{ idKey, url, customFieldsKey }}
        />
      ))}
      <NewEntityWidget
        value={value}
        onChange={(value) => {
          setFieldValue(value);
        }}
        title={translate(key, { ns: formContext?.namespace, lng: selectedLanguage })}
        entityId={entityId || entitySourceId}
        entityIdKey={overrides ? overridesDependency?.entityIdKey : entityIdKey}
        entityFields={overrides ? overridesDependency?.entityFields : entityFields}
        uiSchema={entityUiSchema}
        schema={entitySchema}
        isFlat={isFlat}
        loadDetails={loadDetails}
        editable={editable}
        id={id}
      />
      <ValidationErrors
        id={id}
        clientErrors={errors}
        serverErrors={serverErrors}
        diffs={diffs}
        dirty={dirty}
      />
    </>
  );
  const SearchWidget = (
    <>
      {callApis?.map((resource, i) => (
        <Resource key={`${resource.resourceId}-${i}`} resource={resource} widgetId={id} />
      ))}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <SearchEntityWidget
          parentId={id}
          widgetLabel={entitySource ? entitySourceId || entityId : widgetLabel}
          value={value}
          onChange={(value) => {
            setFieldValue(value);
          }}
          selectAll={selectAll}
          warnOnChange={warnOnChange}
          namespace={formContext?.namespace}
          entitySourceId={entitySourceId || entityId}
          idKeyAs={overrides ? overridesDependency?.idKeyAs : idKeyAs}
          fieldKeyAs={overrides ? overridesDependency?.fieldKeyAs : fieldKeyAs}
          entityIdKey={overrides ? overridesDependency?.entityIdKey : entityIdKey}
          entityFields={overrides ? overridesDependency?.entityFields : entityFields}
          isFlat={isFlat}
          uiSchema={overridesFilterUiSchema || filterUiSchema}
          schema={overridesFilterSchema || filterSchema}
          configuration={overridesConfiguration || configuration}
          linkRoute={finalRoute}
          options={options}
          entitySource={entitySource}
          formContext={formContext}
          excludeFromLabel={excludeFromLabel}
          valid={!dirty || (errors?.length === 0 && serverErrors?.length === 0)}
          filters={true}
          searchById={searchById}
        />
        <div style={{ marginLeft: 4, marginTop: 4 }}>
          <ValidationErrors
            id={id}
            clientErrors={errors}
            serverErrors={serverErrors}
            diffs={diffs}
            dirty={dirty}
          />
        </div>
      </Box>
    </>
  );

  const simpleView = useMemo(
    () => !createEnabled && !selectEnabled,
    [createEnabled, selectEnabled],
  );

  const tabView = useMemo(() => createEnabled && selectEnabled, [createEnabled, selectEnabled]);
  const searchView = useMemo(() => selectEnabled && !createEnabled, [createEnabled, selectEnabled]);
  const addView = useMemo(() => !selectEnabled && createEnabled, [createEnabled, selectEnabled]);

  return (
    <>
      {tabView && (
        <>
          <Tabs
            value={selectedTab}
            onChange={(_e, selected) => setSelectedTab(selected)}
            scrollButtons="auto"
            variant="scrollable"
            textColor="primary"
            indicatorColor="secondary"
            role="tablist"
          >
            <Tab
              key={`${id}_tab_0`}
              label={translate('addExisting', { ns: COMMON, lng: selectedLanguage })}
              id={`${id}-tab-0`}
              aria-label={translate('addExisting', { ns: COMMON, lng: selectedLanguage })}
              tabIndex={0}
              role={'tab'}
            />
            <Tab
              key={`${id}_tab_1`}
              onClick={() => {
                setFieldValue(isFlat ? undefined : {}, 'clearOnTabClick');
                clearEntity();
              }}
              label={translate('createNew', { ns: COMMON, lng: selectedLanguage })}
              id={`${id}-tab-1`}
              aria-label={translate('createNew', { ns: COMMON, lng: selectedLanguage })}
              tabIndex={0}
              role={'tab'}
            />
          </Tabs>
          {selectedTab === 0 && SearchWidget}
          {selectedTab === 1 && NewWidget}
        </>
      )}
      {searchView && SearchWidget}
      {addView && NewWidget}
      {simpleView && (
        <SearchWidgetList
          parentId={id}
          entitySourceId={entitySourceId || entityId}
          widgetLabel={widgetLabel}
          fallbackSchemas={{
            schema: overridesFilterSchema || filterSchema,
            uiSchema: overridesFilterUiSchema || filterUiSchema,
            configuration: overridesConfiguration || configuration,
          }}
          initialState={{ selectedRowIds: { 0: {} }, mappedData: [], multiple: false, disabled }}
          enableConfigMerge={enableConfigMerge}
          disabled={disabled}
        />
      )}
    </>
  );
};

export default EntityWidget;
