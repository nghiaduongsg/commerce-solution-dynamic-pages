import { formatUiNumber } from '@pkg-common/locales';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { GenericFileWidgetProps } from './FileWidget.d';
import useValidation from './hooks/useValidation';
import useFormField from '@pkg-entity/hooks/useFormField';
import { Box, Card, CardContent, Collapse, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import { useDropzone } from 'react-dropzone';
import isEmpty from 'lodash/isEmpty';
import FileUploadWidget from './FileUploadWidget';
import CommonFileUploadWidget from './CommonFileUploadWidget';
import useSystem from '@pkg-setup/src/system/useSystem';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { CloudDownloadSharp, Delete, GetAppSharp, DescriptionSharp } from '@mui/icons-material';
import DeprecationNotice from '../DeprecationNotice/DeprecationNotice';

const DOWNLOAD_ATTACHMENT_API = 'document-management/attachments';

const FILE_STATUS = {
  NO_FILE_STATUS: 'NO_FILE_STATUS',
  UPLOADING_FILE_STATUS: 'UPLOADING_FILE_STATUS',
  COMPLETED_FILE_STATUS: 'COMPLETED_FILE_STATUS',
};

const getStyles = (theme) => {
  return {
    svgIcon: {
      marginRight: theme.spacing(1),
    },
    card: {
      boxShadow: 'none',
      borderRadius: theme.spacing(1),
      cursor: 'default',
    },
    cardContent: {
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'default',
      '&:last-child': {
        padding: 0,
        overflow: 'hidden',
      },
    },
    cardDropArea: {
      padding: theme.spacing(1),
      color: theme.palette?.text.secondary,
      border: `1px dashed ${theme.palette?.text.disabled}`,
    },
    cardFileAddedArea: {
      padding: theme.spacing(3),
      backgroundColor: theme.palette?.primary.light,
      width: '100%',
    },
    underlined: {
      color: '#2196F3',
      textDecoration: 'underline',
    },
    helperText: {
      color: theme.palette?.text.disabled,
    },
    disabled: {
      color: theme.palette?.text.disabled,
    },
    disabledCursor: {
      cursor: 'not-allowed',
    },
    file: {
      textTransform: 'none',
      padding: 0,
      backgroundColor: 'transparent',
    },
    fileIcon: {
      color: theme.palette?.primary.main,
    },

    fileSize: {
      textAlign: 'left',
    },
  };
};

const MAX_FILE_SIZE = 10;

const downloadFile = (file, apiUrl) => {
  const { attachmentId, fileName } = file;
  axios({
    url: `${apiUrl}/${DOWNLOAD_ATTACHMENT_API}/download/${attachmentId}`,
    method: 'GET',
    responseType: 'blob',
  })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    })
    .catch((e) => console.log('e', e));
};

