import { isActionAllowedBasedOnSecurableObjects } from '@pkg-common/utils/utils';
import useUser from './useUser';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useMemo } from 'react';
import { AnyType } from '@pkg-common/types';

const usePermissions = (
  permissionKey?: AnyType,
  replacementValues?: { [key: string]: AnyType },
) => {
  const { securableObjects } = useUser();
  const { applyPermissions, applySecObjectPermissions, application } = useSystem();

  const finalApplyPermissions = useMemo(() => {
    return application === 'ISS' ? applySecObjectPermissions : applyPermissions;
  }, [application, applyPermissions, applySecObjectPermissions]);

  return isActionAllowedBasedOnSecurableObjects(
    replacementValues || {},
    permissionKey || '',
    securableObjects,
    finalApplyPermissions,
  );
};

export default usePermissions;
