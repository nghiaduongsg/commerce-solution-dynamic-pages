import React, { useMemo } from 'react';
import { DynamicSchemaTableListWidgetProps } from './DynamicSchemaTableListWidget.d';
import GenericTable from '@pkg-list/components/GenericTable';
import { useGroupByEntity } from './hooks/useGroupByEntity';
import useFormData from '@pkg-common/dataResolver/useFormData';
import SearchWidgetList from '@pkg-form/components/ConfigurableListWidget/SearchWidgetList';
import { AnyType } from '@pkg-common/types';
import { COMMON } from '@pkg-constants/translationNamespaces';
import DeprecationNotice from '@pkg-form/components/DeprecationNotice/DeprecationNotice';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';

const getListConfiguration = (entityName, config) => {
  return {
    ...config,
    collapsible: true,
    title: entityName,
  };
};

const getEmptyConfiguration = (entityName) => {
  return {
    'ui:labels': {
      namespace: '',
    },
    collapsible: true,
    title: entityName,
    tableId: `${entityName}Custom`,
    rowId: 'id',
    columns: [],
    filterEntities: false,
    url: '',
  };
};

const DynamicSchemaList = React.memo(
  ({ configuration, entityName }: { configuration: AnyType; entityName: string }) => {
    return configuration ? (
      <div style={{ marginBottom: 24 }}>
        <SearchWidgetList
          entitySourceId={entityName}
          parentId={entityName}
          fallbackSchemas={{
            configuration: getListConfiguration(entityName, configuration),
          }}
        />
      </div>
    ) : (
      // for cases which is not implemented from BE
      <div style={{ marginBottom: 24 }}>
        <GenericTable configuration={getEmptyConfiguration(entityName) as any} />
      </div>
    );
  },
);

const DynamicSchemaTableListWidget = ({ id, options }: DynamicSchemaTableListWidgetProps) => {
  const { sourceGroups, defaultValueFrom, config } = options;
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  // @ts-ignore
  const { groupedEntities } = useGroupByEntity({
    id,
    sourceGroups,
  });

  const { value: defaultValue } = useFormData(id, defaultValueFrom);

  const groupedEntityCodes = useMemo(() => {
    return Object.keys(groupedEntities || {}) as Array<string>;
  }, [groupedEntities]);

  const entityCodes = useMemo(() => {
    const entityCodesValues = defaultValue ? defaultValue.map((item) => item.entityCL) : [];
    return [...new Set(entityCodesValues)] as Array<string>;
  }, [defaultValue]);

  const extraEntityCodes = useMemo(() => {
    return entityCodes.filter((code) => groupedEntityCodes.indexOf(code) < 0);
  }, [entityCodes, groupedEntityCodes]);

  const allEntityCodes = useMemo(() => {
    return groupedEntityCodes.concat(extraEntityCodes);
  }, [groupedEntityCodes, extraEntityCodes]);

  return (
    <>
      <DeprecationNotice
        message={translate('widgetDeprecated', {
          ns: COMMON,
          componentName: 'DynamicSchemaTableListWidget',
          replacement: 'ArrayHandler',
          lng: selectedLanguage,
        })}
      />
      {allEntityCodes.map((entityName) => (
        <DynamicSchemaList
          key={entityName}
          configuration={config[entityName]}
          entityName={entityName}
        />
      ))}
    </>
  );
};

export default React.memo(DynamicSchemaTableListWidget, (prev, next) => {
  return prev.id === next.id && JSON.stringify(prev.options) === JSON.stringify(next.options);
});
