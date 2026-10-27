import React from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import getStyles from './styles';
import IconSign from '@pkg-form/components/IconSign/IconSign';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import SingleValueRenderer from '@pkg-common/components/ValuesRenderer/SingleValueRenderer';

const ChangedItem = ({
  label,
  value,
  changed = false,
  type,
}: {
  label: React.ReactNode;
  value: any;
  changed?: boolean;
  type?: 'prev' | 'current';
}) => {
  const styles = getStyles(useTheme());
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const isPrev = type === 'prev';

  return (
    <Grid container sx={styles.fieldRow(changed)}>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body2" sx={styles.fieldRowLabel}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: 5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
          }}
        >
          {changed ? (
            <>
              {isPrev ? (
                <IconSign
                  title={<SingleValueRenderer value={value} />}
                  icon={'RemoveCircleOutline'}
                  status={'ERROR'}
                  tooltip={translate('valueChangedFrom', {
                    ns: COMMON,
                    lng: selectedLanguage,
                    value: value,
                  })}
                />
              ) : (
                <IconSign
                  title={<SingleValueRenderer value={value} />}
                  icon={'AddCircle'}
                  status={'SUCCESS'}
                  tooltip={translate('valueChangedTo', {
                    ns: COMMON,
                    lng: selectedLanguage,
                    value: value,
                  })}
                />
              )}
            </>
          ) : (
            <SingleValueRenderer value={value} />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChangedItem;

export const ChangedSingleField = ({
  value,
  changed = false,
  type,
}: {
  value: any;
  changed?: boolean;
  type?: 'prev' | 'current';
}) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const isPrev = type === 'prev';

  return (
    <>
      {changed ? (
        <>
          {isPrev ? (
            <IconSign
              title={<SingleValueRenderer value={value} />}
              icon={'RemoveCircleOutline'}
              status={'ERROR'}
              tooltip={translate('valueChangedFrom', {
                ns: COMMON,
                lng: selectedLanguage,
                value: value,
              })}
            />
          ) : (
            <IconSign
              title={<SingleValueRenderer value={value} />}
              icon={'AddCircle'}
              status={'SUCCESS'}
              tooltip={translate('valueChangedTo', {
                ns: COMMON,
                lng: selectedLanguage,
                value: value,
              })}
            />
          )}
        </>
      ) : (
        <SingleValueRenderer value={value} />
      )}
    </>
  );
};
