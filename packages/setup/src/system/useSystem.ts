import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Init, Update } from './reducers';
import {
  selectApiUrl,
  selectAllSymbol,
  selectApplication,
  selectSystemAssets,
  selectApplyPermissions,
  selectUseStaticSchemas,
  selectUseDefaultTranslations,
  selectPrimaryCurrency,
  selectLanguage,
  selectAuthToken,
  selectLastUpdate,
  selectSecurableObjects,
  selectRetentionPeriod,
  selectSourceCurrencyMode,
  selectIsSignReversed,
  selectPrimaryLanguage,
  selectHideInactive,
  selectHideExpired,
  selectLocale,
  selectApplySecObjectPermissions,
  selectLabelIndicatorSymbol,
  selectLabelIndicatorIcon,
  selectLabelIndicatorMode,
  selectLabelIndicatorColor,
} from './selectors';
import { UseSystemType } from './types';
import { LoadCodeLists } from '@pkg-core/codeList/redux/reducers';

export const SYSTEM_CLEAR = '@SYSTEM/CLEAR';

const Clear = () => ({
  type: SYSTEM_CLEAR,
});

const useSystem = (): UseSystemType => {
  const dispatch = useDispatch();

  return {
    apiUrl: useSelector(selectApiUrl),
    allSymbol: useSelector(selectAllSymbol),
    application: useSelector(selectApplication),
    getSystemAssets: useSelector(selectSystemAssets),
    applyPermissions: useSelector(selectApplyPermissions),
    applySecObjectPermissions: useSelector(selectApplySecObjectPermissions),
    useStaticSchemas: useSelector(selectUseStaticSchemas),
    useDefaultTranslations: useSelector(selectUseDefaultTranslations),
    primaryCurrency: useSelector(selectPrimaryCurrency),
    hideInactive: useSelector(selectHideInactive),
    hideExpired: useSelector(selectHideExpired),
    primaryLanguage: useSelector(selectPrimaryLanguage),
    sourceCurrencyMode: useSelector(selectSourceCurrencyMode),
    retentionPeriod: useSelector(selectRetentionPeriod),
    isSignReversed: useSelector(selectIsSignReversed),
    selectedLanguage: useSelector(selectLanguage, shallowEqual),
    selectedLocale: useSelector(selectLocale, shallowEqual),
    authToken: useSelector(selectAuthToken),
    lastUpdate: useSelector(selectLastUpdate),
    securableObjects: useSelector(selectSecurableObjects),
    labelIndicatorMode: useSelector(selectLabelIndicatorMode),
    labelIndicatorSymbol: useSelector(selectLabelIndicatorSymbol),
    labelIndicatorIcon: useSelector(selectLabelIndicatorIcon),
    labelIndicatorColor: useSelector(selectLabelIndicatorColor),

    init: useCallback(
      (payload: any) => {
        dispatch(Init(payload));
      },
      [dispatch],
    ),
    clear: useCallback(() => dispatch(Clear()), [dispatch]),
    update: useCallback(
      (payload) => {
        dispatch(Update(payload));
        if (payload?.codelists) {
          dispatch(LoadCodeLists(payload?.codelists));
        }
      },
      [dispatch],
    ),
  };
};

export default useSystem;
