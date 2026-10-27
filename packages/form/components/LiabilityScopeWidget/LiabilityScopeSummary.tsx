import React from 'react';

import { Typography } from '@mui/material';

import { useTheme } from '@mui/material/styles';
import AppDrawer from '@pkg-common/drawer/AppDrawer';
import SummaryPerType from '../LiabilityScopeWidget/SummaryPerType';
import { SUMMARY_PANEL } from '@pkg-constants/formIds';
import { AnyType } from '@pkg-common/types';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const getStyles = (theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  note: { fontSize: 11, color: theme.palette?.text.hint },
  text: { fontSize: 11, color: theme.palette?.text.secondary },
});

const getItem = (list, code) => {
  return list?.find((item) => item.code === code);
};

const LiabilityScopeSummary = ({
  widgetId,
  selections,
  list,
  namespace,
}: {
  widgetId: string;
  list: Array<AnyType>;
  namespace: string;
  selections: {
    [_: string]: {
      list: Array<{
        billSegment: { id: string; identificationLabel: string };
        excluded: boolean;
        percentage: number;
        maxAmount: number;
      }>;
      percentage: number;
      maxAmount: number;
      periods: Array<{ startDate: string; endDate: string; percentage: number; maxAmount: number }>;
      isByPeriod: boolean;
    };
  };
}) => {
  const styles = getStyles(useTheme());

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, COMMON]);

  const getType = (type: string) => {
    return `${getItem(list, type)?.label || type} : ${selections[type]?.percentage || '-'}%`;
  };

  if (!selections) {
    return null;
  }

  return (
    <AppDrawer
      drawerId={SUMMARY_PANEL}
      closeButtonId={`${widgetId}-summary-close-btn`}
      title={translate('summary', { ns: COMMON, lng: selectedLanguage })}
    >
      <>
        <Typography sx={styles.note}>
          {translate('summaryInfo', { ns: namespace, lng: selectedLanguage })}
        </Typography>

        {Object.keys(selections)
          .filter((selection) => !!selection)
          .map((selection) => (
            <SummaryPerType
              key={selection}
              type={getType(selection)}
              selection={selections[selection]}
            />
          ))}
      </>
    </AppDrawer>
  );
};

export default LiabilityScopeSummary;
