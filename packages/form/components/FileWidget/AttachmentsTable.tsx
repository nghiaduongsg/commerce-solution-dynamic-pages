import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import { GenericTable } from '@pkg-list/components';
import useTable from '@pkg-list/hooks/useTable';
import { NOTIF_INTERVAL } from '@pkg-setup/src/serverEvents/useNotificationsManager';
import useFormField from '@pkg-entity/hooks/useFormField';
import { Attachment } from './AttachmentsField.d';

const attachmentsTableConfiguration = (
  id: string,
  entity: string,
  namespace: string,
  disabled: boolean,
  documentPageId: string,
  excludedColumns: string[],
) => {
  const allColumns = [
    {
      type: 'string',
      name: 'fileName',
      accessors: ['fileName'],
      sortBy: { field: 'fileName' },
      align: 'left',
      visible: true,
      truncate: {
        enabled: false,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'statusCL',
      accessors: ['statusCLDescription'],
      sortBy: { field: 'statusCL' },
      align: 'left',
      visible: true,
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'sourceCL',
      accessors: ['sourceCLDescription'],
      sortBy: { field: 'sourceCL' },
      align: 'left',
      visible: true,
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'typeCL',
      accessors: ['typeCLDescription'],
      sortBy: { field: 'typeCL' },
      align: 'left',
      visible: true,
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'entityCL',
      accessors: ['entityCLDescription'],
      sortBy: { field: 'entityCL' },
      align: 'left',
      visible: entity === 'Party' || entity === 'PartyRole' || entity === 'Case',
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'entityId',
      accessors: ['entityId'],
      sortBy: { field: 'entityId' },
      align: 'left',
      visible: entity === 'Party' || entity === 'PartyRole',
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'date',
      name: 'createdDateTime',
      accessors: ['createdDateTime'],
      sortBy: { field: 'createdDateTime' },
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
      name: 'categoryCL',
      accessors: ['categoryCLDescription'],
      sortBy: { field: 'categoryCL' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'boolean',
      name: 'excludedFromSS',
      accessors: ['excludedFromSS'],
      sortBy: { field: 'excludedFromSS' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: false,
        width: 100,
        lines: 1,
      },
    },
    {
      type: 'string',
      name: 'uploadedBy',
      accessors: ['uploadedBy'],
      sortBy: { field: 'uploadedBy' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: true,
        width: 150,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'attachmentCategoryCL',
      accessors: ['attachmentCategoryCLDescription'],
      sortBy: { field: 'attachmentCategoryCL' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'attachmentCategoryText',
      accessors: ['attachmentCategoryText'],
      sortBy: { field: 'attachmentCategoryText' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
    {
      type: 'object',
      name: 'topic',
      accessors: ['dataArea', 'topic'],
      sortBy: { field: 'topic' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: true,
        width: 150,
        lines: 2,
      },
    },
    {
      type: 'object',
      name: 'subtopic',
      accessors: ['dataArea', 'subtopic'],
      sortBy: { field: 'subtopic' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: true,
        width: 150,
        lines: 2,
      },
    },
    {
      type: 'string',
      name: 'policyApplied',
      accessors: ['policyApplied'],
      sortBy: { field: 'policyApplied' },
      align: 'left',
      visible: false,
      truncate: {
        enabled: true,
        width: 100,
        lines: 2,
      },
    },
  ];

  const filteredColumns = allColumns.filter(
    (column) => excludedColumns.indexOf(column.name) === -1,
  );

  return {
    'ui:labels': {
      namespace,
    },
    refreshFromButtons: ['buttonPress'],
    tableId: id,
    title: 'attachmentDetails',
    'ui:row:buttons': {
      style: 'button',
      buttons: [
        {
          style: 'menu',
          type: 'default',
          groups: [
            {
              title: 'view',
              type: 'redirect',
              openInNewTab: true,
              icon: 'VIEW',
              style: 'simple',
              permissionKey: 'ENTITY/document-management/attachments/{id}/GET',
              values: {
                url: '/page/' + documentPageId + '/{documentId}',
                replacements: [
                  {
                    key: '{documentId}',
                    source: {
                      code: id,
                      jsonPath: ['attachmentId'],
                    },
                  },
                ],
              },
            },
            {
              title: 'download',
              type: 'download',
              icon: 'CloudDownloadSharp',
              style: 'simple',
              permissionKey: 'ENTITY/document-management/attachments/download/{id}/GET',
              values: {
                url: 'document-management/attachments/download/{documentId}',
                replacements: [
                  {
                    key: '{documentId}',
                    source: {
                      code: id,
                      jsonPath: ['attachmentId'],
                    },
                  },
                ],
              },
            },
            ...(!disabled
              ? [
                  {
                    title: 'delete',
                    style: 'simple',
                    warnOnAction: {
                      translation: {
                        warningTitleKey: 'confirm',
                        warningMessageKey: 'confirmationActionMessage',
                      },
                    },
                    icon: 'DELETE_LIST_ITEM',
                    permissionKey: 'ENTITY/document-management/attachments/{id}/DELETE',
                    notify: {
                      success: 'deleteEntitySuccess',
                    },
                    values: {
                      resourceId: 'buttonPress',
                      url: 'document-management/attachments/{id}',
                      method: 'delete',
                      replacements: [
                        {
                          key: '{id}',
                          source: {
                            code: id,
                            jsonPath: ['attachmentId'],
                          },
                        },
                      ],
                    },
                  },
                ]
              : []),
          ],
        },
      ],
    },
    rowId: 'attachmentId',
    permissionLoadKey: 'ENTITY/document-management/attachments/GET',
    apiValues: {
      url: 'document-management/attachments?entityId={entityId}',
      replacements: [
        {
          key: '{entityId}',
          source: {
            code: entity,
            jsonPath: ['id'],
          },
        },
      ],
    },
    defaultSortBy: 'createdDateTime:desc',
    filterEntities: true,
    columns: filteredColumns,
    pagination: {
      enabled: true,
      pageSizes: [5, 10, 15],
      defaultPageSize: 10,
    },
  };
};

const attachmentsFilterSchema = (excludedColumns: string[]) => {
  const allColumns = {
    fileName: {
      type: 'string',
    },
    statusCL: {
      type: 'string',
    },
    sourceCL: {
      type: 'string',
    },
    categoryCL: {
      type: 'string',
    },
    typeCL: {
      type: 'string',
    },
    attachmentCategoryCL: {
      type: 'string',
    },
    createdDate: {
      type: 'string',
    },
    uploadedBy: {
      type: 'string',
    },
    policyApplied: {
      type: 'string',
    },
    excludedFromSS: {
      type: 'boolean',
    },
  };

  const filteredColumns = Object.keys(allColumns)
    .filter((key) => excludedColumns.indexOf(key) === -1)
    .reduce((column, key) => {
      column[key] = allColumns[key];
      return column;
    }, {});

  return {
    id: 'ATTACHMENT_SEARCH',
    type: 'object',
    properties: filteredColumns,
  };
};

const attachmentsFilterUiSchema = (namespace: string, excludedColumns: string[]) => {
  const allColumns = {
    fileName: {
      'ui:options': {
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    statusCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/DOCUMENT_STATUS',
          codeList: 'DOCUMENT_STATUS',
          jsonPath: ['items'],
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    sourceCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/DOCUMENT_SOURCES',
          codeList: 'DOCUMENT_SOURCES',
          jsonPath: ['items'],
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    typeCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/DOCUMENT_TYPES',
          codeList: 'DOCUMENT_TYPES',
          jsonPath: ['items'],
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    createdDate: {
      'ui:widget': 'DateWidget',
      'ui:options': {
        formatAs: 'date',
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    categoryCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/DOCUMENT_CATEGORY',
          codeList: 'DOCUMENT_CATEGORY',
          jsonPath: ['items'],
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    excludedFromSS: {
      'ui:options': {
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    uploadedBy: {
      'ui:options': {
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    attachmentCategoryCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/ATTACHMENT_CATEGORIES',
          codeList: 'ATTACHMENT_CATEGORIES',
          jsonPath: ['items'],
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
    policyApplied: {
      'ui:options': {
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
    },
  };

  const filteredColumns = Object.keys(allColumns)
    .filter((key) => excludedColumns.indexOf(key) === -1)
    .reduce((column, key) => {
      column[key] = allColumns[key];
      return column;
    }, {});

  return {
    'ui:labels': {
      namespace,
      omitValidationHints: true,
    },
    ...filteredColumns,
  };
};

const AttachmentsTable = ({
  id,
  configuration,
  canAdd,
  usePolling,
  filterSchema,
  filterUiSchema,
  entity,
  namespace,
  disabled,
  onAdd,
  uploadSuccess,
  documentPageId,
  excludedColumns,
  copyToProperty,
}) => {
  const { triggerId, file } = uploadSuccess;
  const { selectedLanguage } = useSystem();
  const { triggerRefresh } = useTable(id);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);
  const { value: oldAttachments, setFieldValue: syncAttachments } = useFormField(copyToProperty);
  const { tableData: attachments } = useTable(id);

  const tableConfiguration = useMemo(
    () =>
      configuration ??
      attachmentsTableConfiguration(
        id,
        entity,
        namespace,
        disabled,
        documentPageId,
        excludedColumns,
      ),
    [configuration, id, entity, namespace, disabled, documentPageId, excludedColumns],
  );

  const filterSchemaConfiguration = useMemo(
    () => filterSchema ?? attachmentsFilterSchema(excludedColumns),
    [filterSchema, excludedColumns],
  );

  const filterUiSchemaConfiguration = useMemo(
    () => filterUiSchema ?? attachmentsFilterUiSchema(namespace, excludedColumns),
    [filterUiSchema, namespace, excludedColumns],
  );

  useEffect(() => {
    if (copyToProperty && oldAttachments?.length !== attachments?.length) {
      syncAttachments(
        (attachments as Array<Attachment>)?.map((attachment: Attachment) => ({
          attachmentCategoryCL: attachment?.attachmentCategoryCL ?? null,
          attachmentCategoryCLDescription: attachment?.attachmentCategoryCLDescription ?? null,
          comments: attachment?.attachmentCategoryText ?? null,
          fileInfo: {
            attachmentId: attachment.attachmentId,
            fileName: attachment.fileName,
            sizeInBytes: attachment.sizeInBytes,
          },
        })),
      );
    }
  }, [attachments, copyToProperty, oldAttachments]);

  const headerContent = useMemo(
    () =>
      canAdd &&
      !disabled && (
        <GenericIconButton
          id={`${id}-add-btn`}
          testId="add-btn"
          ariaLabel={translate('addButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: 'Attachments',
          })}
          ariaHasPopup={'dialog'}
          onClick={onAdd}
          icon={<AssetByType input="icons" name="AddCircle" />}
        />
      ),
    [canAdd, id, translate, selectedLanguage, onAdd, disabled],
  );

  useEffect(() => {
    if (triggerId > 0 && !!file) {
      triggerRefresh();
    }
  }, [triggerId, file]);

  useEffect(() => {
    if (!usePolling) {
      return undefined;
    }

    const interval = setInterval(() => {
      triggerRefresh();
    }, NOTIF_INTERVAL);

    return () => clearInterval(interval);
  }, [usePolling, triggerRefresh]);

  return (
    <GenericTable
      configuration={tableConfiguration}
      headerContent={headerContent}
      filterSchema={filterSchemaConfiguration}
      filterUiSchema={filterUiSchemaConfiguration}
    />
  );
};

export default AttachmentsTable;
