import { HIGHLIGHT_OPTIONAL } from '@pkg-constants/codeListVariables';
import { SystemState } from './types';
import { el, enUS, lt } from 'date-fns/locale';

const locales = {
  EL: el,
  LT: lt,
  EN: enUS,
};

export const selectUseStaticSchemas = (state: { System: SystemState }) =>
  state.System.useStaticSchemas;
export const selectUseDefaultTranslations = (state: { System: SystemState }) =>
  state.System.useDefaultTranslations;
export const selectApiUrl = (state: { System: SystemState }) => state.System.apiUrl;
export const selectAllSymbol = (state: { System: SystemState }) => state.System.allSymbol;
export const selectApplication = (state: { System: SystemState }) => state.System.systemUsed;
export const selectSystemAssets = (state: { System: SystemState }) => state.System.systemAssets;
export const selectPrimaryCurrency = (state: { System: SystemState }) =>
  state.System.primaryCurrency;
export const selectPrimaryLanguage = (state: { System: SystemState }) =>
  state.System.primaryLanguage;
export const selectSourceCurrencyMode = (state: { System: SystemState }) =>
  state.System.sourceCurrencyMode;
export const selectHideInactive = (state: { System: SystemState }) => state.System.hideInactive;
export const selectHideExpired = (state: { System: SystemState }) => state.System.hideExpired;
export const selectRetentionPeriod = (state: { System: SystemState }) =>
  state.System.retentionPeriod;
export const selectIsSignReversed = (state: { System: SystemState }) => state.System.isSignReversed;
export const selectLanguage = (state: { System: SystemState }) => state.System.selectedLanguage;
export const selectLocale = (state: { System: SystemState }) => {
  const lng = state.System.selectedLanguage;
  return locales[lng];
};
export const selectAuthToken = (state: { System: SystemState }) => state.System.authToken;
export const selectApplyPermissions = (state: { System: SystemState }) =>
  state.System.applyPermissions;
export const selectApplySecObjectPermissions = (state: { System: SystemState }) =>
  state.System.applySecObjectPermissions;
export const selectLastUpdate = (state: { System: SystemState }) => state.System.lastUpdate;
export const selectSecurableObjects = (state: { System: SystemState }) =>
  state.System.securableObjects;
export const selectLabelIndicatorSymbol = (state: { System: SystemState }) =>
  state.System.labelIndicatorSymbol;
export const selectLabelIndicatorIcon = (state: { System: SystemState }) =>
  state.System.labelIndicatorIcon;
export const selectLabelIndicatorMode = (state: { System: SystemState }) =>
  state.System.labelIndicatorMode || HIGHLIGHT_OPTIONAL;
export const selectLabelIndicatorColor = (state: { System: SystemState }) =>
  state.System.labelIndicatorColor;
