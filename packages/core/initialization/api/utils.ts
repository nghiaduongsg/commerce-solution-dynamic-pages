import axios from 'axios';

const API_URL = window['REACT_APP_API_URL'];

import { dataToStore, sortByLabelOrCode } from '@pkg-core/codeList/redux/reducers';
import {
  BOOLEAN_CODELIST_ATTRIBUTES,
  CURRENCIES,
  DAYS_RETENTION_PERIOD_READ_NOTIFICATION,
  HIDE_EXPIRED_ITEMS,
  HIDE_INACTIVE_ITEMS,
  LANGUAGES,
  REVERSE_SIGN,
  SOURCE_CURRENCY_MODE,
  SYSTEM_PARAMETERS,
  VALIDATIONS_INDICATOR,
} from '@pkg-constants/codeListVariables';
import {
  BaseCodelists,
  UserPreferences,
  RevenueTypes,
  CurrentAccount,
  PartyRoleDetails,
  Menu,
  SecurableObjects,
  Language,
} from '../redux/types.d';
import { wrapEntityDataArea } from '@pkg-entity/utils/utils';
import { AnyType, CodeListItem } from '@pkg-common/types';

const getSystemParameter = (
  parameters: Array<CodeListItem>,
  parameter: string,
): CodeListItem | undefined => {
  return parameters?.find((item) => item.code === parameter);
};

const getParameter = (
  item: CodeListItem | undefined,
  attributeName: string,
  defaultValue: AnyType,
) => {
  return (
    item?.attributes?.find((attribute) => attribute.key === attributeName)?.value || defaultValue
  );
};

export const getBaseCodelists = (onLoading, onSuccess, onError) => {
  onLoading(BaseCodelists);
  return axios
    .get(
      `${API_URL}/reference-data/codelists?codeListCodes=CURRENCIES&codeListCodes=SYSTEM_PARAMETERS&codeListCodes=ENTITIES&codeListCodes=FORM_TYPE_CATEGORIES`,
    )
    .then((response) => {
      const lists = response?.data || [];

      const codelists = {};
      lists?.forEach((list) => {
        codelists[list.code] = sortByLabelOrCode(dataToStore({}, list?.items || []));
      });
      const currencies = lists?.find((l) => l.code === CURRENCIES)?.items;
      const systemParameters = lists?.find((l) => l.code === SYSTEM_PARAMETERS)?.items;

      const hideExpiredParameter = getSystemParameter(systemParameters, HIDE_EXPIRED_ITEMS);
      const hideInactiveParameter = getSystemParameter(systemParameters, HIDE_INACTIVE_ITEMS);

      const sourceCurrency = getSystemParameter(systemParameters, SOURCE_CURRENCY_MODE);
      const reverseSign = getSystemParameter(systemParameters, REVERSE_SIGN);

      const retentionPeriod = getSystemParameter(
        systemParameters,
        DAYS_RETENTION_PERIOD_READ_NOTIFICATION,
      );
      const labelIndicator = getSystemParameter(systemParameters, VALIDATIONS_INDICATOR);

      const hideExpired = getParameter(hideExpiredParameter, 'id', 'N');
      const hideInactive = getParameter(hideInactiveParameter, 'id', 'N');
      const sourceCurrencyMode = getParameter(sourceCurrency, 'id', 'N');
      const retentionPeriodValue = getParameter(retentionPeriod, 'id', 1);
      const reverseSignMode = getParameter(reverseSign, 'id', 'N');
      const labelIndicatorMode = getParameter(labelIndicator, 'mode', '');
      const labelIndicatorSymbol = getParameter(labelIndicator, 'symbol', '');
      const labelIndicatorIcon = getParameter(labelIndicator, 'icon', '');
      const labelIndicatorColor = getParameter(labelIndicator, 'color', '');

      const primaryCurrency = currencies?.find((item) => {
        const attributes = item?.attributes || [];
        const attribute = attributes?.find(
          (attr) => attr.key === 'primary' && attr.value === BOOLEAN_CODELIST_ATTRIBUTES.YES,
        );
        return !!attribute;
      });

      onSuccess(
        {
          CodeList: codelists,
          System: {
            hideExpired,
            hideInactive,
            sourceCurrencyMode,
            primaryCurrency,
            retentionPeriod: retentionPeriodValue,
            isSignReversed: reverseSignMode === 'Y',
            labelIndicatorMode,
            labelIndicatorSymbol,
            labelIndicatorIcon,
            labelIndicatorColor,
          },
        },
        BaseCodelists,
      );
    })
    .catch((e) => {
      onError(BaseCodelists);
      console.log(e);
    });
};

export const getLanguages = (onLoading, onSuccess, onError) => {
  onLoading(Language);
  return axios
    .get(`${API_URL}/reference-data/codelists?codeListCodes=LANGUAGES`)
    .then((response) => {
      const lists = response?.data || [];
      const codelists = {};
      lists?.forEach((list) => {
        codelists[list.code] = sortByLabelOrCode(dataToStore({}, list?.items || []));
      });
      const languages = lists?.find((l) => l.code === LANGUAGES)?.items;

      const primaryLanguage = languages?.find((item) => {
        const attributes = item.attributes || [];
        const attribute = attributes.find(
          (attr) => attr.key === 'primary' && attr.value === BOOLEAN_CODELIST_ATTRIBUTES.YES,
        );
        return !!attribute;
      });

      onSuccess(
        {
          CodeList: codelists,
          System: {
            primaryLanguage,
          },
        },
        Language,
      );
    })
    .catch((e) => {
      onError(Language);
      console.log(e);
    });
};

