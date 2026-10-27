import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ValidationErrorsProps } from './ValidationErrors.d';
import { getTranslationParts } from '@pkg-form/validations/utils/widgetUtils';
import { ACCESSIBILITY, VALIDATIONS } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import { validationCodes } from '@pkg-constants/validationCodes';
import useStyles from './styles';
import { useSystem } from '@pkg-setup/index';

type MessageType = {
  message: string;
  type: 'WARNING' | 'ERROR';
};

type MessageListProps = {
  id: string;
  messages: string[];
  messageTypes?: MessageType[];
  type: 'SERVER' | 'CLIENT' | 'INFO';
};

const MessageList = ({ id, messages, type, messageTypes = [] }: MessageListProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { selectedLanguage } = useSystem();

  const { t: translate } = useTranslation([VALIDATIONS, ACCESSIBILITY], {
    lng: selectedLanguage,
  });

  const getValidationMessage = (error: string | Array<string>) => {
    // Avoid translating errors that contain the character : because translation message breaks
    if (type === 'SERVER' && error?.indexOf(':')) {
      return error;
    }

    const parts = getTranslationParts(error);

    return `${validationCodes[parts.msg] ? validationCodes[parts.msg] + ':' : ''} ${translate(parts.msg, parts.options)}`;
  };

  return (
    <Box id={`${id}-error-container`} aria-live={'polite'} role={'alert'}>
      {messages
        .filter((error) => !!error)
        .map((error, index) => {
          const messageType = Array.isArray(messageTypes)
            ? messageTypes.find((msgType) => msgType.message === error)?.type
            : null;

          return (
            <Typography
              key={index}
              variant="caption"
              sx={
                type === 'INFO'
                  ? styles.textCompare
                  : messageType === 'WARNING'
                    ? styles.textWarning
                    : styles.text
              }
              id={`${id}-error-${index}`}
              data-testid={`fieldError-${id}-${index}`}
            >
              {getValidationMessage(error)}
            </Typography>
          );
        })}
    </Box>
  );
};

const ValidationErrors = ({
  id,
  clientErrors,
  serverErrors,
  serverErrorTypes = [],
  diffs,
  dirty,
}: ValidationErrorsProps) => {
  if (clientErrors && clientErrors.length > 0 && dirty) {
    return <MessageList id={id} messages={clientErrors} type={'CLIENT'} />;
  }

  if (diffs && diffs.length > 0) {
    return <MessageList id={id} messages={diffs} type={'INFO'} />;
  }

  if (serverErrors && serverErrors.length > 0) {
    return (
      <MessageList
        id={id}
        messages={serverErrors}
        messageTypes={serverErrorTypes}
        type={'SERVER'}
      />
    );
  }

  return null;
};

export default ValidationErrors;
