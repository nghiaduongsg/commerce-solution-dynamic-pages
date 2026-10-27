import React, { useMemo } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { InfoSchema } from '@pkg-common/types';
import { ErrorOutline, InfoRounded, Warning } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import InfoTooltip from '@pkg-common/components/InfoTooltip/InfoTooltip';
import { hasValue } from '@pkg-common/utils';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import DOMPurify from 'dompurify';

const getStyles = () => {
  return {
    container: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    containerRow: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
    },
    alertContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      maxWidth: '100%',
      whiteSpace: 'normal',
    },
  };
};

const SeverityIcon = ({ severity, color, sx }) => {
  const combinedSx = {
    ...(color && { color }),
    ...(sx ?? {}),
  };
  switch (severity) {
    case 'error':
      return <ErrorOutline sx={combinedSx} />;
    case 'warning':
      return <Warning sx={combinedSx} />;
    case 'info':
      return <InfoRounded sx={combinedSx} />;
    default:
      return false;
  }
};

const HtmlMessage = ({
  html,
  severity,
  preserveWhitespace,
}: {
  html: string;
  severity: string;
  preserveWhitespace?: boolean;
}) => (
  <Box
    sx={{
      ...(preserveWhitespace && { whiteSpace: 'pre-line' }),
      color: `${severity}.main`,
      '& strong, & b': { fontWeight: '700' },
    }}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
  />
);

const WithInfo = ({ id, info }: { id: string; info: InfoSchema }) => {
  const theme = useTheme();
  const styles = getStyles();
  const { infoMessage, sxIcon } = info || {};

  const {
    translatedMessage,
    severity,
    isTooltip,
    isDefault,
    isMultiple,
    variant,
    displayIcon,
    allowHtml,
  } = useAdditionalInfo(id, info ?? {});

  const iconColor = useMemo(() => {
    if (severity === 'error') {
      return theme.palette.error.main;
    }
    if (severity === 'warning') {
      return theme.palette.warning.main;
    }
    return theme.palette.info.main;
  }, [severity]);

  if (isTooltip && hasValue(info)) {
    return (
      <Box sx={{ marginRight: 4 }} tabIndex={0}>
        <InfoTooltip
          id={`${id}-info-tooltip-container`}
          dataTestId={`${infoMessage}-InfoRounded`}
          message={translatedMessage}
          icon={<SeverityIcon severity={severity} color={iconColor} sx={sxIcon} />}
          allowHtml={allowHtml}
        />
      </Box>
    );
  }

  if (isMultiple && hasValue(info)) {
    return (
      <Alert
        style={styles.alertContainer}
        severity={severity}
        variant={variant}
        icon={
          displayIcon ? <SeverityIcon severity={severity} color={iconColor} sx={sxIcon} /> : false
        }
      >
        {allowHtml ? (
          <HtmlMessage html={String(translatedMessage)} severity={severity} />
        ) : (
          <Typography sx={{ color: `${severity}.main` }}> {translatedMessage}</Typography>
        )}
      </Alert>
    );
  }

  if (isDefault && hasValue(info)) {
    return (
      <Alert
        style={styles.alertContainer}
        severity={severity}
        variant={variant}
        icon={
          displayIcon ? <SeverityIcon severity={severity} color={iconColor} sx={sxIcon} /> : false
        }
      >
        {allowHtml ? (
          <HtmlMessage html={String(translatedMessage)} severity={severity} preserveWhitespace />
        ) : (
          <Typography sx={{ whiteSpace: 'pre-line', color: `${severity}.main` }}>
            {translatedMessage}
          </Typography>
        )}
      </Alert>
    );
  }

  return null;
};

export default WithInfo;
