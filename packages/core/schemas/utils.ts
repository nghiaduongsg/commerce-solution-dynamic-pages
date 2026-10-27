import { ENTITIES_WITH_HISTORY, HISTORY } from '@pkg-constants/formIds';
import { replaceInObjectRegex } from '@pkg-common/utils';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';

// @ts-ignore
const attachObjectAccessGroups = (entityIdKey: string, entity: string, pageUrl: string) => {
  return {
    key: 'objectAccessGroups',
    schema: {
      type: 'object',
      properties: {
        objectAccessGroupsTable: {
          type: 'string',
        },
        objectAccessGroups: {
          type: 'array',
          items: {
            properties: {
              objectAccessGroup: {
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
    },
    uiSchema: {
      'ui:page': {
        url: pageUrl,
        idKey: entityIdKey,
        id: entity,
      },
      'ui:labels': {
        namespace: 'objectAccessGroup',
      },
      //Table
      objectAccessGroupsTable: {
        'ui:widget': 'ConfigurableListWidget',
        'ui:options': {
          clearFrom: {
            operator: 'every',
            fields: [
              {
                key: 'id',
                source: {
                  code: entity,
                  jsonPath: ['id'],
                },
              },
            ],
          },

          preventRender: true,
          dependency: {
            selectEnabled: false,
            createEnabled: false,
            configuration: {
              'ui:labels': {
                namespace: 'objectAccessGroup',
              },
              showTitle: false,
              refreshFromButtons: ['saveLocalPressed'],
              local: {
                enabled: true,
                validationsField: 'objectAccessGroups',
              },
              'ui:buttons': {
                style: 'button',
                buttons: [
                  {
                    style: 'icon',
                    icon: 'ADD',
                    type: 'ADD_LOCALLY',
                    title: 'add',
                    permissionKey:
                      'ENTITY/authorization-management/object-access-group-included-entity/POST',
                    schemas: {
                      schema: {
                        type: 'object',
                        properties: {
                          objectAccessGroup: {
                            type: 'object',
                          },
                        },
                      },
                      uiSchema: {
                        'ui:labels': {
                          namespace: 'objectAccessGroup',
                        },
                        objectAccessGroup: {
                          'ui:field': 'CustomObjectField',
                          'ui:options': {
                            validations: {
                              required: true,
                            },
                            dependency: {
                              entityIdKey: 'code',
                              entityFields: ['description'],
                              selectEnabled: true,
                              createEnabled: false,
                              filterSchema: {
                                id: 'OBJECT_ACCESS_GROUPS_SEARCH',
                                type: 'object',
                                properties: {
                                  code: {
                                    type: 'string',
                                  },
                                  comment: {
                                    type: 'string',
                                  },
                                  userAccessGroupCode: {
                                    type: 'string',
                                  },
                                  description: {
                                    type: 'string',
                                  },
                                },
                              },
                              filterUiSchema: {
                                'ui:labels': {
                                  namespace: 'objectAccessGroup',
                                  omitValidationHints: true,
                                },
                                'ui:common': {
                                  avoidDefaultLoad: true,
                                },
                              },
                              configuration: {
                                'ui:labels': {
                                  namespace: 'objectAccessGroup',
                                },
                                tableId: 'ObjectAccessGroups',
                                rowId: 'code',
                                showTitle: false,
                                permissionLoadKey:
                                  'ENTITY/authorization-management/object-access-group/GET',
                                apiValues: {
                                  url: `authorization-management/object-access-group?entityCL=${entity}`,
                                },
                                defaultSortBy: 'code:asc',
                                columns: [
                                  {
                                    type: 'string',
                                    name: 'code',
                                    accessors: ['code'],
                                    align: 'left',
                                    sortBy: { field: 'code' },
                                    visible: true,
                                  },
                                  {
                                    type: 'string',
                                    name: 'description',
                                    accessors: ['description'],
                                    align: 'left',
                                    visible: true,
                                    sortBy: { field: 'description' },
                                    truncate: {
                                      enabled: false,
                                      width: 100,
                                      lines: 1,
                                    },
                                  },
                                ],
                                filterEntities: true,
                                selections: {
                                  enabled: true,
                                  multiple: false,
                                },
                                pagination: {
                                  enabled: true,
                                  pageSizes: [5, 10, 15],
                                  defaultPageSize: 10,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  {
                    style: 'icon',
                    icon: 'SAVE',
                    type: 'SAVE_LOCAL_TABLE',
                    permissionKey: 'ENTITY/registration/assets/{id}/party-role-relations/POST',
                    values: {
                      resourceToEntity: entity,
                      resourceId: 'saveLocalPressed',
                      url: 'authorization-management/object-access-group-included-entity',
                      method: 'post',
                      dataFrom: [
                        {
                          key: 'entityId',
                          source: {
                            type: 'ENTITY',
                            code: entity,
                            jsonPath: ['id'],
                          },
                        },
                        {
                          key: 'entityCL',
                          defaultValue: entity,
                        },
                      ],
                    },
                  },
                ],
              },
              'ui:row:buttons': {
                style: 'button',
                buttons: [
                  {
                    style: 'menu',
                    type: 'default',
                    groups: [
                      {
                        title: 'delete',
                        style: 'simple',
                        icon: 'DELETE',
                        type: 'DELETE_LOCALLY',
                        warnOnAction: {
                          translation: {
                            warningTitleKey: 'confirm',
                            warningMessageKey: 'confirmationActionMessage',
                          },
                        },
                        permissionKey:
                          'ENTITY/authorization-management/object-access-group-included-entity/POST',
                      },
                      {
                        title: 'Undo',
                        style: 'simple',
                        icon: 'UNDO',
                        type: 'UNDO_LOCALLY',
                        localStatusButton: true,
                        warnOnAction: {
                          translation: {
                            warningTitleKey: 'confirm',
                            warningMessageKey: 'confirmationActionMessage',
                          },
                        },
                        permissionKey:
                          'ENTITY/authorization-management/object-access-group-included-entity/POST',
                      },
                    ],
                  },
                ],
              },
              entityId: entity,
              tableId: 'objectAccessGroups',
              rowId: 'objectAccessGroup.code',
              permissionLoadKey:
                'ENTITY/authorization-management/object-access-group-included-entity/GET',
              apiValues: {
                url: `authorization-management/object-access-group-included-entity/{entityId}/${entity}`,
                jsonPath: ['objectAccessGroups'],
                replacements: [
                  {
                    key: '{entityId}',
                    source: {
                      code: entity,
                      jsonPath: ['id'],
                    },
                  },
                ],
                applyWhen: {
                  fields: [
                    {
                      key: 'loading',
                      checkWhen: [true],
                      source: {
                        type: 'STORE',
                        code: 'Entities',
                        jsonPath: [entity, 'loading'],
                      },
                    },
                  ],
                },
              },
              defaultSortBy: 'objectAccessGroupCode:asc',
              columns: [
                {
                  type: 'string',
                  name: 'objectAccessGroupCode',
                  accessors: ['objectAccessGroup', 'code'],
                  align: 'left',
                  visible: true,
                  truncate: {
                    enabled: false,
                    width: 100,
                    lines: 1,
                  },
                },
                {
                  type: 'string',
                  name: 'objectAccessGroupDescription',
                  accessors: ['objectAccessGroup', 'description'],
                  align: 'left',
                  visible: true,
                  truncate: {
                    enabled: false,
                    width: 100,
                    lines: 1,
                  },
                },
              ],
              selections: {
                enabled: false,
                multiple: false,
              },
              pagination: {
                enabled: false,
              },
            },
          },
        },
      },
      objectAccessGroups: {
        'ui:options': {
          visible: false,
          valueFrom: {
            type: 'STORE',
            code: 'Tables',
            jsonPath: ['objectAccessGroups', 'localData'],
            applyEmptyValues: true,
          },
          omitAddNew: true,
          clearFrom: {
            operator: 'every',
            fields: [
              {
                key: 'id',
                source: {
                  code: entity,
                  jsonPath: ['id'],
                },
              },
            ],
          },
        },
        items: {
          objectAccessGroup: {
            'ui:options': {},
          },
        },
      },
    },
    visibilityFrom: {
      fields: [
        {
          key: 'isNew',
          checkWhen: [false],
          source: {
            type: 'STORE',
            code: 'Entities',
            jsonPath: [entity, 'isNew'],
          },
        },
      ],
    },
  };
};

const attachAttachments = (entityIdKey: string, entity: string, pageUrl: string) => {
  return {
    key: 'attachments',
    schema: {
      type: 'object',
      properties: {
        attachmentDetails: {
          type: 'string',
        },
      },
    },
    uiSchema: {
      'ui:page': {
        url: pageUrl,
        idKey: entityIdKey,
        id: entity,
      },
      'ui:labels': {
        namespace: 'attachmentDetails',
      },
      attachmentDetails: {
        'ui:field': 'Attachments',
        'ui:options': {
          path: 'Shared/Attachments',
          baseUrl: 'document-management/attachments',
          entity,
          permissionKey: 'ENTITY/document-management/attachments/upload/POST',
          copyToProperty: `${entity}_attachmentDetails`,
          type: 'TABLE',
          filtersType: 'COLLAPSE',
        },
      },
    },
    visibilityFrom: {
      fields: [
        {
          key: 'isNew',
          source: { type: 'ENTITY', code: entity, jsonPath: ['id'] },
        },
      ],
    },
  };
};

const attachLogs = (
  entityIdKey: string,
  entity: string,
  pageUrl: string,
  uiSchema?: AnyType,
  objectType?: string,
) => {
  const sidePanelExtraValue = uiSchema?.sidePanelExtraValue;
  const extraSchema = sidePanelExtraValue?.schema;
  const extraUiSchema = sidePanelExtraValue?.uiSchema;
  return {
    key: 'logs',
    schema: {
      type: 'object',
      properties: {
        logs: {
          type: 'string',
        },
        ...(extraSchema?.properties || {}),
      },
    },
    uiSchema: {
      'ui:page': {
        url: pageUrl,
        idKey: entityIdKey,
        id: entity,
      },
      'ui:labels': {
        namespace: 'logs',
      },
      logs: {
        'ui:widget': 'ConfigurableListWidget',
        'ui:options': {
          omitValidationHints: true,
          dependency: {
            selectEnabled: false,
            createEnabled: false,
            configuration: {
              'ui:labels': {
                namespace: 'logs',
              },
              showTitle: false,
              'ui:row:buttons': {
                style: 'button',
                buttons: [
                  {
                    style: 'menu',
                    type: 'default',
                    groups: [
                      {
                        title: 'View',
                        type: 'redirect',
                        icon: 'VIEW',
                        style: 'simple',
                        permissionKey:
                          'ENTITY/entity-version/entity-versions/{entityVersionId}/GET',
                        values: {
                          url: `/page/${entity}Version/{versionId}`,
                          replacements: [
                            {
                              key: '{versionId}',
                              source: {
                                code: entity,
                                jsonPath: ['entityVersionId'],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              tableId: `${entity}Logs`,
              rowId: 'entityVersionId',
              refreshFromButtons: ['submitButtonPressed'],
              permissionLoadKey: 'ENTITY/entity-version/entity-versions/GET',
              apiValues: {
                url: `entity-version/entity-versions?objectId={id}&objectType=${objectType ?? entity}`,
                replacements: [
                  {
                    key: '{id}',
                    source: {
                      code: entity,
                      jsonPath: [entityIdKey],
                    },
                  },
                ],
              },
              defaultSortBy: 'changeDttm:asc',
              columns: [
                {
                  type: 'datetime',
                  name: 'changeDttm',
                  accessors: ['changeDttm'],
                  align: 'left',
                  visible: true,
                  sortBy: { field: 'changeDttm' },
                  truncate: {
                    enabled: false,
                    width: 100,
                    lines: 1,
                  },
                },
                {
                  type: 'string',
                  name: 'user',
                  accessors: ['user', 'identificationLabel'],
                  align: 'left',
                  visible: true,
                  truncate: {
                    enabled: true,
                    width: 250,
                    lines: 2,
                  },
                },
                {
                  type: 'string',
                  name: 'entityStatusCL',
                  accessors: ['entityStatusCLDescription'],
                  align: 'left',
                  sortBy: { field: 'entityStatusCL' },
                  visible: true,
                  truncate: {
                    enabled: true,
                    width: 150,
                    lines: 2,
                  },
                },
                {
                  type: 'string',
                  name: 'changeReasonCL',
                  accessors: ['changeReasonCLDescription'],
                  align: 'left',
                  visible: true,
                  truncate: {
                    enabled: true,
                    width: 150,
                    lines: 2,
                  },
                },
                {
                  type: 'string',
                  name: 'changeComment',
                  accessors: ['changeComment'],
                  align: 'left',
                  visible: true,
                  truncate: {
                    enabled: true,
                    width: 150,
                    lines: 2,
                  },
                },
              ],
              pagination: {
                enabled: true,
                pageSizes: [5, 10, 15],
                defaultPageSize: 10,
              },
            },
          },
        },
      },
      ...(extraUiSchema || {}),
    },
    visibilityFrom: {
      fields: [
        {
          key: 'isNew',
          checkWhen: [false],
          source: {
            type: 'STORE',
            code: 'Entities',
            jsonPath: [entity, 'isNew'],
          },
        },
      ],
    },
  };
};

const applyHistoryViewRules = (
  schema: AnyType,
  uiSchema: AnyType,
  baseApis: Array<ApiValuesSchema>,
  name: string,
) => {
  const finalUiSchema = { ...uiSchema };
  const finalSchema = { ...schema };

  const historyOverrides = uiSchema?.historyExtraValues;
  if (historyOverrides) {
    const { schema: extraSchema, uiSchema: extraUiSchema } = historyOverrides;

    finalSchema.properties = {
      ...schema.properties,
      ...(extraSchema?.properties ?? {}),
    };

    Object.entries(extraUiSchema ?? {}).forEach(([key, field]) => {
      finalUiSchema[key] = field;
    });
  }

  finalUiSchema.callApis = baseApis.map((baseApi) => {
    return {
      ...baseApi,
      queryFrom: [
        {
          key: 'validOnDate',
          isOptional: true,
          source: {
            type: 'STORE',
            code: 'Entities',
            jsonPath: [name, 'validOnDate'],
          },
        },
      ],
      resourceToEntity: name,
      resourceId: name,
      initiateClone: undefined,
    };
  });

  finalUiSchema['ui:mainButton'] = {
    type: 'submit',
    style: 'FLOATING',
    label: 'submit',
    color: 'primary',
    position: 'TOP',
    enabled: uiSchema?.['ui:mainButton']?.enabled,
  };

  finalUiSchema.disabledFrom = {
    fields: [
      {
        key: 'validOnDate',
        source: { type: 'STORE', code: 'Entities', jsonPath: [name, 'validOnDate'] },
      },
    ],
  };

  finalUiSchema.sidePanelInfo = undefined;
  finalUiSchema.historyExtraValues = undefined;

  return { schema: finalSchema, uiSchema: finalUiSchema };
};

const applyTodayViewRules = (uiSchema: AnyType, baseApis: Array<ApiValuesSchema>, name: string) => {
  const finalUiSchema = { ...uiSchema };
  finalUiSchema.disabledFrom = {
    fields: [
      {
        key: 'id',
        source: {
          type: 'API_DATA',
          code: name,
          jsonPath: ['id'],
        },
      },
    ],
  };
  finalUiSchema.callApis = baseApis.map((baseApi) => {
    return {
      ...baseApi,
      queryFrom: [
        {
          key: 'validOnDate',
          defaultValue: '__TODAY__',
        },
      ],
      resourceToEntity: name,
      resourceId: name,
      initiateClone: name,
    };
  });
  finalUiSchema.sidePanelInfo = undefined;

  return finalUiSchema;
};

const attachHistory = (
  schema: AnyType,
  uiSchema: AnyType,
  entityId: string,
  baseApis: Array<ApiValuesSchema>,
) => {
  const name = baseApis[0]?.initiateClone;

  let adjustedUiSchema = uiSchema;

  if (uiSchema?.['ui:mainButton']?.enabled === undefined) {
    adjustedUiSchema = {
      ...uiSchema,
      'ui:mainButton': {
        ...uiSchema?.['ui:mainButton'],
        enabled: true,
      },
    };
  }

  const newSchema = replaceInObjectRegex(adjustedUiSchema, entityId, name ?? '');

  const result = {
    key: name,
    visibilityFrom: {
      fields: [
        {
          key: 'isNew',
          checkWhen: [false],
          // source: {
          //   code: entity,
          //   jsonPath: ['id'],
          // },
          source: {
            type: 'STORE',
            code: 'Entities',
            jsonPath: [entityId, 'isNew'],
          },
        },
      ],
    },
    type: name,
    schema: {},
    uiSchema: {},
  };

  if (name === HISTORY) {
    const { schema: finalSchema, uiSchema: finalUiSchema } = applyHistoryViewRules(
      schema,
      newSchema,
      baseApis,
      name,
    );
    result.schema = finalSchema;
    result.uiSchema = finalUiSchema;
  } else {
    const finalUiSchema = applyTodayViewRules(newSchema, baseApis, name ?? '');

    result.schema = { ...schema };
    result.uiSchema = finalUiSchema;
  }

  return result;
};

const replaceSpecificCodes = (obj: any, formId: string): any => {
  return replaceInObjectRegex(obj, `(${ENTITIES_WITH_HISTORY.join('|')})`, formId);
};
export {
  attachObjectAccessGroups,
  attachAttachments,
  attachLogs,
  attachHistory,
  replaceSpecificCodes,
};
