import { useMemo } from 'react';
import { AlternateUrlSchema, AnyType } from '../types';
import useMultipleFormData from './useMultipleFormData';
import { computeCheck } from './utils';
import { useSelector } from 'react-redux';
import useUser from '@pkg-setup/src/user/useUser';
import { useSystem } from '@pkg-setup/index';

const useAlternateUrl = (
  id: string,
  alternateUrls?: Array<AlternateUrlSchema>,
  resourceData?: AnyType,
) => {
  const { application } = useSystem();
  const { partyRoleId, userId } = useUser();
  const state = useSelector((storeState) => storeState);
  const conditions = alternateUrls || [];
  const conditionFields = useMemo(
    () => conditions.flatMap(({ condition }) => condition?.fields || []),
    [conditions],
  );
  const values = useMultipleFormData(id, conditionFields, true, resourceData);
  const user = application === 'ISS' ? userId : partyRoleId;

  return useMemo(
    () =>
      conditions.find(({ condition }) =>
        computeCheck({
          operator: condition?.operator,
          fields: condition?.fields,
          values,
          state,
          user: user || '',
          id,
        }),
      ),
    [conditions, values, user, id, state],
  );
};

export default useAlternateUrl;
