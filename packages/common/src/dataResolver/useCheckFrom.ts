import useMultipleFormData from './useMultipleFormData';
import { computeCheck } from '@pkg-common/dataResolver/utils';
import { useMemo, useRef } from 'react';
import { AnyType } from '@pkg-common/types';
import { useSelector } from 'react-redux';
import useUser from '@pkg-setup/src/user/useUser';
import { useSystem } from '@pkg-setup/index';

const useCheckFrom = (
  id: string,
  from: AnyType,
  defaultCheckValue = false,
  resourceData: AnyType = undefined,
) => {
  const { operator = 'every', fields = [] } = from || {};

  const operatorRef = useRef(operator);
  const state = useSelector((state) => state);

  const { application } = useSystem();
  const { partyRoleId, userId } = useUser();
  const values = useMultipleFormData(id, fields, true, resourceData);

  const user = useMemo(() => {
    return application === 'ISS' ? userId : partyRoleId;
  }, [application, partyRoleId, userId]);

  const check = useMemo(
    () =>
      computeCheck({ operator: operatorRef.current, fields, values, state, user: user || '', id }),
    [values, fields, state, user, id],
  );

  if (!from) {
    return { check: defaultCheckValue, values };
  }

  if (!fields || fields.length === 0) {
    return { check: defaultCheckValue, values };
  }

  return { check, values };
};

export default useCheckFrom;
