import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import useSystem from '@pkg-setup/src/system/useSystem';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';
import WarningDialog from '@pkg-form/templates/ArrayTemplate/BasicTemplate/WarningDialog';

const FileReadWidget = ({ id, options }) => {
  const { warnOnAction } = options;
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { selectedLanguage } = useSystem();
  const { setUserPreferences } = useUserSettings();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [fileToLoad, setFileToLoad] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDropAccepted = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      setError('No file selected');
      return;
    }

    setFileToLoad(file);
    setOpenConfirm(true);
  };

  const onDrop = (acceptedFiles: File[]) => {
    setError(null);

    const file = acceptedFiles[0];
    if (!file) {
      setError('noFileSelected');
      return;
    }

    setFileToLoad(file);
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    if (!fileToLoad) {
      setError('No file selected');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setUserPreferences('', 'MERGE', '', JSON.parse(result));
        } else {
          setError('invalidFile');
        }
      };

      reader.readAsText(fileToLoad);
    } catch {
      setError('invalidFile');
    }

    setOpenConfirm(false);
    setFileToLoad(null);
  };

  const handleCancel = () => {
    setOpenConfirm(false);
    setFileToLoad(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropAccepted,
    onDropRejected: () => {
      setError('invalidFile');
      setFileToLoad(null);
    },
    multiple: false,
    accept: {
      'application/json': ['.json'],
    },
  });

  return (
    <>
      <Box
        {...getRootProps()}
        border={error ? `2px dashed red` : '2px dashed #ccc'}
        p={2}
        textAlign="center"
      >
        <input
          {...getInputProps()}
          aria-label={translate('clickToSelect', { ns: COMMON, lng: selectedLanguage })}
        />
        <Typography variant="caption">
          {translate('dragAndDrop', { ns: COMMON, lng: selectedLanguage })}
          <Box
            component="span"
            sx={{ textDecoration: 'underline', color: 'primary.main', cursor: 'pointer' }}
          >
            {translate('clickToSelect', { ns: COMMON, lng: selectedLanguage })}
          </Box>
        </Typography>
      </Box>
      {fileToLoad && !error && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} mb={1}>
          <Typography variant="body2">{fileToLoad.name}</Typography>
        </Box>
      )}
      {error && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} mb={1}>
          <Typography variant="body2" color={'error'}>
            {translate(error || 'uploadGenericErrorMessage', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
          </Typography>
        </Box>
      )}
      <WarningDialog
        id={`${id}-confirm-file-upload`}
        open={openConfirm}
        onConfirm={handleConfirm}
        onClose={handleCancel}
        warnOnAction={warnOnAction}
      />
    </>
  );
};

export default FileReadWidget;
