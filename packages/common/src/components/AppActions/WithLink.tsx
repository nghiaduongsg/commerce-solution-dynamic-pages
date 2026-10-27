import { urlHasAllParams } from '@pkg-common/utils/utils';
import { Link } from 'react-router';
import React from 'react';
import { NAVIGATION_STATE_KEY } from '@pkg-constants/formCommon';

// Store data temporarily in local storage, so that they can still be retrieved if user refreshes the page or open new tab.
const setLocalStorageNavigationStateKey = (data) => {
  localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(data ?? {}));
};

export const WithLink = ({ finalApi, children, isRedirect = false }) => {
  if (!isRedirect) {
    return children;
  }
  if (urlHasAllParams(finalApi?.url)) {
    return (
      <Link
        to={finalApi.url ?? ''}
        state={finalApi?.data ?? {}}
        target={'_blank'}
        style={{ textDecoration: 'none', display: 'inline-flex', color: 'black' }}
        tabIndex={-1}
        onMouseDown={() => setLocalStorageNavigationStateKey(finalApi.data)}
      >
        {children}
      </Link>
    );
  }

  return null;
};
