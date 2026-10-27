import React from 'react';
import { Alert, List, ListItem, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const getStyles = () => {
  return {
    listContainer: {
      listStyleType: 'none',
    },
    listItemContainer: {
      display: 'list-item',
    },
  };
};

const FormInformation = ({
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
  const styles = getStyles();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace]);

  return (
    <Alert severity={severity} variant={'outlined'} icon={false} id={`${id}-info-tooltip`}>
      {title && (
        <Typography component={'span'} variant={'body2'}>
          {translate(title, { lng: selectedLanguage, ns: namespace })}
        </Typography>
      )}
      <List sx={styles.listContainer}>
        {helpTextList?.map((item, index) => (
          <ListItem key={index} sx={styles.listItemContainer}>
            {translate(`${item || ''}`, {
              ns: namespace,
              lng: selectedLanguage,
              key: item,
            })}
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};

export default FormInformation;
