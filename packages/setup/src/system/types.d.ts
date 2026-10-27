import { AnyType } from '@pkg-common/types';
import { UserState } from '@pkg-setup/src/user/types';
import { MenuItem } from '@pkg-setup/src/menu/types';
import { UserSettingsState } from '@pkg-setup/src/userSettings/types';
import { CodeListState } from '@pkg-core/codeList/redux/types';

export type SystemState = {
  useEntityAccessGroups?: boolean;
  contextTokenHeader?: string;
  apiUrl: string;
  systemUsed: string;
  allSymbol: string;
  systemAssets: string;
  useStaticSchemas: boolean;
  useDefaultTranslations: boolean;
  applyPermissions: boolean;
  applySecObjectPermissions: boolean;
  primaryCurrency: { code: string };
  primaryLanguage: { code: string };
  retentionPeriod: number;
  selectedLanguage: string;
  camundaUrl: string;
  camunda7RuntimeUrl: string;
  camunda7HistoryUrl: string;
  authToken?: string;
  securableObjects: { [_: string]: boolean };
  codelists?: { lists: Array<string>; api: string };
  lastUpdate: number;
  sourceCurrencyMode?: 'Y' | 'N';
  hideInactive?: 'Y' | 'N';
  hideExpired?: 'Y' | 'N';
  isSignReversed?: boolean;
  themes?: Array<{ code: string; label: string }>;
  labelIndicatorSymbol?: string;
  labelIndicatorIcon?: string;
  labelIndicatorMode?: string;
  labelIndicatorColor?: string;
};

export type UseSystemType = {
  useStaticSchemas: boolean;
  useDefaultTranslations: boolean;
  applyPermissions: boolean;
  applySecObjectPermissions: boolean;
  apiUrl: string;
  allSymbol: string;
  application: string;
  getSystemAssets: string;
  primaryCurrency: {
    attributes?: AnyType;
    code: string;
  };
  primaryLanguage: {
    attributes?: AnyType;
    code: string;
  };
  retentionPeriod: number;
  selectedLanguage: string;
  selectedLocale: TLocale;
  lastUpdate: number;
  hideInactive?: 'Y' | 'N';
  hideExpired?: 'Y' | 'N';
  sourceCurrencyMode?: 'Y' | 'N';
  isSignReversed?: boolean;
  labelIndicatorMode?: string;
  labelIndicatorSymbol?: string;
  labelIndicatorIcon?: string;
  labelIndicatorColor?: string;
  themes?: Array<{ code: string; label: string }>;
  authToken?: string;
  securableObjects: { [_: string]: boolean };
  init: (
    payload: Partial<{
      System: Partial<SystemState>;
      LoggedInUser: UserState;
      Menu: Array<MenuItem>;
      UserSettings: UserSettingsState;
      CodeList: CodeListState;
    }>,
  ) => void;
  clear: () => void;
  update: (payload: Partial<SystemState>) => void;
};
