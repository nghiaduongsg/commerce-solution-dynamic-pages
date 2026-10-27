import { AnyType } from '@pkg-common/types';

export type UserSettingsState = {
  languages: {
    [key: string]: Array<{
      code: string;
      label: string;
    }>;
  };
  loading: boolean;
  themeMode: 'light' | 'dark';
  themeSource: 'remote' | 'system';
  themeName: string;
  themeType: 'LARGE' | 'SLIM';
  applyShortcuts: boolean;
  preferredLanguage: string;
  profileImage?: string;
  userLogo?: string;
  userHomeImage?: string;
  userPreferencesSavedLanguage?: string;
  theme?: {
    palette: AnyType;
    config?: AnyType;
  };
  filters?: Array<SettingsFilters>;
  depositRegister?: UserRegister | null;
  tenderRegister?: UserRegister | null;
};

export type UserRegister = {
  id: string;
  identificationLabel: string;
};

export type FilterGroup = {
  groupId: string;
  criteria: any;
  updatedAt: string;
};

export type SettingsFilters = {
  tableId: string;
  groups: FilterGroup[];
  latest: string;
};
