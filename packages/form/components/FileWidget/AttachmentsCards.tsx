import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import Content from '@pkg-form/components/ReadOnlyField/Content';
import CardButton from '@pkg-common/atomics/CardButton/CardButton';
import GenericInfoCard from '@pkg-common/atomics/GenericInfoCard/GenericInfoCard';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import { useApiDataState } from '@pkg-core/apiData';
import IstLoader from '@pkg-common/atomics/IstLoader/IstLoader';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FORM_DEFINITION_ID } from '@pkg-constants/formIds';
import { ApiValuesSchema } from '@pkg-common/types';
import { AppActionButtons, ActionButtonType } from '@pkg-common/button/types';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import { NOTIF_INTERVAL } from '@pkg-setup/src/serverEvents/useNotificationsManager';
import { Attachment } from './AttachmentsField.d';
import useValidations from '@pkg-form/validations/hooks/useValidations';
import { AttachmentValidationState } from './hooks/useAttachmentValidation';
import ValidationStatusBadge from './ValidationStatusBadge';

const buttons = (attachmentId: string, disabled?: boolean): AppActionButtons => {
  const downloadButton: ActionButtonType = {
    title: 'download',
    type: 'download',
    style: 'icon',
    icon: 'DOWNLOAD',
    permissionKey: 'ENTITY/document-management/attachments/download/{id}/GET',
    values: {
      url: `document-management/attachments/download/${attachmentId}`,
      method: 'get',
    },
  };

  const deleteButton: ActionButtonType = {
    title: 'delete',
    style: 'icon',
    warnOnAction: {
      translation: {
        warningTitleKey: 'confirm',
        warningMessageKey: 'confirmationActionMessage',
      },
    },
    icon: 'DELETE',
    permissionKey: 'ENTITY/document-management/attachments/{id}/DELETE',
    notify: {
      success: 'deleteEntitySuccess',
    },
    values: {
      resourceId: 'buttonPress',
      url: `document-management/attachments/${attachmentId}`,
      method: 'delete',
    },
  };

  return {
    style: 'button',
    buttons: [downloadButton, ...(!disabled ? [deleteButton] : [])],
  };
};

const getLoadApi = (baseUrl: string, entity: string, application: string): ApiValuesSchema => {
  if (application === 'ISS') return null as any;
  return {
    refreshFromButtons: ['buttonPress'],
    url: `${baseUrl}/entity/{entityId}`,
    replacements: [
      { key: '{entityId}', source: { type: 'ENTITY', code: entity, jsonPath: ['id'] } },
    ],
  };
};

const getAttachmentCategoryUrl = (entity: string, application: string) => {
  if (entity !== FORM_DEFINITION_ID) {
    return `reference-data/codelists/ATTACHMENT_CATEGORIES/items?attributeKey=entity&attributeValue=${entity}`;
  }

  return application === 'ISS'
    ? 'iss-service-management/form-types/{formTypeCode}/all/attachment-category/dropdown'
    : 'ui-configuration/form-types/{formTypeCode}/all/attachment-category/dropdown';
};

