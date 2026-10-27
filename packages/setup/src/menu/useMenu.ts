import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMainMenuItems } from './selectors';
import { LoadMainMenu } from './reducers';
import { equalityCheck } from '@pkg-common/utils/utils';
import { AnyType } from '@pkg-common/types';
import useUser from '@pkg-setup/src/user/useUser';
import useSystem from '@pkg-setup/src/system/useSystem';

// This is configurable to allow or disallow checking services for menu items.
const SHOULD_CHECK_MENU_SERVICES = window['SHOULD_CHECK_MENU_SERVICES'] ?? 'false';

const transformItems = (items) => {
  return items.map((item) => {
    return {
      ...item,
      id: item.code,
      title: item.codeDescription || item.code,
      path: `/${item.target}`,
      children: item.children ? transformItems(item.children) : null,
    };
  });
};

const isAllowedBasedOnSecurableObjects = (securableObjects, key, operation) => {
  return !!securableObjects[`${key}${operation}`];
};

const isAllowedBasedOnServices = (allowedServices, services) => {
  if (SHOULD_CHECK_MENU_SERVICES === 'false') {
    return true;
  }

  return (services || []).some((serviceCode) => {
    return allowedServices?.includes(serviceCode);
  });
};

const findAllowedItems = (
  items: AnyType = [],
  securableObjects,
  allowedServices,
  application,
  isAdminUser,
  applySecObjectPermissions,
) => {
  return items
    .filter((item) => {
      if (!item.dataArea && application === 'IRM') {
        return false;
      }

      if (!item.dataArea && application === 'ISS') {
        return false;
      }

      let parsedDataArea;
      try {
        parsedDataArea = JSON.parse(item.dataArea);
      } catch (error) {
        console.error('Failed to parse menu item dataArea:', item.dataArea, error);
        return false;
      }

      const {
        securableObjectKey,
        securableObjectOperation,
        services,
        isAdmin: isAdminMenuItem = false,
      } = parsedDataArea;

      if (application === 'IRM') {
        return isAllowedBasedOnSecurableObjects(
          securableObjects,
          securableObjectKey,
          securableObjectOperation,
        );
      } else if (application === 'ISS') {
        // In case of applySecObjectPermissions set to true.
        if (applySecObjectPermissions) {
          const allowedFromSecurableObjects = isAllowedBasedOnSecurableObjects(
            securableObjects,
            securableObjectKey,
            securableObjectOperation,
          );
          if (isAdminMenuItem) {
            // In case of ADMIN menu, check securable objects.
            return allowedFromSecurableObjects;
          } else {
            // In case of USER menu, check securable objects & services
            return (
              allowedFromSecurableObjects && isAllowedBasedOnServices(allowedServices, services)
            );
          }
        } else {
          // In case of applySecObjectPermissions set to false.
          if (isAdminMenuItem) {
            // In case of ADMIN menu, return true if use is Admin.
            return isAdminUser;
          } else {
            // In case of USER menu, check services
            return isAllowedBasedOnServices(allowedServices, services);
          }
        }
      }

      // Unknown application - deny access by default
      return false;
    })
    .map((item) => {
      if (!item.children || !Array.isArray(item.children)) {
        return item;
      }

      return {
        ...item,
        children: findAllowedItems(
          item.children,
          securableObjects,
          allowedServices,
          application,
          isAdminUser,
          applySecObjectPermissions,
        ),
      };
    });
};

const useMenu = () => {
  const dispatch = useDispatch();

  const items = useSelector(selectMainMenuItems, equalityCheck);
  const { securableObjects, allowedServices, isAdminUser } = useUser();

  const { application, applySecObjectPermissions } = useSystem();

  const allowedMenuItems = useMemo(() => {
    return findAllowedItems(
      transformItems(items),
      securableObjects,
      allowedServices,
      application,
      isAdminUser,
      applySecObjectPermissions,
    );
  }, [
    items,
    securableObjects,
    allowedServices,
    application,
    isAdminUser,
    applySecObjectPermissions,
  ]);

  return {
    items: allowedMenuItems,
    loadMainMenu: useCallback(() => dispatch(LoadMainMenu()), [dispatch]),
  };
};

export default useMenu;
