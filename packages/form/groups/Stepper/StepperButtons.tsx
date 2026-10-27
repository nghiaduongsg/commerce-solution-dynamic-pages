import React from 'react';
import { useTheme } from '@mui/material/styles';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useEntity from '@pkg-entity/hooks/useEntity';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';

const getStyles = (theme) => {
  return {
    button: {
      marginRight: theme.spacing(1),
    },
  };
};

const StepperButtons = ({
  id,
  parentId,
  stepNumber,
  activeStep,
  onNextPressed,
  onBackPressed,
  onClearPressed,
  buttons,
  currentStepButtons,
}: {
  id: string;
  parentId: string;
  stepNumber: number;
  activeStep: number;
  onNextPressed: () => void;
  onBackPressed: () => void;
  onClearPressed: () => void;
  buttons?: AppActionButtons;
  currentStepButtons?: AppActionButtons;
}) => {
  const styles = getStyles(useTheme());
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { isNew, entity } = useEntity(parentId);

  const isReadOnlyStatus = [
    'POSTED',
    'REJECTED',
    'APPROVED',
    'CANCELED',
    'SUBMITTED',
    'SUSPENDED',
    'VALIDATED',
  ].includes(entity?.statusCL);

  const shouldShowClearButton = !isReadOnlyStatus || isNew;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      {shouldShowClearButton && (
        <GenericButton
          styles={styles.button}
          id={`${id}-clear`}
          testId={`${id}-clear-btn`}
          disabled={false}
          label={translate('clear', { ns: COMMON, lng: selectedLanguage })}
          onClick={onClearPressed}
          ariaLabel={translate('clear', { ns: COMMON, lng: selectedLanguage })}
          ariaDescription={translate('clearButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
        />
      )}

      <GenericButton
        styles={styles.button}
        id={`${id}-back`}
        testId={`back-btn`}
        label={translate('back', { ns: COMMON, lng: selectedLanguage })}
        disabled={activeStep === 0}
        onClick={onBackPressed}
        ariaLabel={translate('back', { ns: COMMON, lng: selectedLanguage })}
        ariaDescription={translate('stepperBackButtonAriaDescription', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        })}
      />
      {activeStep < stepNumber - 1 && (
        <GenericButton
          styles={styles.button}
          id={`${id}-next`}
          testId={`next-btn`}
          disabled={activeStep === stepNumber - 1}
          label={translate('next', { ns: COMMON, lng: selectedLanguage })}
          onClick={onNextPressed}
          ariaLabel={translate('next', { ns: COMMON, lng: selectedLanguage })}
          ariaDescription={translate('stepperNextButtonAriaDescription', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
        />
      )}
      {buttons && <AppActions page={{ id }} actions={buttons} checkPermissions={true} />}
      {currentStepButtons && (
        <AppActions page={{ id }} actions={currentStepButtons} checkPermissions={true} />
      )}
    </div>
  );
};

export default StepperButtons;
