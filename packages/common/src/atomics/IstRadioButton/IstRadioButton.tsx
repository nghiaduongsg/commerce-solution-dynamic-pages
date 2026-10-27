import React, { useMemo } from 'react';
import {
  FormControl,
  Box,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IstRadioButtonProps } from './IstRadioButton.d';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';
import { useTranslation } from 'react-i18next';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';

const useStyles = () => {
  return {
    label: {
      marginRight: useTheme().spacing(2),
    },
    box: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    radioGroup: {
      flexDirection: 'row',
    },
  };
};

const IstRadioButton = ({
  id = '',
  label = '',
  value = '',
  readonly = false,
  required = false,
  disabled = false,
  onChange = () => void 0,
  options = [],
  errors = null,
  valid = false,
  showLabel = true,
  includeAllOption = true,
  additionalInfo,
  styledFieldLabel,
}: IstRadioButtonProps) => {
  const styles = useStyles();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const customOptions = useMemo(() => {
    if (includeAllOption) {
      return [
        { code: '', label: translate('allOption', { ns: COMMON, lng: selectedLanguage }) },
        ...options,
      ];
    }
    return [...options];
  }, [includeAllOption, options, selectedLanguage, translate]);

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, !valid);
  }, [valid, id]);

  const radioOptions = customOptions.map(({ code, label: optionLabel }) => (
    <FormControlLabel
      key={code}
      value={code}
      tabIndex={0}
      control={
        <Radio
          color="primary"
          slotProps={{
            input: {
              'aria-label': optionLabel,
              'aria-required': required,
              'aria-checked': code === value,
              role: 'radio',
              ...accessibilityErrorProps,
            },
          }}
        />
      }
      label={optionLabel}
    />
  ));

  return (
    <FormControl
      id={id}
      variant="outlined"
      required={required}
      disabled={disabled || readonly}
      error={!valid}
      component="fieldset"
    >
      <Box sx={styles.box} tabIndex={0}>
        {showLabel && (
          <FormLabel sx={styles.label} component="legend" id={`${id}-input-label`}>
            {styledFieldLabel}
          </FormLabel>
        )}
        <RadioGroup
          aria-labelledby={showLabel ? `${id}-input-label` : undefined}
          aria-label={!showLabel ? label : undefined}
          aria-description={additionalInfo}
          name={label ?? ''}
          tabIndex={-1}
          value={value}
          onChange={onChange}
          sx={styles.radioGroup}
        >
          {radioOptions}
        </RadioGroup>
      </Box>
      <FormHelperText>{errors}</FormHelperText>
    </FormControl>
  );
};

export default IstRadioButton;
