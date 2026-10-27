import { useCallback, useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  selectApiData,
  selectApiDataLoading,
  selectApiErrorMessage,
  selectApiFinished,
  selectApiHasError,
  selectApiRefreshId,
} from '@pkg-core/apiData/redux/selectors';
import { CallApi, ClearApiData } from '@pkg-core/apiData/redux/reducers';
import { ApiValuesSchema, AnyType } from '@pkg-common/types';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import useButtonPress from '@pkg-common/button/useButtonPress';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useLocation, useNavigate } from 'react-router';
import { NAVIGATION_STATE_KEY } from '@pkg-constants/formCommon';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { constructDataToSend } from '@pkg-core/initialization/api/utils';

const useCallApiData = (
  id: string,
  _pageId: string,
  apiValues?: ApiValuesSchema,
  widgetId = id,
  source?: AnyType,
  notify?,
  onSuccessCallback?,
  onSuccessRedirect?,
  avoidClearApiData = false,
  parentId?: string,
) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname: locationPathname } = useLocation();

  const response = useSelector(selectApiData(id));
  const loading = useSelector(selectApiDataLoading(id), shallowEqual);
  const hasError = useSelector(selectApiHasError(id), shallowEqual);
  const errorMessage = useSelector(selectApiErrorMessage(id), shallowEqual);
  const refreshId = useSelector(selectApiRefreshId(id), shallowEqual);
  const callApi = useCallback((payload) => dispatch(CallApi(payload)), [dispatch]);
  const clearApiData = useCallback(() => dispatch(ClearApiData({ id })), [dispatch, id]);
  const finished = useSelector(selectApiFinished(id), shallowEqual);

  const myWindow: AnyType = window;
  const transformDataForServer = myWindow['transformDataForServer'];

  const { dataFrom, applyOnUrlChange = false, wrapToProperty } = apiValues || {};

  const { url, method, data, queryParams, dataValuesReady } = useDynamicApi(
    widgetId,
    apiValues,
    source,
  );
  const { url: redirectUrl, data: redirectDataFrom } = useDynamicApi(
    widgetId,
    onSuccessRedirect,
    source,
  );

  const { enqueueSnackbar } = useNotifiers();
  const { markButtonPress } = useButtonPress(apiValues?.resourceId || '');

  const isListPage = useMemo(() => {
    const path = locationPathname?.split('?')[0]?.replace(/\/$/, '');
    return path?.endsWith('/list');
  }, [locationPathname]);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);
  const shouldCallApi = useMemo(() => {
    if (applyOnUrlChange) {
      // TODO: Return the value from useShouldCallApi.
      return true;
    }
    const shouldLoad = url && !loading && !response && !hasError && urlHasAllParams(url);

    if (dataFrom) {
      return shouldLoad && dataValuesReady;
    }
    return shouldLoad;
  }, [url, loading, response, hasError, dataFrom, dataValuesReady, applyOnUrlChange]);

  useEffect(() => {
    if (hasError) {
      if (notify?.error) {
        enqueueSnackbar({
          key: new Date().getTime(),
          message: translate(notify?.error || errorMessage, {
            defaultValue: 'Something went wrong',
            ns: COMMON,
            lng: selectedLanguage,
          }),
          namespace: COMMON,
          severity: 'error',
        });
      }

      clearApiData();
    }
  }, [hasError, errorMessage, notify, selectedLanguage]);

  useEffect(() => {
    if (refreshId && !hasError && !loading && finished) {
      if (apiValues?.resourceId) {
        markButtonPress();
      }

      if (response?.violationsData?.length && !notify?.successWithViolations) {
        response?.violationsData
          .filter((violation) => !violation.fieldName || violation.fieldName === '[]')
          .forEach((violation, index) =>
            enqueueSnackbar({
              key: `${new Date().getTime().toString()}_${index}`,
              // TODO: messageKey is only for Form Apis and must be unified
              message: violation.message || violation['messageKey'],
              severity: 'error',
            }),
          );
      } else {
        enqueueSnackbar({
          key: new Date().getTime(),
          message: translate(
            response?.violationsData?.length ? notify?.successWithViolations : notify?.success,
            {
              defaultValue: 'Success',
              ns: COMMON,
              lng: selectedLanguage,
            },
          ),
          namespace: COMMON,
          severity: 'dark',
        });
        if (redirectDataFrom && redirectUrl) {
          try {
            localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(redirectDataFrom || {}));
            navigate(redirectUrl, { state: redirectDataFrom });
          } catch {}
        } else if (redirectUrl && onSuccessRedirect) {
          navigate(redirectUrl);
        }
      }

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      if (!avoidClearApiData) {
        clearApiData();
      }
    }
  }, [refreshId, hasError, loading, finished, selectedLanguage]);

  return useCallback(
    (pageIdentifier, dataToPost = {}, uiSchema = {}) => {
      if (shouldCallApi) {
        const finalData = isListPage
          ? data
          : transformDataForServer(pageIdentifier, { ...(data || {}), ...dataToPost });
        callApi({
          id,
          pageId: pageIdentifier,
          url,
          method,
          data: constructDataToSend(finalData, wrapToProperty, uiSchema),
          queryParams,
          wrapToProperty: wrapToProperty,
          metadata: { ...apiValues, parentId },
        });
      }
    },
    [shouldCallApi, id, url, method, data, queryParams, isListPage],
  );
};

export default useCallApiData;
