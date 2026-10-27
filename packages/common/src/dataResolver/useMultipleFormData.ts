import { useMemo } from 'react';
import { AnyType, FieldConditionSchema } from '../types.d';
import { resolveData } from './utils';
import { useParams, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import useDate from '@pkg-common/hooks/useDate';

const useMultipleFormData = (
  widgetId: string,
  sources?: Array<FieldConditionSchema>,
  returnFalsyValues?: boolean,
  resourceData?: AnyType,
) => {
  const state = useSelector((state) => state);
  const { state: locationState } = useLocation();
  const routeParams = useParams();
  const dateFormat = useDate('date') || 'dd/MM/yyyy';

  return useMemo(() => {
    if (!widgetId || !sources || !sources?.length) {
      return {};
    }

    return (
      resolveData(
        widgetId,
        {
          state,
          routeParams,
          routerData: locationState,
          dateFormat,
        },
        sources || [],
        returnFalsyValues,
        resourceData,
      ) || {}
    );
  }, [state, locationState, routeParams, sources, returnFalsyValues, resourceData]);
};

export default useMultipleFormData;