const FileWidget = ({ id, options, readonly, disabled }: GenericFileWidgetProps) => {
  const { t: localizeUi, i18n: uiI18n } = useTranslation('common');

  const styles = getStyles(useTheme());

  const { value = {}, clearFormValues } = useFormField(id);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const [fileStatus, setFileStatus] = useState(FILE_STATUS.NO_FILE_STATUS);
  const [serverErrors, setServerErrors] = useState<Array<string>>([]);

  const [fileToShow, setFileToShow] = useState(
    value && Object.keys(value).length
      ? { path: value['fileName'], size: value['sizeInBytes'] }
      : {},
  );

  const { validations = {}, obsolete = false, importFile = false } = options;

  const { getRootProps, getInputProps, acceptedFiles, fileRejections } = useDropzone({
    onDropAccepted: () => {
      setFileStatus(FILE_STATUS.UPLOADING_FILE_STATUS);
    },
    multiple: false,
    noClick: false,
    accept: importFile
      ? { 'application/xml': ['.xml'] }
      : {
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
        },
    maxSize: MAX_FILE_SIZE * 1024 * 1024,
    disabled,
  });

  const { clientErrors, hasErrors } = useValidation({
    required: validations && validations.required ? validations.required : false,
    value,
    id,
    serverErrors,
    fileRejections,
  });
  const { apiUrl } = useSystem();

  const clearValues = () => {
    clearFormValues([id]);
    setFileStatus(FILE_STATUS.NO_FILE_STATUS);
  };

  useEffect(() => {
    if (!isEmpty(value)) {
      setFileStatus(FILE_STATUS.COMPLETED_FILE_STATUS);
    }
    setFileToShow(
      value && Object.keys(value).length
        ? { path: value['fileName'], size: value['sizeInBytes'] }
        : {},
    );
  }, [value]);

  const cardStyles = useMemo(() => {
    return {
      ...styles.card,
      ...(fileStatus === FILE_STATUS.NO_FILE_STATUS ? styles.cardDropArea : {}),
      ...(disabled ? styles.disabledCursor : {}),
    };
  }, [disabled, styles, fileStatus]);

  const cardContentStyles = useMemo(() => {
    return {
      ...styles.cardContent,
      ...(disabled ? styles.disabledCursor : {}),
    };
  }, [disabled, styles]);

  return (
    <Box key={`${id}_box`}>
      <DeprecationNotice
        message={translate('widgetDeprecated', {
          ns: COMMON,
          componentName: 'FileWidget',
          replacement: 'Attachments',
          lng: selectedLanguage,
        })}
      />
      <Collapse in={fileStatus === FILE_STATUS.NO_FILE_STATUS}>
        <Card
          elevation={0}
          {...getRootProps({ className: 'dropzone' })}
          sx={cardStyles}
          id={`${id}_dropbox`}
        >
          <CardContent sx={cardContentStyles}>
            <input {...getInputProps()} id={`${id}_dropfile`} />
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudDownloadSharp sx={styles.svgIcon} />
              <Typography variant="caption">
                {translate('dragAndDrop', { ns: COMMON, lng: selectedLanguage })}
                <span style={styles.underlined}>
                  {translate('browse', { ns: COMMON, lng: selectedLanguage })}
                </span>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      <Collapse in={fileStatus === FILE_STATUS.UPLOADING_FILE_STATUS}>
        {obsolete ? (
          <FileUploadWidget
            id={id}
            options={options}
            value={value}
            fileUsed={acceptedFiles.length ? acceptedFiles[0] : []}
            fileStatus={fileStatus}
            onStatusChanged={setFileStatus}
            onServerError={setServerErrors}
          />
        ) : (
          <CommonFileUploadWidget
            id={id}
            options={options}
            value={value}
            fileUsed={acceptedFiles.length ? acceptedFiles[0] : []}
            fileStatus={fileStatus}
            onStatusChanged={setFileStatus}
            onServerError={setServerErrors}
          />
        )}
      </Collapse>

      <Collapse in={fileStatus === FILE_STATUS.COMPLETED_FILE_STATUS}>
        <Card sx={cardStyles}>
          <CardContent sx={styles.cardContent}>
            <Grid
              container
              alignItems="flex-start"
              justifyContent="space-between"
              sx={styles.cardFileAddedArea}
            >
              <Grid size={{ xs: 6 }} id={`${id}_addedfile`}>
                {!!Object.keys(fileToShow).length && (
                  <Grid container direction="row">
                    <Grid size={{ xs: 'auto' }}>
                      <DescriptionSharp />
                    </Grid>
                    <Grid size={{ xs: 'auto' }} alignItems="center">
                      <Grid container direction="column">
                        <Grid size={{ xs: 'auto' }}>
                          <Typography variant="caption" color="textPrimary">
                            {fileToShow['path']}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 'auto' }} sx={styles.fileSize}>
                          <Typography variant="caption" sx={styles.disabled}>
                            {localizeUi('ui.fileSize', {
                              size: formatUiNumber(
                                fileToShow['size'] / 1024,
                                uiI18n.resolvedLanguage || uiI18n.language,
                              ),
                            })}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Grid container direction="row" justifyContent="flex-end">
                  <GenericIconButton
                    id={`${id}_download`}
                    ariaLabel={translate('download', { ns: COMMON, lng: selectedLanguage })}
                    label={translate('download', { ns: COMMON, lng: selectedLanguage })}
                    ariaDescription={translate('downloadAriaDescription', {
                      ns: ACCESSIBILITY,
                      file: fileToShow['path'],
                      lng: selectedLanguage,
                    })}
                    testId="download-btn"
                    onClick={() => downloadFile(value, apiUrl)}
                    icon={<GetAppSharp />}
                  />

                  {!readonly && (
                    <GenericIconButton
                      id={`${id}_deletebtn`}
                      testId="delete-btn"
                      ariaLabel={translate('delete', { ns: COMMON, lng: selectedLanguage })}
                      label={translate('delete', { ns: COMMON, lng: selectedLanguage })}
                      ariaDescription={translate('deleteFileAriaDescription', {
                        ns: ACCESSIBILITY,
                        file: fileToShow['path'],
                        lng: selectedLanguage,
                      })}
                      disabled={disabled}
                      onClick={clearValues}
                      icon={<Delete />}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>
      <Grid container justifyContent="space-between">
        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" sx={styles.helperText}>
            {translate('fileUploaderInfo', {
              ns: COMMON,
              lng: selectedLanguage,
              fileTypes: importFile
                ? '.xml'
                : '.zip, .pdf, .txt, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png, .gif',
              fileSize: `${MAX_FILE_SIZE}MB`,
            })}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          {hasErrors && (
            <ValidationErrors
              id={id}
              clientErrors={clientErrors}
              serverErrors={serverErrors}
              dirty={true}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileWidget;
