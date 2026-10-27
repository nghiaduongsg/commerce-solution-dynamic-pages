import { useMemo, useRef } from 'react';
import { ApiValuesSchema, FieldConditionSchema } from '../types.d';
import useMultipleFormData from './useMultipleFormData';
import { urlHasAllParams } from '../utils/utils';
import { hasValue } from '../utils';
import { getQueriesFromUrl, constructApiUrl } from './utils';
import { AnyType } from '../types';
import { isArray, isObject } from 'lodash';
import { createCodelistKey } from '@pkg-form/validations/utils/widgetUtils';
import useAlternateUrl from './useAlternateUrl';

const useDynamicApi = (
  id: string,
  apiValues?: ApiValuesSchema | AnyType,
  resourceData?: AnyType,
): ApiValuesSchema & {
  queryParams?: AnyType;
  data?: AnyType;
  dataValuesReady: boolean;
  urlReady: boolean;
  replacementValues?: AnyType;
} => {
  const {
    queryFrom,
    replacements,
    dataFrom,
    url,
    method,
    codeList = '',
    unifyData = false,
    alternateUrls,
  } = apiValues || {};

  const valueRef = useRef({
    url,
    method,
    codeList,
    resourceId: codeList,
    queryParams: {},
    dataValuesReady: false,
    urlReady: false,
  });

  const alternateUrl = useAlternateUrl(id, alternateUrls, resourceData);
  const selectedUrl = alternateUrl?.url || url;
  const selectedReplacements = useMemo(() => {
    return alternateUrl ? mergeReplacements(replacements, alternateUrl.replacements) : replacements;
  }, [alternateUrl]);

  const changedUrl = useMemo(() => {
    return selectedUrl !== valueRef.current.url;
  }, [selectedUrl]);

  const replacementValues = useMultipleFormData(id, selectedReplacements, false, resourceData);
  const queryValues = useMultipleFormData(id, queryFrom, false, resourceData);
  const dataValues = useMultipleFormData(id, dataFrom, false, resourceData);

  const finalApi = useMemo(() => {
    if (!apiValues || !selectedUrl) {
      return valueRef.current;
    }

    const finalApiUrl = constructApiUrl(
      { ...apiValues, url: selectedUrl, replacements: selectedReplacements },
      replacementValues,
    );
    const urlHardCodedQueries = getQueriesFromUrl(finalApiUrl);

    const hasFoundAllMandatoryFields = (dataFrom || [])
      .filter((f) => !f.isOptional)
      .every((f) => hasValue(dataValues[f.key]));

    const dataValuesReady = dataFrom ? hasFoundAllMandatoryFields : true;

    const urlReady = urlHasAllParams(finalApiUrl);
    const resourceId = createCodelistKey(codeList, {
      ...(queryValues || {}),
      ...(replacementValues || {}),
      ...(urlHardCodedQueries || {}),
    });

    return {
      ...apiValues,
      url: finalApiUrl,
      method,
      codeList: resourceId,
      resourceId,
      queryParams: queryValues,
      data: unifyData ? unifyAllData(dataValues) : dataValues,
      dataValuesReady,
      urlReady,
      replacementValues,
    };
  }, [
    replacementValues,
    selectedReplacements,
    queryValues,
    dataValues,
    changedUrl,
    unifyData,
    selectedUrl,
  ]);

  if (
    JSON.stringify(finalApi) !== JSON.stringify(valueRef.current) &&
    urlHasAllParams(finalApi?.url || '')
  ) {
    valueRef.current = finalApi;
    // @ts-ignore
    return finalApi || {};
  }

  // @ts-ignore
  return valueRef.current;
};

export default useDynamicApi;

const unifyAllData = (data) => {
  let unified = {};

  Object.keys(data || {}).forEach((key) => {
    const v = data[key];

    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || isArray(v)) {
      unified[key] = v;
    }

    if (isObject(v)) {
      unified = { ...unified, ...v };
    }
  });

  return unified;
};

const mergeReplacements = (
  replacements: Array<FieldConditionSchema> = [],
  overrideReplacements: Array<FieldConditionSchema> = [],
) => {
  const secondKeys = new Set(overrideReplacements.map((replacement) => replacement.key));

  return [
    ...replacements.filter((replacement) => !secondKeys.has(replacement.key)),
    ...overrideReplacements,
  ];
};
