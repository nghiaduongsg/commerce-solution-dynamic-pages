import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GenericTable from '@pkg-list/components/GenericTable';
import { SEARCH_FORM } from '@pkg-constants/screenTypeIds';
import { AnyType } from '@pkg-common/types';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { mergeWith } from 'lodash';
import { TableConfiguration } from '@pkg-list/src/types';
import { hasValue } from '@pkg-common/utils';

const replaceArraysCustomizer = (_, srcValue) => {
  if (Array.isArray(srcValue)) {
    return srcValue;
  }
  return undefined;
};

const mergeObjects = (configuration, overrideConfiguration) =>
  mergeWith({}, configuration, overrideConfiguration || {}, replaceArraysCustomizer);

const getFinalConfig = (
  configuration: TableConfiguration,
  onSelectionsApplied,
  onCancel,
  widgetLabel,
  isDisabled,
) => {
  return {
    ...configuration,
    'ui:buttons': {} as any,
    filtersType: 'COLLAPSE',
    filtersMode: configuration?.filtersMode ?? 'ON_CLICK',
    actionDetailsCodeList: false,
    showTitle: true,
    avoidDefaultLoad: hasValue(configuration?.avoidDefaultLoad)
      ? configuration?.avoidDefaultLoad
      : false,
    tableId: configuration?.tableId || `${widgetLabel}`,
    selections: configuration?.selections
      ? { ...configuration?.selections, onSelectionsApplied, onCancel }
      : {
          enabled: true,
          multiple: false,
          onSelectionsApplied,
          onCancel,
        },
    pagination: configuration?.pagination
      ? configuration?.pagination
      : {
          enabled: true,
          pageSizes: [5, 10, 15],
          defaultPageSize: 5,
        },
    isDisabled,
  };
};

export default function SearchWidgetList({
  parentId,
  entitySourceId,
  widgetLabel,
  fallbackSchemas,
  onSelectionsApplied,
  onCancel,
  initialState,
  enableConfigMerge = false,
  disabled = false,
}: {
  parentId: string;
  entitySourceId: string;
  widgetLabel?: string;
  fallbackSchemas: {
    configuration: TableConfiguration;
    schema?: AnyType;
    uiSchema?: AnyType;
  };
  onSelectionsApplied?: (selectedEntities) => void;
  onCancel?: () => void;
  initialState?: AnyType;
  enableConfigMerge?: boolean;
  disabled?: boolean;
}) {
  const [schemas, setSchemas] = useState<AnyType>(null);
  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const {
    configuration: fallbackConfiguration,
    schema: fallbackSchema,
    uiSchema: fallbackUiSchema,
  } = fallbackSchemas || {};

  const useProvidedConfiguration = useMemo(() => {
    return hasValue(fallbackConfiguration) && !entitySourceId;
  }, [fallbackConfiguration, entitySourceId]);

  const mergeConfiguration = useMemo(() => {
    return fallbackConfiguration && entitySourceId;
  }, [fallbackConfiguration, entitySourceId]);

  const mergeSchema = useMemo(() => {
    return fallbackSchema && entitySourceId;
  }, [fallbackSchema, entitySourceId]);

  const mergeUiSchema = useMemo(() => {
    return fallbackUiSchema && entitySourceId;
  }, [fallbackUiSchema, entitySourceId]);

  useEffect(() => {
    if (!useProvidedConfiguration) {
      window.LIST = widgetLabel || entitySourceId;
    }
  }, [widgetLabel, entitySourceId, useProvidedConfiguration]);

  const filterSchema = useMemo(
    () => (mergeSchema ? mergeObjects(schemas?.schema, fallbackSchema) : schemas?.schema),
    [schemas, fallbackSchema, mergeSchema],
  );

  const filterUiSchema = useMemo(
    () => (mergeUiSchema ? mergeObjects(schemas?.uiSchema, fallbackUiSchema) : schemas?.uiSchema),
    [schemas, fallbackSchema, mergeUiSchema],
  );

  const configuration = useMemo(() => {
    if (useProvidedConfiguration) {
      return {
        ...fallbackConfiguration,
        avoidDefaultLoad: fallbackConfiguration?.avoidDefaultLoad || false,
        filtersType: fallbackConfiguration.filtersType ?? 'COLLAPSE',
        isDisabled: fallbackConfiguration?.isDisabled ?? disabled,
        selections: {
          ...fallbackConfiguration?.selections,
          onSelectionsApplied,
          onCancel,
        },
      };
    }

    return getFinalConfig(
      mergeConfiguration
        ? mergeObjects(schemas?.configuration, fallbackConfiguration)
        : schemas?.configuration,
      onSelectionsApplied,
      onCancel,
      widgetLabel || entitySourceId,
      disabled,
    );
  }, [
    entitySourceId,
    widgetLabel,
    schemas,
    fallbackConfiguration,
    mergeConfiguration,
    useProvidedConfiguration,
    onSelectionsApplied,
    onCancel,
    disabled,
  ]);

  const finalInitialState = useMemo(() => JSON.stringify(initialState || {}), [initialState]);

  if (useProvidedConfiguration && !enableConfigMerge) {
    return (
      <GenericTable
        parentId={parentId}
        entityUrl={fallbackConfiguration?.entityUrl}
        filterSchema={fallbackSchema}
        filterUiSchema={fallbackUiSchema}
        configuration={configuration as any}
        initialState={finalInitialState}
        delayInitialisation={true}
      />
    );
  }

  return (
    <SchemasController
      pageId={entitySourceId}
      screenType={SEARCH_FORM}
      onSchemasReady={setAllSchemas}
    >
      <GenericTable
        parentId={parentId}
        entityUrl={configuration?.entityUrl}
        filterSchema={filterSchema}
        filterUiSchema={filterUiSchema}
        configuration={configuration as any}
        initialState={finalInitialState}
        delayInitialisation={true}
      />
    </SchemasController>
  );
}