const AttachmentsCard = ({
  id,
  entity,
  formContext,
  validations,
  copyToProperty,
  usePolling,
  baseUrl = 'document-management/attachments',
  attachmentButtons,
  disabled,
  canAdd,
  onAdd,
  open,
  uploadSuccess,
  dssValidation = false,
  validationResults = {},
}: {
  id: string;
  entity: string;
  formContext: any;
  validations?: any;
  copyToProperty?: string;
  usePolling?: boolean;
  baseUrl?: string;
  attachmentButtons?: any;
  disabled?: boolean;
  canAdd?: boolean;
  onAdd?: () => void;
  open?: boolean;
  uploadSuccess?: { triggerId: number; file?: any };
  dssValidation?: boolean;
  validationResults?: Record<string, AttachmentValidationState>;
}) => {
  const { namespace, pageId } = formContext;
  const { triggerId, file } = uploadSuccess!;

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

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);

  const apiData = useApiData(id, getLoadApi(baseUrl, entity, application), {} as any);
  const { url, method, data, queryParams, saveAs } = useDynamicApi(
    id,
    getLoadApi(baseUrl, entity, application),
  );
  const { loading, callApi } = useApiDataState(id);

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const {
    value: oldAttachments,
    setFieldValue: syncAttachments,
    dirty,
  } = useFormField(copyToProperty!);

  const { errors } = useValidations(id, attachments, 'array', validations, undefined, [], true);

  useEffect(() => {
    if (triggerId > 0 && !!file) {
      setAttachments((prev) => [...prev, file]);
    }
  }, [triggerId, file]);

  useEffect(() => {
    if (apiData && Array.isArray(apiData)) {
      setAttachments(
        apiData.map((a) => {
          const matchedCategory = categories?.find((c) => c.code === a.attachmentCategoryCL);
          return {
            ...a,
            attachmentCategoryCLDescription:
              matchedCategory?.label ?? a.attachmentCategoryCLDescription ?? null,
          };
        }),
      );
    }
  }, [apiData, categories]);

  useEffect(() => {
    if (copyToProperty && oldAttachments?.length !== attachments?.length) {
      syncAttachments(
        attachments?.map((attachment) => ({
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
  }, [attachments, copyToProperty]);

  useEffect(() => {
    if (!usePolling) return;

    const interval = setInterval(() => {
      callApi({ id, pageId, url, method, data, queryParams, saveAs });
    }, NOTIF_INTERVAL);

    return () => clearInterval(interval);
  }, [usePolling, id, pageId, url, method, data, queryParams]);

  if (loading) {
    return (
      <GenericInfoCard
        info={translate('checkingForDocuments', { ns: COMMON, lng: selectedLanguage })}
      >
        <IstLoader busy={loading} />
      </GenericInfoCard>
    );
  }

  if (attachments.length === 0 && canAdd && !open && !disabled) {
    return (
      <CardButton
        id={id}
        message={translate('noDocuments', { ns: COMMON, lng: selectedLanguage })}
        fullHeight
        ctaAction={onAdd!}
        ctaLabel={translate('addNew', { ns: COMMON, lng: selectedLanguage })}
        ariaDescription={translate('addNewAriaDescription', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
          field: translate('attachment', { ns: COMMON, lng: selectedLanguage }),
        })}
      />
    );
  }

  if (attachments.length === 0 && (!canAdd || disabled)) {
    return (
      <GenericInfoCard info={translate('noDocuments', { ns: COMMON, lng: selectedLanguage })} />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: open ? 4 : 0,
      }}
    >
      {attachments.map((file) => (
        <GenericCard
          key={file.attachmentId}
          id={file.attachmentId}
          showTitle={false}
          title={file.fileName}
        >
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                gap: 4,
              }}
            >
              <Content
                id={file.attachmentId}
                title={translate('fileName', {
                  ns: formContext?.namespace,
                  lng: selectedLanguage,
                })}
                subtitle={file.fileName}
                isSlim={false}
              />
              {file.attachmentCategoryText && (
                <Content
                  id={file.attachmentId}
                  title={translate('comments', {
                    ns: formContext?.namespace,
                    lng: selectedLanguage,
                  })}
                  subtitle={file.attachmentCategoryText}
                  isSlim={true}
                />
              )}
              {file.attachmentCategoryCL && (
                <Content
                  id={file.attachmentId}
                  title={translate('attachmentCategoryCL', {
                    ns: formContext?.namespace,
                    lng: selectedLanguage,
                  })}
                  subtitle={file.attachmentCategoryCLDescription}
                  isSlim={true}
                />
              )}
            </Box>
            {dssValidation && (
              <ValidationStatusBadge
                attachmentId={file.attachmentId}
                validationState={validationResults[file.fileName]}
              />
            )}
            <AppActions
              page={{ id: `${id}` }}
              source={file}
              actions={buttons(file.attachmentId, disabled)}
            />
            <AppActions page={{ id }} actions={attachmentButtons} />
          </Grid>
        </GenericCard>
      ))}

      {!open && canAdd && !disabled && !!attachments?.length && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <GenericIconButton
            id={`${id}-add-btn`}
            testId="add-btn"
            ariaLabel={translate('addButtonAriaLabel', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
              table: 'attachments',
            })}
            ariaHasPopup="dialog"
            onClick={onAdd!}
            icon={<AssetByType input="icons" name="AddCircle" />}
          />
        </Box>
      )}

      <ValidationErrors clientErrors={errors} id={id} dirty={dirty} />
    </Box>
  );
};

export default AttachmentsCard;
