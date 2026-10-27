import { useEffect, useRef, useState, useMemo } from 'react';
import useCodeLists from '@pkg-core/codeList/hooks/useCodeLists';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import { FilterFromSchema, RenderWithSchema } from '@pkg-form/types';
import { ApiValuesSchema } from '@pkg-common/types';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import useCodeList from '@pkg-core/codeList/hooks/useCodeList';
import { AnyType } from '@pkg-common/types';
import useFormData from '../../../../common/src/dataResolver/useFormData';
import { filterByAnotherCodelist } from '@pkg-form/components/SelectCodeListWidget/utils';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { hasValue } from '@pkg-common/utils';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const useCodeListWidget = (
  widgetId: string,
  apiValues: ApiValuesSchema | AnyType,
  filterFrom?: FilterFromSchema,
  renderWith?: RenderWithSchema,
  hasBeenFocused?: boolean,
  loadOnFocus?: boolean,
  valueInFilterCookies?: boolean,
) => {
  const {
    dataFrom,
    queryFrom,
    jsonPath,
    alwaysReload,
    ignoreParamsIfNotFound = false,
    showCode,
  } = apiValues || {};
  const { formData } = useEntityFormData(TRANSITION_FORM);
  const { addComponentValueType } = useFormManagerContext();

  const id =
    widgetId.includes(TRANSITION_FORM) && hasValue(formData?.__JSON_PATH__)
      ? formData?.__JSON_PATH__
      : widgetId;
  const apiVariableValues = useDynamicApi(id, apiValues);
  const [apiVariables, setApiVariables] = useState(apiVariableValues);

  const { loadCodeList } = useCodeLists();
  const { list: existingList = [], loading } = useCodeList(apiVariables.codeList ?? '');
  const { list: filterFromList = [] } = useCodeList(filterFrom?.codelist ?? '');
  const { value: filterValues = [] } = useFormData(id, filterFrom?.source);

  const dataValues = useMultipleFormData(id, dataFrom, false);

  const apiVariablesRef = useRef(apiVariables);
  const loadedRef = useRef(false);

  const hasChanged = () => {
    const apiVariablesPrev = JSON.stringify(apiVariablesRef.current || {});
    const apiVariablesNext = JSON.stringify(apiVariables || {});

    return apiVariablesPrev !== apiVariablesNext;
  };

  useEffect(() => {
    if (id?.includes('-filters') && apiVariables.codeList) {
      const componentId = id.split('_').pop();
      addComponentValueType(componentId, apiVariables.codeList);
    }
  }, [id, apiVariables.codeList]);

  useEffect(() => {
    setApiVariables(apiVariableValues);
  }, [apiVariableValues]);

  const allowLoading = useMemo(() => {
    if (!hasBeenFocused) {
      return false;
    }
    if (!loadOnFocus) {
      return true;
    } else {
      return hasBeenFocused || valueInFilterCookies;
    }
  }, [hasBeenFocused, loadOnFocus, valueInFilterCookies, id]);

  useEffect(() => {
    if ((hasChanged() || !loadedRef.current) && allowLoading) {
      loadedRef.current = true;

      apiVariablesRef.current = apiVariables;
      const queryFromKeys = (queryFrom || [])
        .filter((item) => !item?.isOptional)
        .map((item) => item.key);

      const hasAllQueryParams = queryFromKeys.every((c) =>
        Object.keys(apiVariables.queryParams).includes(c),
      );

      const hasFoundAllDataFromFields = (dataFrom || [])
        .filter((f) => !f.isOptional)
        .every((f) => hasValue(dataValues[f.key]));

      const hasAllPathParams = urlHasAllParams(apiVariables.url);

      const hasAllQueryValues = ignoreParamsIfNotFound || hasAllQueryParams;
      const dataValuesReady = dataFrom ? hasFoundAllDataFromFields : true;

      const shouldLoad =
        hasAllPathParams &&
        hasAllQueryValues &&
        dataValuesReady &&
        (alwaysReload || !existingList?.length);

      if (shouldLoad) {
        loadCodeList(
          apiVariables.url,
          apiVariables.codeList,
          apiVariables.method,
          jsonPath,
          dataValues,
          apiVariables.queryParams,
          alwaysReload,
          renderWith,
          showCode,
        );
      }
    }
  }, [apiVariables, existingList, ignoreParamsIfNotFound, allowLoading, showCode]);

  return {
    list: filterByAnotherCodelist(existingList, filterFromList, filterFrom, filterValues),
    loading,
  };
};

export default useCodeListWidget;
