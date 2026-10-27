import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useEntity } from '@pkg-entity/index';
import { format, isValid } from 'date-fns';
import useDate from '@pkg-common/hooks/useDate';
import GenericDate from '@pkg-common/atomics/GenericDate/GenericDate';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import WarningDialog from '@pkg-form/templates/ArrayTemplate/BasicTemplate/WarningDialog';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const getStyles = () => ({
  dateField: {
    maxWidth: '250px',
    backgroundColor: '#ffffff',
    '&:hover': { borderColor: '#999999' },
    '&.Mui-focused': { borderColor: '#666666', backgroundColor: '#ffffff' },
    '& .MuiSvgIcon-root': {
      color: '#000000',
    },
  },
});

const PageHistoryContent = ({ id }: { id: string }) => {
  const styles = getStyles();
  const { selectedLocale } = useSystem();
  const dateFormat = useDate('date');
  const { isFormDirty } = useFormManagerContext();

  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const [openCalendar, setOpenCalendar] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { validOnDate, setValidOnDate } = useEntity(id);

  return (
    <GenericCard
      id={`history-date-card`}
      showTitle={false}
      title={translate('historyData', { ns: COMMON })}
    >
      <GenericDate
        dataTestId="history-valid-on-date"
        helpText={translate('historyData', { ns: COMMON })}
        label={translate('selectDate', { ns: COMMON })}
        valid={true}
        locale={selectedLocale}
        onChange={(date) => {
          if (!date || !isValid(date)) {
            setValidOnDate(null);
            return;
          }
          setValidOnDate(format(date, 'yyyy-MM-dd'));
        }}
        fieldSx={styles.dateField}
        value={validOnDate ?? ''}
        maxDate={format(new Date(), dateFormat)}
        formatAs={'date'}
        dateFormat={dateFormat}
        open={openCalendar}
        onOpen={() => {
          if (isFormDirty(id)) {
            setShowWarning(true);
          } else {
            setOpenCalendar(true);
          }
        }}
        onClose={() => {
          setOpenCalendar(false);
        }}
      />
      {showWarning && (
        <WarningDialog
          id={`${id}-button`}
          onConfirm={() => {
            setShowWarning(false);
            setOpenCalendar(true);
          }}
          onClose={() => setShowWarning(false)}
          warnOnAction={
            {
              enabled: true,
              whenToWarn: {
                warnValues: ['ALWAYS'],
              },
              translation: {
                warningTitleKey: 'confirm',
                warningMessageKey: 'unsavedSidePanelChanges',
              },
            } as any
          }
          open={showWarning}
        />
      )}
    </GenericCard>
  );
};

export default PageHistoryContent;
