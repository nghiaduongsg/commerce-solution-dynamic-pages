import React, { useCallback } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { FormWidgetProps } from '@pkg-form/types';
import { DarkMode, LightMode } from '@mui/icons-material';
import useFormField from '@pkg-entity/hooks/useFormField';

const ThemeModeWidget = ({ id, value: innerValue, onChange, formContext }: FormWidgetProps) => {
  const { mechanism } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';
  const { value, setFieldValue } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const onChangeTheme = useCallback(() => {
    setFieldValue(value === 'light' ? 'dark' : 'light');
  }, [value]);

  return (
    <Tooltip title={`Switch to ${value === 'light' ? 'dark' : 'light'} mode`} arrow role="tooltip">
      <IconButton onClick={onChangeTheme} color="inherit">
        {value === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeModeWidget;
