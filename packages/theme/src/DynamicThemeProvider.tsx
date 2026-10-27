import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';
import DefaultTheme from './DefaultTheme';
import { alpha, createTheme } from '@mui/material';
import { deepmerge } from '@mui/utils';

const externalTheme = window['getTheme'];
const DynamicThemeProvider = ({ children, themeProps, theme, defaultTheme }) => {
  const { themeMode, themeName, themeType, themeSource, theme: themeOverrides } = useUserSettings();

  const finalConfig = useMemo(() => {
    const configOverrides = themeOverrides?.config || {};
    return themeType === 'SLIM'
      ? { ...(themeProps.SLIM || {}), ...configOverrides }
      : { ...(themeProps.LARGE || {}), ...configOverrides };
  }, [themeOverrides?.config, themeType, themeProps]);

  const fallbackDefaultTheme = useMemo(() => {
    return DefaultTheme(finalConfig, themeOverrides?.palette, themeMode);
  }, [themeType, finalConfig, themeOverrides?.palette, themeMode]);

  const finalDefaultTheme = useMemo(() => {
    return defaultTheme ? defaultTheme(finalConfig, themeOverrides?.palette, themeMode) : undefined;
  }, [themeType, finalConfig, themeOverrides?.palette, themeMode, defaultTheme]);

  if (externalTheme && themeSource === 'remote') {
    let finalTheme = fallbackDefaultTheme;
    try {
      finalTheme = externalTheme(
        deepmerge,
        createTheme,
        alpha,
        finalConfig,
        themeOverrides?.palette,
        themeMode,
      );
    } catch {}
    return <ThemeProvider theme={finalTheme}>{children}</ThemeProvider>;
  }

  if (!themeName || !theme || (theme && !theme[themeName])) {
    return (
      <ThemeProvider theme={finalDefaultTheme ?? fallbackDefaultTheme}>{children}</ThemeProvider>
    );
  }

  let finalTheme = fallbackDefaultTheme;
  try {
    finalTheme = theme[themeName](finalConfig, themeOverrides?.palette, themeMode);
  } catch {}

  return <ThemeProvider theme={finalDefaultTheme ?? finalTheme}>{children}</ThemeProvider>;
};

export default DynamicThemeProvider;
