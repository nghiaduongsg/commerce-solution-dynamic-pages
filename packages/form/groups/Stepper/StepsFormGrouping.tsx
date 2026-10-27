import React, { useContext, useEffect, useState } from 'react';
import { Box, Step, StepLabel, Stepper } from '@mui/material';
import { DynamicFormGroup, FormContextSchema } from '@pkg-form/types';
import { AnyType, CheckFromSchema, InfoSchema } from '@pkg-common/types';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import StepperButtons from '@pkg-form/groups/Stepper/StepperButtons';
import { getStyles } from '@pkg-form/groups/Stepper/styles';
import { useTranslation } from 'react-i18next';
import useEntity from '@pkg-entity/hooks/useEntity';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import StepperContent from '@pkg-form/groups/Stepper/StepperContent';
import StepperStep from '@pkg-form/groups/Stepper/StepperStep';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';
import useButtonPress from '@pkg-common/button/useButtonPress';
import { useStore } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import { shouldBeApplied } from '@pkg-common/dataResolver/utils';
import { useUser } from '@pkg-setup/index';
import WithInfoPieces from '@pkg-form/groups/WithInfoPieces';
import FormManagerContext from '@pkg-form/FormManagerContext';
import { getWidgetNameFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';

const StepsFormGrouping = ({
  id,
  steps,
  namespace,
  elements,
  level,
  parentId,
  buttons,
  information,
  options,
  formContext,
}: {
  id: string;
  steps: Array<DynamicFormGroup> | undefined;
  namespace: string;
  elements: Array<AnyType>;
  level: number;
  parentId: string;
  buttons?: AppActionButtons;
  information?: Array<InfoSchema>;
  options?: {
    allowButtonClearByStep?: boolean;
    schemaActiveTab?: {
      key: string;
      applyChangeWhen?: CheckFromSchema;
    };
  };
  formContext: FormContextSchema;
}) => {
  const styles = getStyles();

  const { selectedLanguage, application } = useSystem();
  const { t: translate } = useTranslation([namespace || COMMON, ACCESSIBILITY]);

  const storeState = useStore();
  const { state: locationState } = useLocation();
  const routeParams = useParams();
  const { partyRoleId, userId } = useUser();

  const { applyChangeWhen, key } = options?.schemaActiveTab || {};
  const { allowButtonClearByStep = false } = options || {};
  const { check: applyUnderCondition } = useCheckFrom(id, applyChangeWhen, false);
  const { markButtonPress } = useButtonPress(`clearStepper`);

  const user = React.useMemo(() => {
    return application === 'ISS' ? userId : partyRoleId;
  }, [application, userId, partyRoleId]);

  const visibleSteps = React.useMemo(() => {
    return (steps || []).filter((step) =>
      shouldBeApplied(step?.visibilityFrom as CheckFromSchema, id, {
        user,
        state: storeState?.getState() || {},
        routeParams,
        routerData: locationState,
      }),
    );
  }, [steps, id, user, routeParams, locationState, storeState, storeState?.getState()]);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (applyUnderCondition && applyChangeWhen) {
      setActiveStep(Number(key));
    }
  }, [applyUnderCondition, applyChangeWhen, key]);

  useEffect(() => {
    if (activeStep >= visibleSteps.length) {
      setActiveStep(0);
    }
  }, [visibleSteps, activeStep]);

  const { clearFormSteps } = useEntity(parentId);

  const onNextPressed = () => setActiveStep((current) => current + 1);
  const onBackPressed = () => setActiveStep((current) => current - 1);

  const formManager = useContext(FormManagerContext);

  const onClearPressed = () => {
    const readOnlyFieldIds = formManager?.getReadOnlyFields() ?? new Set<string>();
    const readOnlyWidgets = new Set<string>([...readOnlyFieldIds].map(getWidgetNameFromWidgetId));
    clearFormSteps(steps, activeStep, allowButtonClearByStep, readOnlyWidgets);
    if (!allowButtonClearByStep) {
      setActiveStep(0);
    }
    markButtonPress();
  };

  return (
    <Box sx={styles.container}>
      <Stepper
        style={{ marginBottom: 32 }}
        id={`${parentId}-${id}-steps`}
        data-testid={`${parentId}-${id}-steps`}
        activeStep={activeStep}
        aria-label={translate('stepsAriaLabel', { ns: ACCESSIBILITY, lng: selectedLanguage })}
        aria-description={translate('stepsAriaDescription', {
          ns: ACCESSIBILITY,
          steps: visibleSteps.length,
          lng: selectedLanguage,
        })}
        orientation="horizontal"
        alternativeLabel
        tabIndex={0}
      >
        {visibleSteps.map((step, index) => (
          <Step
            key={step.key}
            id={`${parentId}-${id}-step-${index}`}
            data-testid={`${parentId}-${id}-step-${index}`}
            aria-labelledby={`${id}-${step.key}-step-label`}
            onClick={() => setActiveStep(index)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setActiveStep(index);
              }
            }}
            tabIndex={0}
          >
            <StepLabel
              id={`${id}-${step.key}-step-label`}
              icon={<StepperStep step={step} stepIndex={index + 1} activeStep={activeStep} />}
            >
              <WithInfoPieces id={id} info={information}>
                <span>{translate(step.key, { ns: namespace, lng: selectedLanguage })}</span>
              </WithInfoPieces>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {visibleSteps.map((step, index) => (
        <StepperContent
          key={`${id}-${step.key}-step-content`}
          id={id}
          parentId={parentId}
          active={index === activeStep}
          level={level}
          namespace={namespace}
          elements={elements}
          step={step}
          formContext={formContext}
        />
      ))}

      <Box sx={styles.lowButtonsContainer}>
        <StepperButtons
          id={parentId}
          parentId={parentId}
          stepNumber={visibleSteps.length}
          activeStep={activeStep}
          onNextPressed={onNextPressed}
          onBackPressed={onBackPressed}
          onClearPressed={onClearPressed}
          buttons={buttons}
          currentStepButtons={visibleSteps[activeStep]?.['ui:buttons']}
        />
      </Box>
    </Box>
  );
};

export default StepsFormGrouping;
