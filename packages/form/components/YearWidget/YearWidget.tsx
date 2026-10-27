import React, { useMemo } from 'react';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import { alpha, Theme, useTheme } from '@mui/material/styles';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps } from '@pkg-form/types';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers-pro/AdapterDateFns';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import { AnyType } from '@pkg-common/types';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const getStyles = (theme: Theme): Record<string, AnyType> => {
  return {
    container: {
      width: '267px',
      '& .MuiInputLabel-root': {
        position: 'relative',
        textTransform: 'uppercase',
        fontSize: '12px',
        top: '-16px',
        left: '-11px',
        color: 'rgba(0, 0, 0, 0.54)',
        letterSpacing: '0.5px',
      }, //styles the label
      '& .MuiPickersOutlinedInput-root': {
        '&:hover > fieldset': { borderColor: theme.palette?.primary.main },
        '&:hover': { borderColor: theme.palette?.primary.main },
        height: '41px',
        borderRadius: '4px',
        paddingTop: 0,
        paddingBottom: 0,
        fieldset: {
          paddingRight: theme.spacing(2),
          paddingLeft: theme.spacing(2),
          '&:hover': { border: `1px solid ${theme.palette?.primary.main}` },
          '&:focused': {
            border: `1px solid ${theme.palette?.primary.main}`,
            backgroundColor: theme.palette?.primary.light,
          },
        },
        legend: {
          maxWidth: 0,
        },
        '&:focused > fieldset': {
          border: `0.5px solid ${theme.palette?.primary.main}`,
          backgroundColor: theme.palette?.primary.light,
        },
      },
      '& .MuiIconButton-root': {
        cursor: 'pointer',
        fontSize: theme.spacing(3),
        border: `0.5px solid transparent`,
        '&:hover': {
          backgroundColor: theme.palette?.primary.light,
          border: `0.5px solid ${alpha(theme.palette?.primary.main, 0.6)}`,
        },
      },
    },
  };
};
const YearWidget = ({
  id,
  disabled,
  options,
  serverErrors,
  diffs,
  inputProps,
  readonly,
  schema,
  uiSchema,
  value: innerValue,
  onChange,
  formContext,
}: FormWidgetProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const info = uiSchema['ui:information'] ?? {};

  const { validations, validateFrom, validateWhen } = options;

  const useDefaultMechanism = formContext?.mechanism === 'DEFAULT';
  const { value, setFieldValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { valid, errors } = useTextWidgetValidations(
    id,
    value,
    validations,
    serverErrors || [],
    validateFrom,
    validateWhen,
  );

  const yearFormat = 'yyyy';
  const { labelUppercase, omitValidationHints, required } = useWidgetUtils(
    schema,
    options,
    formContext,
  );

  const handleYearChange = (valueGiven) => {
    setFieldValue(valueGiven ? format(valueGiven, 'yyyy') : null);
  };

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, !valid);
  }, [valid, id]);

  const { translatedMessage } = useAdditionalInfo(id, {
    ...info,
    namespace: info?.namespace ?? formContext?.namespace,
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        views={['year']}
        openTo="year"
        label={
          <StyledFieldLabel
            label={labelUppercase}
            required={required}
            omitValidationHints={omitValidationHints}
          />
        }
        format={yearFormat}
        sx={styles.container}
        slotProps={{
          field: {
            clearable: true,
          },
          textField: {
            id,
            error: !valid,
            InputLabelProps: {
              shrink: false,
              className: 'date-widget-label',
            },
            slotProps: {
              input: {
                ...inputProps,
                variant: readonly ? 'standard' : 'outlined',
                autoComplete: 'off',
              },
              htmlInput: {
                ['data-testid']: id,
                'aria-label': labelUppercase,
                'aria-required': validations?.required,
                'aria-description': translatedMessage,
                tabIndex: 0,
                ...accessibilityErrorProps,
              },
            },
          },
        }}
        // Null is needed when there is no value in order for the DatePicker to display empty Date correctly
        // Also string needed for value, otherwise when value is number DatePicker does not display years correctly on edit view.
        value={value ? new Date(value, 0) : null}
        onChange={handleYearChange}
        disabled={disabled || readonly}
      />
      <ValidationErrors
        id={id}
        clientErrors={errors}
        serverErrors={serverErrors}
        diffs={diffs}
        dirty={dirty}
      />
    </LocalizationProvider>
  );
};

export default YearWidget;
