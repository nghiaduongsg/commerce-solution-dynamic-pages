import { useMemo, useRef } from 'react';
import { resolveSourceData } from './utils';
import { AnyType, DataSourceSchema } from '../types';
import { hasValue } from '../utils';
import { isArray } from 'lodash';
import { useParams, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

const useFormData = (widgetId: string, source?: DataSourceSchema, type: AnyType = undefined) => {
  const finalValueRef = useMemo(() => {
    return type === 'number' || (isArray(type) && (type || []).includes('number')) ? null : '';
  }, [type]);

  const valueRef = useRef({
    value: finalValueRef,
  });
  const state = useSelector((state) => state);
  const { state: locationState } = useLocation();
  const routeParams = useParams();

  const value = useMemo(() => {
    if (!source || !hasValue(source) || !widgetId) {
      return { value: finalValueRef };
    }
    return resolveSourceData(
      widgetId,
      { state, routeParams, routerData: locationState },
      { key: 'KEY', source },
    );
  }, [state, locationState, routeParams, source, widgetId]);

  if (
    JSON.stringify({
      value: hasValue(value) ? value : '',
    }) !== JSON.stringify(valueRef.current)
  ) {
    valueRef.current = value;
    return value;
  }

  return valueRef.current;
};

export default useFormData;
