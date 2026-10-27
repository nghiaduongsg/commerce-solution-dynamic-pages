import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import { GenericTable } from '@pkg-list/components';
import useFormField from '@pkg-entity/hooks/useFormField';
import { Attachment } from './AttachmentsField.d';
import useTable from '@pkg-list/hooks/useTable';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import { AnyType } from '@pkg-common/types';
import Axios from 'axios-observable';
import { resolveSourceData, constructApiUrl } from '@pkg-common/dataResolver/utils';
import { useStore } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { AttachmentValidationState } from './hooks/useAttachmentValidation';
import ValidationStatusBadge from './ValidationStatusBadge';

const attachmentsTableConfiguration = (
  id: string,
  namespace: string,
  disabled: boolean,
  documentPageId: string,
  excludedColumns: string[],
  handleApiDelete: (_: AnyType, row: AnyType) => void,
  handleLocalDelete: (_: AnyType, row: AnyType) => void,
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
                    onClick: handleApiDelete,
                    visibilityFrom: {
                      fields: [
                        {
                          key: 'isReferenceAttachment',
                          checkWhen: [false],
                          source: {
                            jsonPath: ['isReferenceAttachment'],
                          },
                        },
                      ],
                    },
                  },
                  {
                    title: 'delete',
                    style: 'simple',
                    icon: 'DELETE_LIST_ITEM',
                    warnOnAction: {
                      translation: {
                        warningTitleKey: 'confirm',
                        warningMessageKey: 'confirmationActionMessage',
                      },
                    },
                    onClick: handleLocalDelete,
                    visibilityFrom: {
                      fields: [
                        {
                          key: 'isReferenceAttachment',
                          checkWhen: [true],
                          source: {
                            jsonPath: ['isReferenceAttachment'],
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
    defaultSortBy: 'createdDateTime:desc',
    columns: filteredColumns,
    pagination: {
      enabled: true,
      pageSizes: [5, 10, 15],
      defaultPageSize: 10,
    },
  };
};

const PreSaveAttachmentsTable = ({
  id,
  configuration,
  canAdd,
  namespace,
  disabled,
  onAdd,
  uploadSuccess,
  documentPageId,
  excludedColumns = [],
  copyToProperty,
  dssValidation: _dssValidation = false,
  validationResults: _validationResults = {},
}: {
  id: string;
  configuration?: AnyType;
  canAdd?: boolean;
  namespace?: string;
  disabled?: boolean;
  onAdd?: () => void;
  uploadSuccess: { triggerId: number; file?: AnyType };
  documentPageId?: string;
  excludedColumns?: string[];
  copyToProperty?: string;
  dssValidation?: boolean;
  validationResults?: Record<string, AttachmentValidationState>;
}) => {
  const { file } = uploadSuccess;
  const { apiUrl, authToken: token, selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace!]);
  const defaultTableId = useMemo<string>(() => id.replace(/_/g, ''), [id]);
  const resolvedTableId = configuration?.tableId ?? defaultTableId;
  const { enqueueSnackbar } = useNotifiers();
  const { addLocalTableRow, undoLocalTableRow } = useTable(resolvedTableId);
  const store = useStore();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { value: oldAttachments, setFieldValue: syncAttachments } = useFormField(copyToProperty!);

  const handleApiDelete = useCallback(
    (_: AnyType, row: AnyType, values?: AnyType) => {
      if (!row?.attachmentId) return;

      let url: string;
      if (values?.url && values?.replacements) {
        const input = {
          state: store.getState(),
          routeParams: {},
          routerData: {},
        };
        const replacementValues: AnyType = {};
        values.replacements.forEach((replacement: AnyType) => {
          const resolved = resolveSourceData(id, input, replacement, false, row);
          replacementValues[replacement.key] = resolved.value;
        });
        url = `${apiUrl}/${constructApiUrl(values, replacementValues)}`;
      } else {
        url = `${apiUrl}/document-management/attachments/${row.attachmentId}`;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      };
      Axios.delete(url, config).subscribe({
        next: () => {
          enqueueSnackbar({
            key: Date.now().toString(),
            message: translate('deleteEntitySuccess', { ns: COMMON, lng: selectedLanguage }),
            severity: 'dark',
          });
          undoLocalTableRow({ rowData: { id: row.id, __ID__: row.__ID__ } });
          setAttachments((prev) => prev.filter((a) => a.attachmentId !== row.id));
        },
        error: (error) => {
          const violations = error?.response?.data?.violations;
          let errorMessage = 'genericError';
          if (violations?.length > 0) {
            errorMessage = violations.map((v) => v.message).join('\n');
          } else if (error?.response?.data?.error) {
            errorMessage = `${error.response.status}: ${error.response.data.error}`;
          }
          enqueueSnackbar({
            key: Date.now().toString(),
            message: errorMessage,
            severity: 'error',
          });
        },
      });
    },
    [apiUrl, token, selectedLanguage, translate, enqueueSnackbar, undoLocalTableRow, store, id],
  );

  const handleLocalDelete = useCallback((_: AnyType, row: AnyType) => {
    if (!row?.attachmentId) return;
    setAttachments((prev) => prev.filter((a) => a.attachmentId !== row.id));
    undoLocalTableRow({ rowData: { id: row.id, __ID__: row.__ID__ } });
  }, []);

  const findMatchingDefaultGroup = useCallback(
    (defaultGroups: AnyType[], matchedIndices: Set<number>, title: string) => {
      const group = defaultGroups.find((defaultGroup: AnyType, index: number) => {
        if (matchedIndices.has(index)) return false;
        return defaultGroup.title === title;
      });
      if (group) {
        matchedIndices.add(defaultGroups.indexOf(group));
      }
      return group;
    },
    [],
  );

  const enrichGroupButtons = useCallback(
    (customGroup: AnyType, defaultGroups: AnyType[], matchedIndices: Set<number>) => {
      const matchingDefaultGroup = findMatchingDefaultGroup(
        defaultGroups,
        matchedIndices,
        customGroup.title,
      );
      if (matchingDefaultGroup && customGroup.title === 'delete') {
        return {
          ...customGroup,
          onClick: (e: AnyType, row: AnyType) => {
            matchingDefaultGroup?.onClick?.(e, row, customGroup.values);
          },
        };
      }
      return customGroup;
    },
    [findMatchingDefaultGroup],
  );

  const mergeCustomButtons = useCallback(
    (customButton: AnyType, defaultGroups: AnyType[]) => {
      const matchedIndices = new Set<number>();
      return {
        ...customButton,
        groups: customButton.groups?.map((customGroup: AnyType) =>
          enrichGroupButtons(customGroup, defaultGroups, matchedIndices),
        ),
      };
    },
    [enrichGroupButtons],
  );

  const tableConfiguration = useMemo(() => {
    const defaultConfig = attachmentsTableConfiguration(
      defaultTableId,
      namespace!,
      disabled!,
      documentPageId!,
      excludedColumns,
      handleApiDelete,
      handleLocalDelete,
    );

    if (!configuration) {
      return defaultConfig;
    }

    const mergedRowButtons = configuration['ui:row:buttons']
      ? {
          ...configuration['ui:row:buttons'],
          buttons: configuration['ui:row:buttons'].buttons?.map((customButton: AnyType) => {
            const defaultGroups = defaultConfig['ui:row:buttons']?.buttons?.[0]?.groups || [];
            return mergeCustomButtons(customButton, defaultGroups);
          }),
        }
      : defaultConfig['ui:row:buttons'];

    return {
      ...defaultConfig,
      ...configuration,
      'ui:row:buttons': mergedRowButtons,
    };
  }, [
    configuration,
    defaultTableId,
    resolvedTableId,
    namespace,
    disabled,
    documentPageId,
    excludedColumns,
    handleApiDelete,
    handleLocalDelete,
  ]);

  useEffect(() => {
    if (file) {
      // Check if attachment with same attachmentId already exists
      const isDuplicate = attachments.some(
        (attachment) => attachment.attachmentId === file.attachmentId,
      );

      if (isDuplicate) {
        enqueueSnackbar({
          key: Date.now().toString(),
          message: translate('fileAlreadyExists', {
            ns: namespace,
            lng: selectedLanguage,
          }),
          severity: 'dark',
        });
      } else {
        setAttachments((prev) => [...prev, file]);
        addLocalTableRow({ rowData: { ...file, id: file.attachmentId } });
      }
    }
  }, [file, addLocalTableRow, enqueueSnackbar, namespace, selectedLanguage, translate]);

  useEffect(() => {
    if (copyToProperty && oldAttachments?.length !== attachments?.length) {
      syncAttachments(attachments.map((attachment) => attachment.attachmentId));
    }
  }, [attachments, copyToProperty, oldAttachments, syncAttachments]);

  const headerContent = useMemo(
    () =>
      canAdd &&
      !disabled && (
        <GenericIconButton
          id={`${resolvedTableId}-add-btn`}
          testId="add-btn"
          ariaLabel={translate('addButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: 'Attachments',
          })}
          ariaHasPopup="dialog"
          onClick={onAdd!}
          icon={<AssetByType input="icons" name="AddCircle" />}
        />
      ),
    [canAdd, disabled, resolvedTableId, onAdd, selectedLanguage, translate],
  );

  // const validatedFileNames = dssValidation ? Object.keys(validationResults) : [];

  return (
    <>
      <GenericTable configuration={tableConfiguration} headerContent={headerContent as React.ReactElement | null} />
      {/* {validatedFileNames.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {validatedFileNames.map((fileName) => (
            <Box key={fileName} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {fileName}
              </Typography>
              <ValidationStatusBadge
                attachmentId={fileName}
                validationState={validationResults[fileName]}
              />
            </Box>
          ))}
        </Box>
      )} */}
    </>
  );
};

export default PreSaveAttachmentsTable;
