import React, { useMemo } from 'react';
import { DynamicFormGroup } from '@pkg-form/types';
import useFormGroupValidity from '@pkg-form/validations/hooks/useFormGroupValidity';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import { Error } from '@mui/icons-material';
import { getStepStyles } from './styles';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

const StepperStep = ({
  step,
  stepIndex,
  activeStep,
}: {
  step: DynamicFormGroup;
  stepIndex: number;
  activeStep: number;
}) => {
  const styles = getStepStyles(useTheme());

  const fields = step.groups?.[0]?.widgets ?? [];
  const { isGroupValidServerSide } = useFormGroupValidity(fields);
  const { isGroupValid } = useValidationsContext();

  const stepClassName = useMemo(() => {
    if (stepIndex === activeStep + 1) {
      return styles.active;
    } else if (stepIndex < activeStep + 1) {
      return styles.completed;
    } else {
      return styles.future;
    }
  }, [stepIndex, activeStep]);

  return isGroupValidServerSide && isGroupValid(fields) ? (
    <Box sx={stepClassName}>{stepIndex}</Box>
  ) : (
    <Error sx={styles.invalid} />
  );
};

export default StepperStep;
