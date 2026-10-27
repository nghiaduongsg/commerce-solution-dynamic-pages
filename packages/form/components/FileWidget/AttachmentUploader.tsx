import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import { ErrorCode, useDropzone } from 'react-dropzone';
import { CloudDownloadSharp } from '@mui/icons-material';
import Axios from 'axios-observable';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import useSystem from '@pkg-setup/src/system/useSystem';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import GenericAutoComplete from '@pkg-common/atomics/GenericSelect/GenericAutoComplete';
import { useEntity } from '@pkg-entity/index';
import { getFormIdFromWidgetId } from '@pkg-common/utils';
import SelectCodeListWidget from '@pkg-form/components/SelectCodeListWidget/SelectCodeListWidget';
import CheckWidget from '@pkg-form/components/CheckWidget/CheckWidget';
import TextWidget from '@pkg-form/components/TextWidget/TextWidget';
import ConfigurableListWidget from '../ConfigurableListWidget/ConfigurableListWidget';
import { EligibleIdentifierSelector } from './EligibleIdentifierSelector';
import useLoader from '@pkg-common/loader/useLoader';
import useAttachmentValidation, { fileMatchesAllowedTypes } from './hooks/useAttachmentValidation';
import {
  getEffectiveFileTypesToBeValidated,
  getEffectiveAttachmentReferenceFileTypesToBeValidated,
  fileNameMatchesAllowedTypes,
} from './fileTypeUtils';
import ValidationStatusBadge from './ValidationStatusBadge';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { TRANSITION_FORM } from '@pkg-constants/formIds';

interface AttachmentsUploaderProps {
  id: string;
  apiValues: ApiValuesSchema;
  entity: string;
  entityCL: string;
  path?: string;
  isXml?: boolean;
  categories: { code: string; label: string }[];
  namespace: string;
  visibleInIRM?: boolean;
  includeReference?: boolean;
  attachmentCategoryRequired?: boolean;
  isPreSaveFormUpload?: boolean;
  dssValidation?: boolean;
  dssValidationUrl?: string;
  dssAttachmentReferenceValidationUrl?: string;
  fileTypesToBeValidated?: string[];
  attachmentReferenceFileTypesToBeValidated?: string[];
  onValidateFile?: (file: File) => void;
  onUploadSuccess: (file: { [key: string]: string | number | boolean }) => void;
  onCancel: () => void;
  onClose?: () => void;
}

