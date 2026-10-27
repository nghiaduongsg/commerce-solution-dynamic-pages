import React, { useState, useEffect } from 'react';
import Axios from 'axios-observable';
import { FileUploadWidgetProps } from './FileWidget.d';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';
import useFormField from '@pkg-entity/hooks/useFormField';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import { AppError } from '@pkg-common/types';
import { useTheme } from '@mui/material/styles';

export const IMPORT_FILE = 'ImportFile';

const getStyles = (theme) => {
  return {
    cardFileAddedArea: {
      boxShadow: 'none',
      borderRadius: theme.spacing(1),
      backgroundColor: theme.palette.primary.light,
      overflow: 'hidden',
    },
    cardContent: {
      cursor: 'pointer',
      padding: theme.spacing(3),
    },
    disabled: {
      color: theme.palette.text.disabled,
    },
  };
};

const FILE_STATUS = {
  NO_FILE_STATUS: 'NO_FILE_STATUS',
  UPLOADING_FILE_STATUS: 'UPLOADING_FILE_STATUS',
  COMPLETED_FILE_STATUS: 'COMPLETED_FILE_STATUS',
};

const isValidResponse = (response) => {
  if (
    response &&
    response.data &&
    response.data.attachmentId &&
    response.data.fileName &&
    response.data.sizeInBytes
  ) {
    return true;
  }
  return false;
};

const CommonFileUploadWidget = ({
  id,
  options,
  fileUsed,
  fileStatus,
  onStatusChanged,
  onServerError,
}: FileUploadWidgetProps) => {
  const styles = getStyles(useTheme());
  const [progress, setProgress] = useState(0);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { apiValues, path, importFile = false } = options;

  const { url, method, data, dataValuesReady } = useDynamicApi(id, apiValues);

  const { value = {}, setFieldValue } = useFormField(id);
  const { apiUrl, authToken: token } = useSystem();

  useEffect(() => {
    setProgress(0);

    if (fileStatus !== FILE_STATUS.UPLOADING_FILE_STATUS) {
      return;
    }

    if (!url && fileStatus !== FILE_STATUS.NO_FILE_STATUS) {
      onStatusChanged(FILE_STATUS.NO_FILE_STATUS);
      return;
    }

    // Initial FormData
    const formData = new FormData();
    formData.append('attachment', fileUsed, fileUsed.name);
    if (importFile) {
      formData.append('xmlFile', fileUsed, fileUsed.name);
    }

    formData.append('path', path);
    if (dataValuesReady) {
      formData.append(
        'attachmentDetails',
        new Blob([JSON.stringify(data)], {
          type: 'application/json',
        }),
      );
    }

    const config = {
      onUploadProgress(progressEvent) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    };

    Axios[method || 'post'](`${apiUrl}/${url}`, formData, config).subscribe(
      (response) => {
        if (isValidResponse(response)) {
          const newValue = {
            attachmentId: response.data.attachmentId,
            fileName: response.data.fileName,
            sizeInBytes: response.data.sizeInBytes,
          };
          setFieldValue(newValue);
          onStatusChanged(FILE_STATUS.COMPLETED_FILE_STATUS);
        } else {
          setFieldValue(value);
          onStatusChanged(FILE_STATUS.NO_FILE_STATUS);
        }
        onServerError([]);
      },
      (error: AppError) => {
        onStatusChanged(FILE_STATUS.NO_FILE_STATUS);
        onServerError((error?.violations || [])?.map((v) => v.message));
      },
    );
  }, [fileUsed, fileStatus]);

  return (
    <Card sx={styles.cardFileAddedArea} elevation={0}>
      <CardContent sx={styles.cardContent}>
        <Grid container>
          <Grid size={{ xs: 8 }}>
            <Grid container>
              <Grid size={{ xs: 'auto' }}>
                {fileUsed && (
                  <>
                    <Typography variant="caption" color="textSecondary" align="left">
                      {fileUsed['path']}
                    </Typography>
                  </>
                )}
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Grid container alignItems="center">
                  <Grid size={{ xs: 'auto' }}>
                    {fileUsed && (
                      <>
                        <Typography variant="caption" sx={styles.disabled}>
                          {(fileUsed['size'] / 1024).toFixed(2)}
                          {' KB'}
                        </Typography>
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 'auto' }}>
                    <Typography variant="caption" color="textPrimary">
                      {progress}%
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  id={`${id}_linearprogess`}
                  color="primary"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 'auto' }}>
            <GenericIconButton
              id={`${id}_cancelbtn`}
              testId="cancel-btn"
              ariaLabel={translate('cancel', { ns: COMMON, lng: selectedLanguage })}
              label={translate('cancel', { ns: COMMON, lng: selectedLanguage })}
              onClick={() => {
                setFieldValue(null);
                onStatusChanged(FILE_STATUS.NO_FILE_STATUS);
              }}
              icon={<AssetByType input="icons" name="Cancel" />}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CommonFileUploadWidget;
