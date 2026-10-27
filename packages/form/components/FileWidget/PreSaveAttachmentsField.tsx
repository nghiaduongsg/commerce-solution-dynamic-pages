import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { FORM_DEFINITION_ID } from '@pkg-constants/formIds';
import PreSaveAttachmentsTable from '@pkg-form/components/FileWidget/PreSaveAttachmentsTable';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import { AnyType } from '@pkg-common/types';
import AttachmentsUploader from './AttachmentUploader';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
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

const getUploadApi = (baseUrl: string) => {
  return {
    url: `${baseUrl}/upload`,
    method: 'post',
  };
};

const PreSaveAttachmentsField = (props) => {
  const { id, options, formContext, disabled, disabledFrom, uiSchema } = props;
  const {
    baseUrl = 'document-management/attachments',
    entity,
    path,
    validations,
    overrides,
    copyToProperty,
    visibleInIRM,
    includeReference,
    configuration,
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
  const { setFieldDirty, isFieldDirty } = useFormManagerContext();

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
      <PreSaveAttachmentsTable
        id={id}
        configuration={configuration}
        canAdd={canAdd}
        disabled={isDisabled}
        namespace={formContext?.namespace}
        onAdd={() => setOpen(true)}
        uploadSuccess={uploadSuccess}
        documentPageId={documentPageId}
        excludedColumns={stableExcludedColumns}
        copyToProperty={copyToProperty}
        dssValidation={dssValidation}
        validationResults={validationResults}
      />

      {open && (
        <SimpleDialog
          open={open}
          title={translate('addAttachment', { ns: COMMON, lng: selectedLanguage })}
          isSimple={true}
          onClose={() => setOpen(false)}
        >
          <AttachmentsUploader
            id={id}
            apiValues={overrides?.apiValues ?? getUploadApi(baseUrl)}
            path={path}
            isXml={false}
            entity={currentEntityId}
            entityCL={entity}
            categories={categories || []}
            namespace={formContext?.namespace || ''}
            visibleInIRM={visibleInIRM}
            includeReference={includeReference}
            attachmentCategoryRequired={attachmentCategoryRequired}
            isPreSaveFormUpload={true}
            dssValidation={dssValidation}
            dssValidationUrl={dssValidationUrl}
            dssAttachmentReferenceValidationUrl={dssAttachmentReferenceValidationUrl}
            fileTypesToBeValidated={effectiveFileTypesToBeValidated}
            attachmentReferenceFileTypesToBeValidated={
              effectiveAttachmentReferenceFileTypesToBeValidated
            }
            onValidateFile={validateFile}
            onUploadSuccess={(file) => {
              if (!isFieldDirty(id)) {
                setFieldDirty(id, true);
              }

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

export default PreSaveAttachmentsField;
