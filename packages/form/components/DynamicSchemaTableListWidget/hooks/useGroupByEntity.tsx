import useFormData from '@pkg-common/dataResolver/useFormData';
import { useMemo, useRef } from 'react';
import { DataSourceSchema } from '@pkg-common/types';

export const useGroupByEntity = ({
  id,
  sourceGroups,
}: {
  id: string;
  sourceGroups?: DataSourceSchema;
}) => {
  const { value } = useFormData(id, sourceGroups);

  const responseRef = useRef({});

  const groupedEntities = useMemo(() => {
    try {
      return (value || [])?.reduce((result, obj) => {
        (result[obj?.entityCL] || (result[obj?.entityCL] = [])).push(obj.entityId);
        return result;
      }, {}) as { [_: string]: Array<string> };
    } catch {
      return null;
    }
  }, [value]);

  const totalEntities = useMemo(() => {
    try {
      return Object.values(groupedEntities || {}).reduce((acc, currentValue) => {
        return acc + (currentValue || []).length;
      }, 0);
    } catch {
      return null;
    }
  }, [groupedEntities]);

  const response = { groupedEntities, totalEntities };

  if (JSON.stringify(responseRef.current) === JSON.stringify(response)) {
    return responseRef.current;
  } else {
    responseRef.current = response;
    return response;
  }
};
