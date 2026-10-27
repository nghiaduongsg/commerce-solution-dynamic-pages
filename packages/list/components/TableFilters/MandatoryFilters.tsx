import React from 'react';
import { Paper, Typography, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const MandatoryFiltersAlert = ({
  namespace,
  helpTextList,
  title,
  id,
  severity = 'info',
}: {
  namespace: string;
  helpTextList?: Array<string> | undefined;
  title?: string;
  severity?: 'info' | 'warning' | 'error';
  id: string;
}) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace]);

  const severityColors: Record<string, string> = {
    info: '#e3f2fd',
    warning: '#fdF4E3',
    error: '#ffebee',
  };

  return (
    <Paper
      sx={{
        padding: 2,
        backgroundColor: severityColors[severity],
        color: '#000000',
      }}
      id={`${id}-related-info`}
      elevation={0}
    >
      {title && (
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
          {translate(title, { lng: selectedLanguage, ns: namespace })}
        </Typography>
      )}

      {helpTextList && helpTextList.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {helpTextList.map((item, index) => (
            <Chip
              key={index}
              label={translate(item, { ns: namespace, lng: selectedLanguage, key: item })}
              size="small"
              variant="outlined"
              clickable={false}
              color="primary"
              sx={{ marginBottom: 0.5 }}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default MandatoryFiltersAlert;