const AttachmentsUploader: React.FC<AttachmentsUploaderProps> = ({
  id,
  path,
  isXml,
  apiValues,
  entity,
  entityCL,
  categories,
  namespace,
  visibleInIRM = true,
  includeReference = true,
  attachmentCategoryRequired = false,
  isPreSaveFormUpload = false,
  dssValidation = false,
  dssValidationUrl,
  dssAttachmentReferenceValidationUrl,
  fileTypesToBeValidated,
  attachmentReferenceFileTypesToBeValidated,
  onValidateFile,
  onUploadSuccess,
  onCancel,
}) => {
  const [category, setCategory] = useState<{ code: string; label: string }>();
  const [comment, setComment] = useState('');
  const [policyApplied, setPolicyApplied] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [documentCategoryCL, setDocumentCategoryCL] = useState<string | undefined>();
  const [attachmentCategoryCL, setAttachmentCategoryCL] = useState<string | undefined>();
  const [sourceCL, setSourceCL] = useState<string | undefined>();
  const [statusCL, setStatusCL] = useState<string | undefined>();
  const [attachment, setAttachment] = useState<
    { [key: string]: string | number | boolean } | undefined
  >();
  const [typeCL, setTypeCL] = useState<string | undefined>();
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [excludedFromSS, setExcludedFromSS] = useState<boolean>(false);
  const [signatureValidation, setSignatureValidation] = useState<boolean>(false);
  const { url, method, data, dataValuesReady } = useDynamicApi(id, apiValues);
  const { enqueueSnackbar } = useNotifiers();
  const partyRoleId = useSelector((state: any) => state.LoggedInUser?.profile?.partyRoleId);
  const { formData: transitionFormData } = useEntityFormData(TRANSITION_FORM);
  const hasActiveCaseActivity = entityCL === 'Case' && transitionFormData?.caseActivityId;

  const isReusingAttachment = !!attachment;
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);
  const enableIdentifierSelection =
    visibleInIRM && (entityCL === 'Party' || entityCL === 'PartyRole');

  const { setTemporaryAttachment } = useEntity(getFormIdFromWidgetId(id));
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { apiUrl, authToken: token, selectedLanguage } = useSystem();

  const { showLoader, hideLoader } = useLoader();

  const effectiveFileTypesToBeValidated = getEffectiveFileTypesToBeValidated(
    fileTypesToBeValidated,
    dssValidation,
  );

  const effectiveAttachmentReferenceFileTypesToBeValidated =
    getEffectiveAttachmentReferenceFileTypesToBeValidated(
      attachmentReferenceFileTypesToBeValidated,
      dssValidation,
    );

  const { validationResults, validateFile, validateAttachment } = useAttachmentValidation(
    effectiveFileTypesToBeValidated,
    dssValidationUrl,
    dssAttachmentReferenceValidationUrl,
  );

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDropAccepted: (files) => {
      setProgress(0);
      setUploadError(null);
      if (dssValidation && files[0]) {
        const willValidate =
          !effectiveFileTypesToBeValidated ||
          effectiveFileTypesToBeValidated.length === 0 ||
          fileMatchesAllowedTypes(files[0], effectiveFileTypesToBeValidated);
        setSignatureValidation(willValidate);
        if (willValidate) {
          validateFile(files[0]);
          onValidateFile?.(files[0]);
        }
      } else {
        setSignatureValidation(false);
      }
    },
    onDropRejected: (rejections) => {
      const messages = new Set<string>();
      rejections.forEach((r) =>
        r.errors.forEach((e) => {
          if (e.code == ErrorCode.FileInvalidType) {
            messages.add(
              translate('unSupportedFileType', {
                ns: COMMON,
                lng: selectedLanguage,
              }),
            );
          } else {
            messages.add(e.message);
          }
        }),
      );
      setUploadError(Array.from(messages).join(', '));
    },
    multiple: false,
    noClick: false,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'application/xml': ['.xml'],
      'video/mp4': ['.mp4'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: isReusingAttachment,
  });

  const createCLOptions = (
    codeList: string,
    url = `reference-data/codelists/${codeList}`,
    required = false,
  ) => ({
    apiValues: {
      url,
      codeList,
      jsonPath: ['items'],
    },
    validations: { required },
  });

  const CLOptions = {
    documentCategory: createCLOptions('DOCUMENT_CATEGORY'),
    attachmentCategory: createCLOptions('ATTACHMENT_CATEGORIES'),
    status: createCLOptions('DOCUMENT_STATUS'),
    source: createCLOptions('DOCUMENT_SOURCES'),
    type: createCLOptions('DOCUMENT_TYPES'),
  };

  const renderCL = (
    idSuffix: string,
    titleKey: string,
    value: string | undefined,
    onChange: (v: string) => void,
    options?: any,
    disabled: boolean = false,
  ) => (
    <SelectCodeListWidget
      componentName="SelectCodeListWidget"
      uiSchema={{}}
      id={`${id}-${idSuffix}`}
      schema={{
        title: translate(titleKey, { ns: COMMON, lng: selectedLanguage }),
        type: 'string',
      }}
      options={{
        ...options,
        fullWidth: true,
      }}
      value={value}
      onChange={onChange}
      formContext={formContext as any}
      label={idSuffix}
      serverErrors={[]}
      serverErrorTypes={[]}
      diffs={[]}
      disabled={disabled}
      readonly={false}
      autofocus={false}
    />
  );

  const renderTextWidget = (
    idSuffix: string,
    labelKey: string,
    value: string,
    onChange: (v: string) => void,
    options?: {
      multiline?: boolean;
      rows?: number;
      fullWidth?: boolean;
    },
    disabled: boolean = false,
  ) => (
    <TextWidget
      id={`${id}-${idSuffix}`}
      componentName="TextWidget"
      label={idSuffix}
      schema={{
        type: 'string',
        title: translate(labelKey, { ns: COMMON, lng: selectedLanguage }),
      }}
      uiSchema={{}}
      options={
        {
          fullWidth: true,
          multiline: options?.multiline || false,
          rows: options?.rows ?? 1,
          validations: {},
          uniqueFields: [],
          uniqueFieldsIf: [],
          allowCardItemDialogActionsFrom: [],
          apiValues: undefined,
        } as any
      }
      value={value}
      onChange={onChange}
      formContext={formContext as any}
      serverErrors={[]}
      serverErrorTypes={[]}
      diffs={[]}
      disabled={disabled}
    />
  );

  const attachmentRefOptions = useMemo(() => {
    const issExcludedEntityId =
      entityCL == 'PartyRole' && !visibleInIRM
        ? 'excludedEntityId={partyRoleId}'
        : 'excludedEntityId=' + entity;

    const baseOptions: any = {
      validations: {
        required: false,
      },
      disabledFrom: {
        fields: [
          {
            key: 'statusCL',
            checkWhen: ['GENERATED', 'FINALIZED'],
            source: {
              code: 'Contact',
              jsonPath: ['statusCL'],
            },
          },
        ],
      },
      preventRender: true,
      visibilityFrom: {
        fields: [
          {
            key: 'contactTypeCode',
            source: {
              code: 'Contact',
              jsonPath: ['contactTypeDetails', 'contactTypeCode'],
            },
          },
        ],
      },
      dependency: {
        entityIdKey: 'attachmentId',
        entityLabelKey: 'fileName',
        entityFields: [
          'fileName',
          'entityCL',
          'entityCLDescription',
          'entityId',
          'dmsId',
          'sizeInBytes',
          'attachmentCategoryCL',
          'attachmentCategoryCLDescription',
          'attachmentCategoryText',
          'createdDateTime',
          'uploadedBy',
          'sourceCL',
          'sourceCLDescription',
          'typeCL',
          'typeCLDescription',
          'statusCL',
          'statusCLDescription',
          'categoryCL',
          'categoryCLDescription',
          'dataArea',
          'policyApplied',
          'excludedFromSS',
        ],
        excludeFromLabel: [
          'entityCL',
          'entityCLDescription',
          'entityId',
          'dmsId',
          'sizeInBytes',
          'attachmentCategoryCL',
          'attachmentCategoryCLDescription',
          'attachmentCategoryText',
          'createdDateTime',
          'uploadedBy',
          'sourceCL',
          'sourceCLDescription',
          'typeCL',
          'typeCLDescription',
          'statusCL',
          'statusCLDescription',
          'categoryCL',
          'categoryCLDescription',
          'dataArea',
          'policyApplied',
          'excludedFromSS',
        ],
        selectEnabled: true,
        createEnabled: false,
      },
      translation: {
        key: 'attachmentReference',
      },
    };

    if (visibleInIRM) {
      baseOptions.dependency.entityId = 'AllDocuments';
      baseOptions.dependency.pageRedirectUrl = '/page/DetailedDocumentView';
      baseOptions.dependency.configuration = {
        apiValues: {
          url: enableIdentifierSelection
            ? 'document-management/attachments'
            : 'document-management/attachments?excludedEntityId=' + entity,
          method: 'get',
        },
      };
    } else {
      baseOptions.dependency.pageRedirectUrl = '/page/IssMyDocument';

      baseOptions.dependency.filterSchema = {
        id: 'MY_DOCUMENTS',
        type: 'object',
        properties: {
          formId: { type: 'string' },
          fileName: { type: 'string' },
          statusCL: { type: 'string' },
          sourceCL: { type: 'string' },
          categoryCL: { type: 'string' },
          typeCL: { type: 'string' },
          attachmentCategoryCL: { type: 'string' },
          createdDateTime: { type: 'string' },
          uploadedBy: { type: 'string' },
          topic: { type: 'string' },
          subtopic: { type: 'string' },
          policyApplied: { type: 'string' },
        },
      };

      baseOptions.dependency.filterUiSchema = {
        'ui:labels': {
          namespace: 'myDocuments',
          omitValidationHints: true,
        },
        'ui:common': {
          avoidDefaultLoad: true,
        },
        'ui:groups': [
          {
            key: 'Tabs',
            type: 'Tab',
            options: {
              activeTab: 1,
            },
            tabs: [
              {
                key: 'relatedEntities',
                type: 'Default',
                groups: [
                  {
                    key: 'relatedEntitiesContent',
                    type: 'Default',
                    widgets: ['formId'],
                  },
                ],
              },
              {
                key: 'otherFilters',
                type: 'Default',
                options: {},
                groups: [
                  {
                    key: '',
                    type: 'Header',
                    widgets: [
                      'fileName',
                      'statusCL',
                      'sourceCL',
                      'categoryCL',
                      'typeCL',
                      'attachmentCategoryCL',
                      'createdDateTime',
                      'uploadedBy',
                      'topic',
                      'subtopic',
                      'policyApplied',
                    ],
                  },
                ],
              },
            ],
          },
        ],
        formId: {
          'ui:widget': 'ConfigurableListWidget',
          'ui:options': {
            dependency: {
              entityIdKey: 'id',
              selectEnabled: true,
              createEnabled: false,
              isFlat: true,
              configuration: {
                'ui:labels': { namespace: 'myDocuments' },
                tableId: 'RelatedFormFilter',
                rowId: 'id',
                permissionLoadKey: 'ENTITY/ui-configuration/self-service-forms/GET',
                apiValues: {
                  url: 'ui-configuration/self-service-forms?partyRoleId={partyRoleId}',
                  method: 'get',
                  replacements: [
                    {
                      key: '{partyRoleId}',
                      source: {
                        type: 'STORE',
                        code: 'LoggedInUser',
                        jsonPath: ['profile', 'partyRoleId'],
                      },
                    },
                  ],
                },
                columns: [
                  {
                    name: 'formTypeDescription',
                    accessors: ['formTypeDescription'],
                    align: 'left',
                    visible: true,
                    sortBy: { field: 'formTypeDescription' },
                  },
                  {
                    name: 'statusCLDescription',
                    accessors: ['statusCLDescription'],
                    align: 'left',
                    visible: true,
                    sortBy: { field: 'statusCLDescription' },
                  },
                  {
                    name: 'sourceCLDescription',
                    accessors: ['sourceCLDescription'],
                    align: 'left',
                    visible: true,
                    sortBy: { field: 'sourceCLDescription' },
                  },
                  {
                    name: 'filingTypeCLDescription',
                    accessors: ['filingTypeCLDescription'],
                    align: 'left',
                    visible: true,
                    sortBy: { field: 'filingTypeCLDescription' },
                  },
                  {
                    name: 'creationTimestamp',
                    accessors: ['creationTimestamp'],
                    align: 'left',
                    visible: true,
                    sortBy: { field: 'creationTimestamp' },
                  },
                  {
                    name: 'receiveDate',
                    accessors: ['receiveDate'],
                    align: 'left',
                    visible: true,
                    sortBy: { field: 'receiveDate' },
                  },
                  {
                    name: 'filingObligationActionId',
                    accessors: ['filingObligationActionId'],
                    align: 'left',
                    visible: true,
                    sortBy: { field: 'filingObligationActionId' },
                  },
                ],
                pagination: { enabled: true, pageSizes: [5, 10, 15], defaultPageSize: 5 },
                selections: { enabled: true, multiple: false },
              },
            },
          },
        },
        fileName: {
          omitValidationHints: true,
          'ui:options': { columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 } },
        },
        statusCL: {
          'ui:widget': 'SelectCodeListWidget',
          'ui:options': {
            apiValues: {
              url: 'reference-data/codelists/DOCUMENT_STATUS',
              codeList: 'DOCUMENT_STATUS',
              jsonPath: ['items'],
            },
            columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
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
            columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
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
            columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
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
            columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
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
            columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
          },
        },
        createdDateTime: {
          'ui:widget': 'DateWidget',
          'ui:options': { columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 } },
        },
        uploadedBy: {
          omitValidationHints: true,
          'ui:options': { columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 } },
        },
        topic: {
          omitValidationHints: true,
          'ui:options': { columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 } },
        },
        subtopic: {
          omitValidationHints: true,
          'ui:options': { columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 } },
        },
        policyApplied: {
          omitValidationHints: true,
          'ui:options': { columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 } },
        },
      };

      baseOptions.dependency.configuration = {
        'ui:labels': {
          namespace: 'myDocuments',
        },
        filterEntities: true,
        'ui:row:buttons': {
          style: 'button',
          buttons: [
            {
              style: 'menu',
              type: 'default',
              groups: [
                {
                  title: 'viewDetails',
                  type: 'redirect',
                  icon: 'VIEW',
                  style: 'simple',
                  permissionKey: 'ENTITY/document-management/attachments/{id}/GET',
                  values: {
                    url: '/page/IssMyDocument/{documentId}',
                    replacements: [
                      {
                        key: '{documentId}',
                        source: { code: 'IssMyDocumentsTable', jsonPath: ['attachmentId'] },
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
                    url: 'iss-service-management/attachments/download/{documentId}',
                    replacements: [
                      {
                        key: '{documentId}',
                        source: { code: 'IssMyDocumentsTable', jsonPath: ['attachmentId'] },
                      },
                    ],
                  },
                },
                {
                  title: 'delete',
                  style: 'simple',
                  warnOnAction: {
                    translation: {
                      warningTitleKey: 'confirm',
                      warningMessageKey: 'confirmationActionMessage',
                    },
                  },
                  icon: 'DELETE',
                  permissionKey: 'ENTITY/document-management/attachments/{id}/DELETE',
                  notify: { success: 'deleteEntitySuccess' },
                  values: {
                    resourceId: 'buttonPress',
                    url: 'iss-service-management/attachments/{documentId}',
                    method: 'delete',
                    replacements: [
                      {
                        key: '{documentId}',
                        source: { code: 'IssMyDocumentsTable', jsonPath: ['attachmentId'] },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        tableId: 'IssMyDocumentsTable',
        rowId: 'attachmentId',
        showTitle: false,
        heightAdjustable: true,
        permissionLoadKey: 'ENTITY/document-management/attachments/GET',
        apiValues: {
          url:
            'iss-service-management/attachments?partyRoleId={partyRoleId}&' + issExcludedEntityId,
          method: 'get',
          replacements: [
            {
              key: '{partyRoleId}',
              source: {
                type: 'STORE',
                code: 'LoggedInUser',
                jsonPath: ['profile', 'partyRoleId'],
              },
            },
          ],
        },
        // TODO(IRM-48222): Temporary workaround because it blocks the pre-save attachment feature.
        // Revert to fileName sorting after testing is complete.
        defaultSortBy: 'createdDateTime:desc',
        // Original:
        // defaultSortBy: 'fileName:asc',
        columns: [
          {
            type: 'string',
            name: 'fileName',
            accessors: ['fileName'],
            align: 'left',
            visible: true,
            truncate: { enabled: false, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'statusCL',
            accessors: ['statusCL'],
            align: 'left',
            visible: true,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'sourceCL',
            accessors: ['sourceCL'],
            align: 'left',
            visible: true,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'typeCL',
            accessors: ['typeCL'],
            align: 'left',
            visible: true,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'categoryCL',
            accessors: ['categoryCL'],
            align: 'left',
            visible: true,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'date',
            name: 'createdDateTime',
            accessors: ['createdDateTime'],
            align: 'left',
            visible: true,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'attachmentCategoryText',
            accessors: ['attachmentCategoryText'],
            align: 'left',
            visible: true,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'uploadedBy',
            accessors: ['uploadedBy'],
            align: 'left',
            visible: false,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'attachmentCategoryCL',
            accessors: ['attachmentCategoryCL'],
            align: 'left',
            visible: false,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'topic',
            accessors: ['dataArea', 'topic'],
            align: 'left',
            visible: false,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
          {
            type: 'string',
            name: 'subtopic',
            accessors: ['dataArea', 'subtopic'],
            align: 'left',
            visible: false,
            truncate: { enabled: true, width: 150, lines: 2 },
          },
        ],
        pagination: {
          enabled: true,
          pageSizes: [5, 10, 15],
          defaultPageSize: 10,
        },
        selections: {
          enabled: true,
          multiple: false,
        },
      };
    }

    return baseOptions;
  }, [visibleInIRM, entity]);

  const reusedOpacity = isReusingAttachment ? { opacity: 0.6 } : {};

  const formContext = {
    formId: getFormIdFromWidgetId(id),
    namespace: COMMON,
    mechanism: 'DEFAULT',
  };

  const uploadedFile = useMemo(() => acceptedFiles[0] || null, [acceptedFiles]);

  const isUploadButtonDisabled = useMemo(() => {
    if (isReusingAttachment) {
      return !attachment;
    }
    return !uploadedFile || (attachmentCategoryRequired && !category?.code);
  }, [isReusingAttachment, attachment, uploadedFile, attachmentCategoryRequired, category]);

  const isValidResponse = (response) => {
    const data = response?.data;
    return Boolean(data?.attachmentId && data?.fileName && data?.sizeInBytes);
  };

  const addEntityAndRelationship = (base, { entityCL, entity, partyRoleId, visibleInIRM }) => {
    const currentEntityId = entityCL === 'PartyRole' && !visibleInIRM ? partyRoleId : entity;

    if (entityCL) {
      base.entityCL = entityCL;
    }
    if (currentEntityId) {
      base.entityId = currentEntityId;
    }

    if (hasActiveCaseActivity) {
      base.entityCL = 'CaseActivity';
      base.entityId = transitionFormData.caseActivityId;
    }

    // This adds the relationship array
    if (currentEntityId && entityCL) {
      base.relationships = [
        {
          entityId: currentEntityId,
          entityCL: entityCL,
        },
        ...(hasActiveCaseActivity
          ? [
              {
                entityId: transitionFormData?.caseActivityId ?? '',
                entityCL: 'CaseActivity',
              },
            ]
          : []),
      ];
    }
  };

  const buildDataArea = (topic, subtopic) => {
    if (!topic && !subtopic) return undefined;
    return JSON.stringify({
      ...(topic && { topic }),
      ...(subtopic && { subtopic }),
    });
  };

  const buildAttachmentDetails = () => {
    const base = { ...data, dataArea: undefined };

    if (comment) base.attachmentCategoryText = comment;
    if (category?.code) base.attachmentCategoryCL = category.code;
    if (documentCategoryCL) base.categoryCL = documentCategoryCL;
    if (attachmentCategoryCL) base.attachmentCategoryCL = attachmentCategoryCL;
    if (statusCL) base.statusCL = statusCL;
    if (sourceCL) base.sourceCL = sourceCL;
    if (typeCL) base.typeCL = typeCL;
    if (policyApplied) base.policyApplied = policyApplied;

    if (selectedIdentifier) {
      base.entityId = selectedIdentifier;
      base.entityCL = 'PartyIdentifier';
      base.relationships = [
        {
          entityId: selectedIdentifier,
          entityCL: 'PartyIdentifier',
        },
      ];
    } else if (isPreSaveFormUpload) {
      base.entityId = undefined;
      base.entityCL = undefined;
      base.relationships = undefined;
    } else {
      if (isReusingAttachment) {
        base.entityCL = entity;
      }
      addEntityAndRelationship(base, {
        entityCL,
        entity,
        partyRoleId,
        visibleInIRM,
      });
    }

    const dataArea = buildDataArea(topic, subtopic);
    if (dataArea !== undefined) {
      base.dataArea = dataArea;
    }

    if (dataValuesReady) base.excludedFromSS = excludedFromSS;
    if (signatureValidation) base.signatureValidation = true;

    return base;
  };

  const appendFormData = (formData: FormData, details: any) => {
    formData.append('attachment', uploadedFile, uploadedFile!.name);
    if (isXml) formData.append('xmlFile', uploadedFile, uploadedFile!.name);
    if (path) formData.append('path', path);

    formData.append(
      'attachmentDetails',
      new Blob([JSON.stringify(details)], { type: 'application/json' }),
    );
  };

  const handleUpdateClick = () => {
    const isMyDocumentsPage = entity == 'PartyRole' && !visibleInIRM;

    if (!isReusingAttachment || !attachment || (!entity && !isMyDocumentsPage)) return;
    setUpdateError(null);

    const requestBody: AnyType = {
      attachmentId: attachment.attachmentId,
      ...(hasActiveCaseActivity
        ? {
            entities: [
              {
                entityId: entity,
                entityCL: entityCL,
              },
              {
                entityId: transitionFormData.caseActivityId,
                entityCL: 'CaseActivity',
              },
            ],
          }
        : {
            entityId: entity,
            entityCL: entityCL,
          }),
    };

    if (selectedIdentifier) {
      requestBody.entityId = selectedIdentifier;
      requestBody.entityCL = 'PartyIdentifier';
    }

    const requestUrl = visibleInIRM ? '/document-management' : '/iss-service-management';
    const apiVersion = hasActiveCaseActivity ? 'v2/' : '';
    const updateUrl = `${apiUrl}${requestUrl}/${apiVersion}attachment-related-entities`;
    const config = {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    };

    Axios.post(updateUrl, requestBody, config).subscribe({
      next: (response) => {
        hideLoader();
        enqueueSnackbar({
          key: Date.now().toString(),
          message: translate('uploadGenericSuccessMessage', { ns: COMMON, lng: selectedLanguage }),
          severity: 'dark',
        });

        const successPayload = {
          ...response.data,
          topic: response.data.dataArea?.topic,
          subtopic: response.data.dataArea?.subtopic,
          attachmentCategoryCLDescription: category?.label,
          isReferenceAttachment: true,
        };

        onUploadSuccess(successPayload);
      },
      error: (error) => {
        const violations = error?.response?.violations;
        let errorMessage = 'uploadGenericErrorMessage';
        if (violations && violations.length > 0) {
          errorMessage = violations.map((v) => v.message).join('\n');
        } else if (error?.response?.error) {
          errorMessage = `${error.response.status}: ${error.response.error}`;
        }
        hideLoader();
        setUpdateError(errorMessage);
      },
    });
  };

  const handleUploadClick = () => {
    if (!uploadedFile || !url) return;

    const formData = new FormData();
    const details = buildAttachmentDetails();
    appendFormData(formData, details);

    const config = {
      onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    };

    Axios[method || 'post'](apiUrl + '/' + url, formData, config).subscribe(
      (response) => {
        if (!isValidResponse(response)) return;
        hideLoader();
        const { attachmentId, fileName, sizeInBytes } = response.data;
        enqueueSnackbar({
          key: Date.now().toString(),
          message: translate('uploadGenericSuccessMessage', { ns: COMMON, lng: selectedLanguage }),
          severity: 'dark',
        });

        // Pre-save does not write to redux temporary attachment state
        if (!isPreSaveFormUpload) {
          setTemporaryAttachment(response.data);
        }

        onUploadSuccess({
          ...response.data,
          attachmentId,
          fileName,
          sizeInBytes,
          attachmentCategoryText: comment,
          attachmentCategoryCL: category?.code,
          attachmentCategoryCLDescription: category?.label,
          isReferenceAttachment: false,
        });
      },
      (error) => {
        setProgress(0);
        hideLoader();
        enqueueSnackbar({
          key: Date.now().toString(),
          message: error.message,
          severity: 'error',
        });
        setUploadError(
          error?.violations?.map((v) => v.message).join('\n') ?? 'uploadGenericErrorMessage',
        );
      },
    );
  };

  const handleUploadReferenceClick = () => {
    if (!isReusingAttachment || !attachment) return;

    const successPayload = {
      ...attachment,
      fileName: attachment.fileName ?? '',
      isReferenceAttachment: true,
    };
    hideLoader();
    onUploadSuccess(successPayload);
  };

  const buttonClickOperation = () => {
    showLoader();
    if (isReusingAttachment) {
      if (isPreSaveFormUpload) {
        return handleUploadReferenceClick();
      }
      return handleUpdateClick();
    }

    return handleUploadClick();
  };

  return (
    <GenericCard
      id={id}
      title={translate('addAttachment', { ns: COMMON, lng: selectedLanguage })}
      actions={
        <>
          <GenericIconButton
            id={`${id}-cancel-btn`}
            ariaLabel={translate('cancel', { ns: COMMON, lng: selectedLanguage })}
            onClick={onCancel}
            disabled={progress > 0}
            icon={<AssetByType input="icons" name="Cancel" />}
          />
          <GenericIconButton
            id={`${id}-ok-btn`}
            testId="ok-btn"
            ariaLabel={translate('upload', { ns: COMMON, lng: selectedLanguage })}
            onClick={() => buttonClickOperation()}
            icon={
              <AssetByType
                input="icons"
                name="Check"
                props={{
                  sx: {
                    color: isUploadButtonDisabled ? 'grey.400' : 'primary.main',
                  },
                }}
              />
            }
            disabled={isUploadButtonDisabled}
          />
        </>
      }
    >
      <Grid container spacing={2}>
        {/* Only display eligible identifier if on party or party role page */}
        {enableIdentifierSelection && (
          <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 0 }}>
            <EligibleIdentifierSelector
              id={`${id}-identifierId`}
              value={selectedIdentifier}
              onChange={setSelectedIdentifier}
              pageType={entityCL === 'PartyRole' ? 'PartyRole' : 'Party'}
              entity={entity}
              namespace={namespace}
            />
          </Grid>
        )}

        {/* Only display Attachment Reference if not My Documents page */}
        {includeReference && (
          <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 1 }}>
            <ConfigurableListWidget
              componentName="ConfigurableListWidget"
              uiSchema={{}}
              id={`${id}-attachmentId`}
              schema={{
                title: translate('attachmentReference', { ns: COMMON, lng: selectedLanguage }),
                type: 'string',
              }}
              options={attachmentRefOptions as any}
              value={attachment}
              onChange={(val: any) => {
                const isEmpty =
                  typeof val === 'object' && val !== null && Object.keys(val).length === 0;
                if (isEmpty) {
                  setAttachment(undefined);
                  setSignatureValidation(false);
                  if (dssValidation) validateAttachment(null);
                } else {
                  setAttachment(val);
                  if (val?.attachmentId && dssValidation) {
                    const typeMatch = fileNameMatchesAllowedTypes(
                      val.fileName,
                      effectiveAttachmentReferenceFileTypesToBeValidated || [],
                    );
                    const willValidate =
                      !effectiveAttachmentReferenceFileTypesToBeValidated ||
                      effectiveAttachmentReferenceFileTypesToBeValidated.length === 0 ||
                      typeMatch;
                    setSignatureValidation(willValidate);
                    if (willValidate) {
                      validateAttachment(val.attachmentId);
                    }
                  }
                }
              }}
              formContext={formContext as any}
              label="Attachment Reference"
              serverErrors={[]}
              serverErrorTypes={[]}
              diffs={[]}
              disabled={isReusingAttachment}
              readonly={false}
              autofocus={false}
            />
            {attachment?.attachmentId && (
              <Box mt={1}>
                <ValidationStatusBadge
                  attachmentId={String(attachment.attachmentId)}
                  validationState={validationResults[String(attachment.attachmentId)]}
                />
              </Box>
            )}
            {updateError && (
              <Box mt={1}>
                <Typography variant="caption" color="error">
                  {translate(updateError, {
                    ns: COMMON,
                    lng: selectedLanguage,
                    // Add a default value to prevent translation warnings for raw messages like "404: Not Found"
                    defaultValue: updateError,
                  })}
                </Typography>
              </Box>
            )}
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 3, ...reusedOpacity }}>
          {renderCL(
            'statusCL',
            'attachmentStatus',
            statusCL,
            setStatusCL,
            CLOptions.status,
            isReusingAttachment,
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 7, ...reusedOpacity }}>
          {renderCL(
            'typeCL',
            'attachmentType',
            typeCL,
            setTypeCL,
            CLOptions.type,
            isReusingAttachment,
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 11, ...reusedOpacity }}>
          {renderTextWidget(
            'topic',
            'topic',
            topic,
            setTopic,
            { multiline: true },
            isReusingAttachment,
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 2, ...reusedOpacity }}>
          {renderTextWidget(
            'subtopic',
            'subtopic',
            subtopic,
            setSubtopic,
            { multiline: true },
            isReusingAttachment,
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 4, ...reusedOpacity }}>
          {renderCL(
            'documentCategoryCL',
            'documentCategory',
            documentCategoryCL,
            setDocumentCategoryCL,
            CLOptions.documentCategory,
            isReusingAttachment,
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 8, ...reusedOpacity }}>
          {renderTextWidget(
            'comments',
            'comments',
            comment,
            setComment,
            { multiline: true },
            isReusingAttachment,
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 9, ...reusedOpacity }}>
          {renderTextWidget(
            'policyApplied',
            'policyApplied',
            policyApplied,
            setPolicyApplied,
            {
              multiline: true,
            },
            isReusingAttachment,
          )}
        </Grid>
        {visibleInIRM && (
          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{
              order: 10,
              'margin-top': 12,
              ...(isReusingAttachment && {
                '& .MuiFormControlLabel-root': {
                  cursor: 'default',
                },
                opacity: 0.6,
              }),
            }}
          >
            <CheckWidget
              id={`${id}-excludedFromSS`}
              schema={{
                title: translate('excludedFromSS', { ns: COMMON, lng: selectedLanguage }),
                type: 'boolean',
              }}
              options={
                {
                  validations: {},
                  apiValues: undefined,
                  uniqueFields: [],
                  uniqueFieldsIf: [],
                  allowCardItemDialogActionsFrom: [],
                } as any
              }
              uiSchema={{}}
              value={excludedFromSS}
              onChange={(val: boolean) => setExcludedFromSS(val)}
              formContext={formContext as any}
              serverErrors={[]}
              diffs={[]}
              disabled={isReusingAttachment}
              readonly={false}
              autofocus={false}
              componentName={''}
              label={''}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 5, ...reusedOpacity }}>
          {renderCL(
            'sourceCL',
            'attachmentSource',
            sourceCL,
            setSourceCL,
            CLOptions.source,
            isReusingAttachment,
          )}
        </Grid>
        {categories?.length > 0 && (
          <Grid size={{ xs: 12, sm: 6 }} sx={{ order: 6, ...reusedOpacity }}>
            <Box sx={{ mb: 2 }}>
              <GenericAutoComplete
                id={id}
                options={categories || []}
                onChange={(c) => {
                  setCategory(c as { code: string; label: string } | undefined);
                }}
                value={(category as any) ?? null}
                label={
                  attachmentCategoryRequired
                    ? translate('attachmentCategory', { ns: COMMON, lng: selectedLanguage })
                    : `${translate('attachmentCategory', { ns: COMMON, lng: selectedLanguage })} - ${translate('optional', { ns: COMMON, lng: selectedLanguage })}`
                }
                disabled={isReusingAttachment}
              />
            </Box>
          </Grid>
        )}

        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{
            order: 12,
            'margin-top': 19,
            ...(isReusingAttachment && {
              '& button': {
                cursor: 'default',
              },
              '& > div': {
                cursor: 'default',
                opacity: 0.6,
              },
            }),
          }}
        >
          <Box
            id={`${id}-dropzone`}
            data-testid={`${id}-dropzone`}
            {...getRootProps()}
            border={uploadError ? `2px dashed red` : '2px dashed #ccc'}
            p={2}
            textAlign="center"
          >
            <input {...getInputProps()} />

            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1.5}
              mb={1}
              data-testid={`${id}-file-select`}
            >
              <CloudDownloadSharp fontSize="large" color="primary" />
              <Typography variant="caption">
                {translate('dragAndDrop', { ns: COMMON, lng: selectedLanguage })}
                <Box
                  component="button"
                  sx={{
                    textDecoration: 'underline',
                    color: 'primary.main',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'white',
                  }}
                  data-testid={`add-${id}-button`}
                >
                  {translate('clickToSelect', { ns: COMMON, lng: selectedLanguage })}
                </Box>
              </Typography>
            </Box>
            {uploadedFile && !uploadError && (
              <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap={1.5}
                  mb={1}
                  data-testid={`${id}-file-input`}
                >
                  <Typography variant="body2">
                    {uploadedFile.name} - {(uploadedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                {dssValidation && (
                  <ValidationStatusBadge
                    attachmentId={uploadedFile.name}
                    validationState={validationResults[uploadedFile.name]}
                  />
                )}
              </Box>
            )}

            {progress > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      id={`${id}_linearprogress`}
                      color="primary"
                    />
                  </Box>
                  <Box ml={2} minWidth={35}>
                    <Typography variant="caption" color="textPrimary">{`${progress}%`}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {uploadError && (
              <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} mb={1}>
                <Typography variant="body2" color={'error'}>
                  {translate(uploadError || 'uploadGenericErrorMessage', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  })}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </GenericCard>
  );
};

export default AttachmentsUploader;