export const getUserPreferences = (userId, application, onLoading, onSuccess, onError) => {
  const isISS = application === 'ISS';
  const url = isISS
    ? `${API_URL}/ss-registry/portal-users/${userId}`
    : `${API_URL}/registration/users/search`;

  const config = isISS
    ? { method: 'GET', url }
    : {
        method: 'POST',
        url,
        data: { ids: [userId], partyRoleTypeCode: 'SOTAXUSER' },
      };
  onLoading(UserPreferences);

  return axios
    .request(config)
    .then((response) => {
      const data = response?.data;

      if (application === 'IRM') {
        const preferencesStr = data?.content[0]?.dataArea;
        onSuccess({ ...JSON.parse(preferencesStr) });
      } else if (application === 'ISS') {
        const preferencesStr = data?.dataArea;
        onSuccess({ ...JSON.parse(preferencesStr) });
      } else {
        onSuccess({});
      }
    })
    .catch((_) => {
      onError(UserPreferences);
    });
};

export const getRevenueTypes = (onLoading, onSuccess, onError) => {
  onLoading(RevenueTypes);
  return axios
    .post(`${API_URL}/iss-service-management/operations/execute-paginated`, {
      operation: 'getAllowedRevenueTypeCodes',
      revenueTypeCodes: [],
      parameters: {},
    })
    .then((response) => {
      const content = response.data?.content || [];
      const revenueTypes = content.map((item) => item?.revenue_type_cd);
      onSuccess(
        {
          LoggedInPartyRole: { revenueTypes: revenueTypes, fetchedRevenueTypes: true },
        },
        RevenueTypes,
      );
    })
    .catch((e) => {
      console.error('Error fetching revenue types:', e);
      onError(RevenueTypes);
    });
};

export const getCurrentAccount = (onLoading, onSuccess, onError) => {
  onLoading(CurrentAccount);
  return axios
    .get(`${API_URL}/ss-registry/default-accounts/currentUser`)
    .then((response) => {
      const currentUserData = response.data;
      onSuccess({ LoggedInPartyRole: { ...currentUserData } }, CurrentAccount);
    })
    .catch((e) => {
      console.error('Error fetching current account:', e);
      onError(CurrentAccount);
    });
};

export const getPartyRoleDetails = (_, onLoading, onSuccess, onError) => {
  onLoading(PartyRoleDetails);
  return axios
    .post(`${API_URL}/iss-service-management/operations/execute-simple`, {
      operation: 'getPartyRoleIdentification',
      revenueTypeCodes: [],
      parameters: {},
    })
    .then((response) => {
      const content = response.data?.content || [];
      const partyRoleId = content[0].id;
      const partyId = content[0].partyId;
      const identificationLabel = content[0].identificationLabel;
      const partyIdentificationLabel = content[0].partyIdentificationLabel;
      onSuccess(
        {
          LoggedInPartyRole: {
            partyRoleDetails: {
              partyRoleId: partyRoleId,
              partyId: partyId,
              identificationLabel: identificationLabel,
              partyIdentificationLabel: partyIdentificationLabel,
            },
          },
        },
        PartyRoleDetails,
      );
    })
    .catch((e) => {
      console.error('Error fetching party role details:', e);
      onError(PartyRoleDetails);
    });
};

export const getMenu = (onLoading, onSuccess, onError, application) => {
  onLoading(Menu);
  return axios
    .get(
      `${API_URL}/ui-configuration/menus/tree?menuTypeCL=${application === 'ISS' ? 'ISS_INTERNAL' : 'INTERNAL'}`,
    )
    .then((response) => {
      onSuccess(
        {
          Menu: response.data,
        },
        Menu,
      );
    })
    .catch((e) => {
      onError(Menu);
      console.log(e);
    });
};

export const getSecurableObjects = (userId, onLoading, onSuccess, onError) => {
  onLoading(SecurableObjects);
  return axios
    .get(`${API_URL}/authorization-management/user-roles/${userId}/securable-objects`)
    .then((response) => {
      onSuccess(
        {
          LoggedInUser: { securableObjects: response?.data },
          System: { securableObjects: response?.data },
        },
        SecurableObjects,
      );
    })
    .catch((e) => {
      onError(SecurableObjects);
      console.log(e);
    });
};

export const constructDataToSend = (
  data = {},
  wrapToProperty,
  uiSchema,
  removeWrappingIfEmpty = false,
) => {
  const customFieldsKey = uiSchema['ui:page']?.customFieldsKey;
  if (!customFieldsKey) {
    return data;
  }
  if (!wrapToProperty) {
    return normaliseDataToSend(
      wrapEntityDataArea(data, customFieldsKey, uiSchema),
      customFieldsKey,
      removeWrappingIfEmpty,
    );
  } else {
    return {
      ...data,
      [wrapToProperty]: normaliseDataToSend(
        wrapEntityDataArea(data[wrapToProperty], customFieldsKey, uiSchema),
        customFieldsKey,
        removeWrappingIfEmpty,
      ),
    };
  }
};

const normaliseDataToSend = (
  data: AnyType,
  customFieldsKey: string,
  removeWrappingIfEmpty = false,
) => {
  if (!removeWrappingIfEmpty) {
    return data;
  }
  try {
    const wrappedProperties = data?.[customFieldsKey]?.replace(/\s/g, '');
    return wrappedProperties === '{}' ? { ...data, [customFieldsKey]: undefined } : data;
  } catch {
    return data;
  }
};
