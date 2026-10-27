import React, { useCallback, useEffect, useState } from 'react';

import axios from 'axios';
import useSystem from '@pkg-setup/src/system/useSystem';
import {
  UPDATE_ACTION_ID,
  USER_ACCESS_PERMISSIONS_RESOURCE_ID,
  VIEW_ACTION_ID,
} from '@pkg-constants/formCommon';
import ErrorLayout from '@pkg-common/components/ErrorLayout/ErrorLayout';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import LoadingBackdrop from '@pkg-common/components/LoadingBackdrop/LoadingBackdrop';
import { isActionAllowed } from '@pkg-common/utils/utils';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';
import { usePermissions } from '@pkg-setup/index';
import { useSelector } from 'react-redux';

const getAccess = (
  apiUrl: string,
  entityCL: string,
  entityId: string,
  allSymbol: string,
  onSuccess,
  onError,
) => {
  return axios
    .get(
      `${apiUrl}/authorization-management/user-access-groups/operations-with-access?entityCL=${entityCL}&entityId=${entityId}`,
    )
    .then((response) => {
      const codes = response?.data.map((data) => data.code);
      onSuccess(codes);

      const isViewAllowed = isActionAllowed(VIEW_ACTION_ID, codes, allSymbol);
      const isUpdateAllowed = isActionAllowed(UPDATE_ACTION_ID, codes, allSymbol);
      return {
        [VIEW_ACTION_ID]: isViewAllowed,
        [UPDATE_ACTION_ID]: isUpdateAllowed,
      };
    })
    .catch((e) => {
      onError();
      console.log(e);
    });
};

const AccessController = ({
  pageId,
  idKey,
  children,
  ForbiddenImage,
  ServerErrorImage,
  permissionKey,
}) => {
  const { allSymbol, apiUrl, selectedLanguage } = useSystem();
  const { language } = useUserSettings();
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewAllowed, setViewAllowed] = useState<boolean>(false);
  const isPermissionAllowed = usePermissions(permissionKey);
  // Some backends authorize directly at resource endpoints and have no entity
  // access-group service. Page operation permissions still apply in that mode.
  const useEntityAccessGroups = useSelector(
    (state: { System: { useEntityAccessGroups?: boolean } }) =>
      state.System.useEntityAccessGroups !== false,
  );
  const { setApiData } = useApiDataState(USER_ACCESS_PERMISSIONS_RESOURCE_ID);
  const onSuccess = useCallback(
    (codes: Array<string>) => {
      setLoading(false);
      setApiData({
        id: USER_ACCESS_PERMISSIONS_RESOURCE_ID,
        data: codes,
      });
    },
    [setLoading, setApiData],
  );

  const onError = useCallback(() => {
    setLoading(false);
    setHasError(true);
  }, [setLoading]);

  useEffect(() => {
    if (!useEntityAccessGroups) {
      setLoading(false);
      setViewAllowed(true);
      setApiData({ id: USER_ACCESS_PERMISSIONS_RESOURCE_ID, data: [allSymbol] });
      return;
    }
    if (pageId && idKey && apiUrl) {
      getAccess(apiUrl, pageId, idKey, allSymbol, onSuccess, onError).then((response) => {
        if (response && response[VIEW_ACTION_ID]) {
          setViewAllowed(!!response[VIEW_ACTION_ID]);
        }
      });
    }
    if (pageId && !idKey) {
      setViewAllowed(true);
      setLoading(false);
      setTimeout(() => {
        setApiData({
          id: USER_ACCESS_PERMISSIONS_RESOURCE_ID,
          data: [allSymbol],
        });
      }, 0);
    }
  }, [pageId, idKey, allSymbol, apiUrl, selectedLanguage, language, useEntityAccessGroups]);

  if (loading) {
    return <LoadingBackdrop />;
  }

  if (hasError) {
    return <ErrorLayout image={ServerErrorImage} message="serverError" />;
  }

  if (!viewAllowed || !isPermissionAllowed) {
    return <ErrorLayout image={ForbiddenImage} message="userHasNoAccessToPage" />;
  }

  return children;
};

export default AccessController;
