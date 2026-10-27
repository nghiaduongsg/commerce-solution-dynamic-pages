import React, { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from 'i18next';
import ErrorLayout from '@pkg-common/components/ErrorLayout/ErrorLayout';
import LoadingBackdrop from '@pkg-common/components/LoadingBackdrop/LoadingBackdrop';
import useAuth from '@pkg-setup/src/auth/useAuth';
import useSystem from '@pkg-setup/src/system/useSystem';
import { SystemState } from '@pkg-setup/src/system/types';
import { UserState, PartyRoleState } from '@pkg-setup/src/user/types';
import { MenuItem } from '@pkg-setup/src/menu/types';
import { UserSettingsState } from '@pkg-setup/src/userSettings/types';
import { CodeListState } from '@pkg-core/codeList/redux/types';
import { SnackbarProvider } from 'notistack';
import { DynamicThemeProvider } from '@pkg-theme/index';
import SnackMessage from '@pkg-common/components/Notifier/SnackMessage';
import { useUser, usePartyRole } from '@pkg-setup/index';
import {
  getBaseCodelists,
  getUserPreferences,
  getRevenueTypes,
  getCurrentAccount,
  getPartyRoleDetails,
  getMenu,
  getLanguages,
  getSecurableObjects,
} from '../api/utils';
import {
  InitialSlicesType,
  Idle,
  Finished,
  Loading,
  ServerError,
  UserPreferences,
  User,
  Language,
} from '../redux/types.d';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import FormManagerProvider from '@pkg-form/FormManagerProvider';
import { AnyType } from '@pkg-common/types';
import { Theme } from '@mui/material/styles';

const AppProvider = ({
  children,
  systemUsed = '',
  rootId = 'root',
  selfService = false,
  ErrorImage,
  themeProps,
  themes = [],
  defaultTheme,
}: {
  children: React.ReactNode;
  systemUsed?: string;
  selfService?: boolean;
  rootId?: string;
  ErrorImage: string;
  themeProps: {
    LARGE: AnyType;
    SLIM: AnyType;
  };
  themes?: Array<{ code: string; label: string; theme: () => Theme }>;
  defaultTheme?: () => Theme;
}) => {
  const { initialized, user, claims } = useAuth();
  const { partyRoleId } = useUser();
  const { setSelectedPartyRole } = usePartyRole();
  const { init, apiUrl, primaryLanguage } = useSystem();
  const isSelfService = selfService;

  const htmlElement = document.getElementById(rootId);

  const themeNames = useMemo(() => {
    return themes?.map((theme) => ({ label: theme.label, code: theme.code }));
  }, [themes]);

  const themeConfigs = useMemo(() => {
    const configurations = {};
    themes?.map((theme) => {
      configurations[theme.code] = theme.theme;
    });
    return configurations;
  }, [themes]);

  const [userProfileError, setUserProfileError] = useState<unknown>(null);

  const [callStatuses, setCallStatuses] = useState<InitialSlicesType>({
    securableObjects: Idle,
    userPreferences: Idle,
    baseCodelists: Idle,
    language: Idle,
    menu: Idle,
    user: Idle,
    partyRoleDetails: Idle,
    currentAccount: Idle,
    revenueTypes: Idle,
  });

  const [systemData, setSystemData] = useState<
    Partial<{
      System: Partial<SystemState>;
      LoggedInUser: UserState;
      LoggedInPartyRole: PartyRoleState;
      Menu: Array<MenuItem>;
      UserSettings: UserSettingsState;
      CodeList: CodeListState;
    }>
  >({
    System: {
      apiUrl: window['REACT_APP_API_URL'],
      camundaUrl: window['REACT_APP_CAMUNDA_URL'],
      camunda7RuntimeUrl: window['REACT_APP_CAMUNDA7_ENGINE_RUNTIME_URL'],
      camunda7HistoryUrl: window['REACT_APP_CAMUNDA7_ENGINE_HISTORY_URL'],
      systemUsed,
      systemAssets: 'getExternalAssets',
      useStaticSchemas: window['STATIC_SCHEMAS'],
      useDefaultTranslations: window['DEFAULT_TRANSLATIONS'],
      applyPermissions: window['APPLY_PERMISSIONS'],
      applySecObjectPermissions: window['REACT_APP_APPLY_SEC_OBJECT_PERMISSIONS'] === 'true',
      allSymbol: '*',
      themes: themeNames,
    },
  });

  const onSuccess = useCallback((response, apiId) => {
    setSystemData((prev) => ({
      System: { ...prev?.System, ...response?.System },
      LoggedInUser: { ...prev?.LoggedInUser, ...response?.LoggedInUser },
      LoggedInPartyRole: { ...prev?.LoggedInPartyRole, ...response?.LoggedInPartyRole },
      CodeList: { ...prev?.CodeList, ...response?.CodeList },
      UserSettings: { ...prev?.UserSettings, ...response?.UserSettings },
      Menu: response.Menu ? response.Menu : prev.Menu ? [...prev.Menu] : [],
    }));
    setCallStatuses((prev) => ({ ...prev, [apiId]: Finished }));
  }, []);

  const onLoading = useCallback((apiId) => {
    setCallStatuses((prev) => ({ ...prev, [apiId]: Loading }));
  }, []);

  const onError = useCallback((apiId) => {
    setCallStatuses((prev) => ({ ...prev, [apiId]: ServerError }));
  }, []);

  const onUserPreferencesSuccess = useCallback(
    (response) => {
      const handleLanguagesSuccess = (payload) => {
        const language = response?.preferredLanguage || primaryLanguage?.code || 'EN';
        i18n.services.resourceStore.data = {};
        i18n.language = language;
        htmlElement?.setAttribute('lang', language.toLowerCase());

        onSuccess(payload, Language);

        // After having established language fetch base codelists and menu items
        getBaseCodelists(onLoading, onSuccess, onError);
        getMenu(onLoading, onSuccess, onError, systemUsed);
      };

      const language = response?.preferredLanguage || primaryLanguage?.code || 'EN';

      onSuccess(
        {
          UserSettings: { ...response },
          System: { selectedLanguage: language },
        },
        UserPreferences,
      );

      getLanguages(onLoading, handleLanguagesSuccess, onError);
    },
    [primaryLanguage?.code, systemUsed],
  );

  useEffect(() => {
    if (initialized && user && !partyRoleId) {
      try {
        const resolvedPartyRoleId =
          claims?.partyRoleId ?? claims?.userAccount?.account?.partyRoleId;
        const userId = claims?.userAccount?.user?.partyRoleId;
        const isAdminUser = claims?.userAccount?.user?.admin;
        const allowedServices = claims?.userAccount?.allowedServiceCodes;
        const profile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        };

        getSecurableObjects(userId || resolvedPartyRoleId, onLoading, onSuccess, onError);
        getUserPreferences(
          userId || resolvedPartyRoleId,
          systemUsed,
          onLoading,
          onUserPreferencesSuccess,
          onError,
        );

        if (isSelfService) {
          getCurrentAccount(onLoading, onSuccess, onError);
          if (userId) {
            getRevenueTypes(onLoading, onSuccess, onError);
          }
        }

        onSuccess(
          {
            LoggedInUser: {
              user: {
                ...profile,
                partyRoleId: resolvedPartyRoleId,
                userId,
                isAdminUser,
                allowedServices,
              },
            },
            System: {
              user: { ...profile, partyRoleId: resolvedPartyRoleId, userId, allowedServices },
            },
          },
          User,
        );
      } catch (error) {
        console.log(error);
        setUserProfileError(error || true);
      }
    }
  }, [initialized, user, claims, partyRoleId]);

  useEffect(() => {
    if (isSelfService) {
      setSelectedPartyRole({ partyRoleId: partyRoleId });
      partyRoleId && getPartyRoleDetails(partyRoleId, onLoading, onSuccess, onError);
    }
  }, [partyRoleId, isSelfService]);

  useEffect(() => {
    if (
      Object.values(callStatuses)?.filter((status) => status !== Loading).length ===
        Object.values(callStatuses).length &&
      callStatuses.user === Finished
    ) {
      init(systemData);
    }
  }, [systemData, callStatuses]);

  if (!initialized || !apiUrl) {
    return <LoadingBackdrop open={true} />;
  }

  if (userProfileError) {
    return <ErrorLayout image={ErrorImage} message="profileLoadFailed"></ErrorLayout>;
  }

  return (
    <DynamicThemeProvider themeProps={themeProps} theme={themeConfigs} defaultTheme={defaultTheme}>
      <SnackbarProvider
        maxSnack={10}
        preventDuplicate
        content={(key: string | number, message?: string | React.ReactNode) => (
          <SnackMessage id={key as string} message={(message ?? '') as string} />
        )}
      >
        <ValidationsProvider>
          <FormManagerProvider>{children}</FormManagerProvider>
        </ValidationsProvider>
      </SnackbarProvider>
    </DynamicThemeProvider>
  );
};

export default AppProvider;
