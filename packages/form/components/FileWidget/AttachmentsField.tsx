import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import AttachmentsUploader from './AttachmentUploader';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { FORM_DEFINITION_ID } from '@pkg-constants/formIds';
import AttachmentsTable from '@pkg-form/components/FileWidget/AttachmentsTable';
import AttachmentsCards from '@pkg-form/components/FileWidget/AttachmentsCards';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import { AnyType } from '@pkg-common/types';
import useAttachmentValidation from './hooks/useAttachmentValidation';
import {
  getEffectiveFileTypesToBeValidated,
  getEffectiveAttachmentReferenceFileTypesToBeValidated,
} from './fileTypeUtils';

const getAttachmentCategoryUrl = (entity: string, application: string) => {
  if (entity !== FORM_DEFINITION_ID) {
    return `reference-data/codelists/ATTACHMENT_CATEGORIES/items?attributeKey=entity&attributeValue=${entity}`;
  }

  return application === 'ISS'
    ? 'iss-service-management/form-types/{formTypeCode}/all/attachment-category/dropdown'
    : 'ui-configuration/form-types/{formTypeCode}/all/attachment-category/dropdown';
};

const getUploadApi = (baseUrl: string, entity: string, currentId: string) => {
  return {
    url: `${baseUrl}/upload`,
    method: 'post',

    dataFrom: [
      {
        key: 'entityCL',
        defaultValue: entity,
      },
      {
        key: 'entityId',
        source: {
          type: 'ENTITY',
          code: entity,
          jsonPath: ['id'],
        },
      },
      {
        key: 'relationships',
        defaultValue: [
          {
            entityCL: entity,
            entityId: currentId,
          },
        ],
      },
    ],
  };
};

const AttachmentsField = (props) => {
  const { id, options, formContext, disabled, disabledFrom, uiSchema } = props;
  const {
    baseUrl = 'document-management/attachments',
    entity,
    path,
    validations,
    overrides,
    copyToProperty,
    usePolling,
    visibleInIRM,
    includeReference,
    type = 'TABLE',
    configuration,
    filterSchema,
    filterUiSchema,
    documentPageId = 'DetailedDocumentView',
    excludedColumns = [],
    attachmentCategoryRequired = false,
    dssValidation = false,
    dssValidationUrl,
    dssAttachmentReferenceValidationUrl,
    fileTypesToBeValidated,
    attachmentReferenceFileTypesToBeValidated,
  } = options;

  const effectiveFileTypesToBeValidated = getEffectiveFileTypesToBeValidated(
    fileTypesToBeValidated,
    dssValidation,
  );

  const effectiveAttachmentReferenceFileTypesToBeValidated =
    getEffectiveAttachmentReferenceFileTypesToBeValidated(
      attachmentReferenceFileTypesToBeValidated,
      dssValidation,
    );

  const { validationResults, validateFile } = useAttachmentValidation(
    effectiveFileTypesToBeValidated,
    dssValidationUrl,
    dssAttachmentReferenceValidationUrl,
  );

  const stableExcludedColumns = useMemo(() => excludedColumns, [JSON.stringify(excludedColumns)]);

  const { application, selectedLanguage } = useSystem();

  const categories = useApiData(
    entity === FORM_DEFINITION_ID ? 'FORM_ATTACHMENT_CATEGORY' : 'ATTACHMENT_CATEGORIES',
    {
      url: getAttachmentCategoryUrl(entity, application),
      codeList:
        entity === FORM_DEFINITION_ID ? 'FORM_ATTACHMENT_CATEGORY' : 'ATTACHMENT_CATEGORIES',
      replacements: [
        {
          key: '{formTypeCode}',
          source: {
            code: 'FormDefinition',
            jsonPath: ['formTypeCode'],
          },
        },
      ],
    },
  );

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, formContext?.namespace]);

  const attachmentButtons = uiSchema?.['ui:attachment:buttons'] || {};

  const [open, setOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<{ triggerId: number; file?: AnyType }>({
    triggerId: 0,
  });

  const { check: disabledFromValue } = useCheckFrom(id, disabledFrom, false);

  const isDisabled = disabled || disabledFromValue;

  const canAdd = useMemo(() => {
    if (isDisabled) {
      return false;
    }

    if (validations?.maxLength) {
      return false;
    }

    return true;
  }, [isDisabled, validations?.maxLength]);

  const currentEntityId = formContext?.entityId;

  return (
    <>
      {type === 'TABLE' && (
        <AttachmentsTable
          id={id}
          entity={entity}
          configuration={configuration}
          canAdd={canAdd}
          usePolling={usePolling}
          disabled={isDisabled}
          filterSchema={filterSchema}
          filterUiSchema={filterUiSchema}
          namespace={formContext?.namespace}
          onAdd={() => setOpen(true)}
          uploadSuccess={uploadSuccess}
          documentPageId={documentPageId}
          excludedColumns={stableExcludedColumns}
          copyToProperty={copyToProperty}
        />
      )}

      {type === 'CARD' && (
        <AttachmentsCards
          id={id}
          entity={entity}
          formContext={formContext}
          validations={validations}
          copyToProperty={copyToProperty}
          usePolling={usePolling}
          attachmentButtons={attachmentButtons}
          disabled={isDisabled}
          canAdd={canAdd}
          onAdd={() => setOpen(true)}
          open={open}
          uploadSuccess={uploadSuccess}
          dssValidation={dssValidation}
          validationResults={validationResults}
        />
      )}

      {open && (
        <SimpleDialog
          open={open}
          title={translate('addAttachment', { ns: COMMON, lng: selectedLanguage })}
          isSimple={true}
          onClose={() => setOpen(false)}
        >
          <AttachmentsUploader
            id={id}
            apiValues={overrides?.apiValues ?? getUploadApi(baseUrl, entity, currentEntityId)}
            path={path}
            isXml={false}
            entity={currentEntityId}
            entityCL={entity}
            categories={categories || []}
            namespace={formContext?.namespace || ''}
            visibleInIRM={visibleInIRM}
            includeReference={includeReference}
            attachmentCategoryRequired={attachmentCategoryRequired}
            dssValidation={dssValidation}
            dssValidationUrl={dssValidationUrl}
            dssAttachmentReferenceValidationUrl={dssAttachmentReferenceValidationUrl}
            fileTypesToBeValidated={effectiveFileTypesToBeValidated}
            attachmentReferenceFileTypesToBeValidated={
              effectiveAttachmentReferenceFileTypesToBeValidated
            }
            onValidateFile={validateFile}
            onUploadSuccess={(file) => {
              setUploadSuccess({ triggerId: new Date().getTime(), file });
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </SimpleDialog>
      )}
    </>
  );
};

export default AttachmentsField;
