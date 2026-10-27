import { cloneDeep, isArray, isObject, transform } from 'lodash';
import { AnyType, AppError } from '@pkg-common/types';
import { isJSON } from '@pkg-common/utils/utils';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';
import { hasValue } from '@pkg-common/utils';

const UI_METADATA = ['__STATUS__', '__INDEX__', '__JSON_PATH__', '__LEVEL__', '__ACTION__'];

export const handlePayloadErrorsForToolkit = (error: AppError) => {
  const formattedErrorMessage = error?.errorCode
    ? `${error.errorCode}: ${error.message}`
    : error.message;

  const messages = [formattedErrorMessage];
  if (error?.violations?.length) {
    error.violations
      .filter((violation) => !violation.fieldName || violation.fieldName === '[]')
      .forEach((violation) => messages.push(violation.message || violation['messageKey']));
  }
  if (error?.violation) {
    messages.push(error?.violation);
  }
  return {
    key: new Date().getTime().toString(),
    message: messages.join(' \n'),
    severity: 'error',
  };
};

export const handlePayloadErrors = (error: AppError) => {
  if (!error) {
    return;
  }
  const formattedErrorMessage = error?.errorCode
    ? `${error.errorCode}: ${error.message}${error.violation ? ` - ${error.violation}` : ''}`
    : error.message;

  const errors = formattedErrorMessage
    ? [
        EnqueueSnackbar({
          key: new Date().getTime().toString(),
          message: formattedErrorMessage,
          severity: 'error',
        }),
      ]
    : [];

  if (error?.violations?.length) {
    error.violations
      .filter((violation) => !violation.fieldName || violation.fieldName === '[]')
      .forEach((violation, index) =>
        errors.push(
          EnqueueSnackbar({
            key: `${new Date().getTime().toString()}_${index}`,
            // TODO: messageKey is only for Form Apis and must be unified
            message: violation?.errorCode
              ? `${violation.errorCode}: ${violation.message || violation['messageKey']}`
              : violation.message || violation['messageKey'],
            severity: 'error',
          }),
        ),
      );
  }
  return errors;
};

// Helper to clean metadata keys inline during object processing
export const processValueAndCleanMetadata = (value: AnyType): AnyType => {
  if (isArray(value)) {
    return value.map((item) => processValueAndCleanMetadata(item));
  }

  if (isObject(value)) {
    const result = {};
    Object.keys(value).forEach((key) => {
      if (!UI_METADATA.includes(key)) {
        result[key] = processValueAndCleanMetadata(value[key]);
      }
    });
    return result;
  }

  return value;
};

export function wrapEntityDataArea(
  entity: AnyType,
  entityDataAreaKey: string | string[] | undefined,
  uiSchema: Record<string, AnyType>,
) {
  if (!hasValue(entity) || !entityDataAreaKey || !hasValue(uiSchema)) {
    return entity;
  }

  const object = cloneDeep(entity);

  // Clean metadata at current level
  UI_METADATA.forEach((field) => {
    delete object[field];
  });

  try {
    const schemaKeys = getSchemaPropertyKeys(uiSchema);
    schemaKeys?.forEach((key) => {
      const rawDataAreaKeys = uiSchema[key]?.customFieldsKey ?? entityDataAreaKey;

      let dataAreaKeys: string[] = [];

      if (Array.isArray(rawDataAreaKeys)) {
        dataAreaKeys = rawDataAreaKeys;
      } else if (typeof rawDataAreaKeys === 'string') {
        dataAreaKeys = [rawDataAreaKeys];
      }

      const isAnObject = isObject(object[key]);
      const isAnArray = isArray(object[key]);

      const targetDataAreaKey = dataAreaKeys.find(
        (areaKey) => !!uiSchema[key]?.['ui:options']?.[areaKey],
      );

      const isModelExtension = !!targetDataAreaKey;
      const isSidePanel = key === 'sidePanelInfo';

      if (isSidePanel) {
        uiSchema[key]?.forEach((config) => {
          const { key: innerKey, uiSchema: innerUISchema } = config || {};
          if (hasValue(object[innerKey]) && hasValue(innerUISchema) && isArray(object[innerKey])) {
            const obj = wrapEntityDataArea(
              { [innerKey]: object[innerKey] },
              dataAreaKeys,
              innerUISchema,
            );
            object[innerKey] = (obj ?? {})[innerKey];
          }
        });
      } else if (isModelExtension) {
        const parsed = isJSON(object[targetDataAreaKey]);
        object[targetDataAreaKey] = parsed ? parsed : object[targetDataAreaKey] ?? {};
        // Process and clean the value in a single pass before stringifying
        object[targetDataAreaKey][key] = processValueAndCleanMetadata(object[key]);

        if (hasValue(object[targetDataAreaKey])) {
          object[targetDataAreaKey] = JSON.stringify(object[targetDataAreaKey]);
        }

        delete object[key];
      } else if (isAnArray) {
        object[key]?.forEach((item: AnyType, index: number) => {
          object[key][index] = wrapEntityDataArea(
            processValueAndCleanMetadata(item),
            dataAreaKeys,
            uiSchema[key]?.items ?? {},
          );
        });
      } else if (isAnObject) {
        const result = wrapEntityDataArea(
          processValueAndCleanMetadata(object[key]),
          dataAreaKeys,
          uiSchema[key],
        );
        if (hasValue(result)) {
          object[key] = result;
        }
      }
    });

    return processValueAndCleanMetadata(object);
  } catch (error) {
    return processValueAndCleanMetadata(object);
  }
}

export function unwrapEntityDataArea(entity: AnyType) {
  return unwrapEntityDataAreaWithOptions(entity);
}

interface UnwrapEntityDataAreaOptions {
  skipKeys?: string[];
}

function unwrapEntityDataAreaWithOptions(
  entity: AnyType,
  options: UnwrapEntityDataAreaOptions = {},
) {
  const skipKeys = new Set(options.skipKeys || []);
  return unwrapEntityDataAreaInternal(entity, skipKeys);
}

function unwrapEntityDataAreaInternal(entity: AnyType, skipKeys: Set<string>) {
  const isStringOrNumber =
    typeof entity === 'string' || typeof entity === 'number' || typeof entity === 'boolean';

  if (!hasValue(entity) || isStringOrNumber) {
    return entity;
  }

  const object = cloneDeep(entity);

  try {
    getSchemaPropertyKeys(object).forEach((key) => {
      if (skipKeys.has(key)) {
        return;
      }

      const parsed = isJSON(object[key]);
      const isAnObject = isObject(object[key]);
      const isAnArray = isArray(object[key]);

      if (parsed) {
        Object.keys(parsed)?.forEach(
          (k) => (object[k] = unwrapEntityDataAreaInternal(parsed[k], skipKeys)),
        );
      } else if (isAnArray) {
        object[key]?.forEach((item, index) => {
          object[key][index] = unwrapEntityDataAreaInternal(item, skipKeys);
        });
      } else if (isAnObject) {
        UI_METADATA.forEach((field) => {
          delete object[key][field];
        });
        object[key] = unwrapEntityDataAreaInternal(object[key], skipKeys);
      }

      if (parsed) {
        delete object[key];
      }
    });

    return object;
  } catch (error) {
    return object;
  }
}

export function unwrapEntityDataAreaWithSkipKeys(entity: AnyType, skipKeys: string[] = []) {
  return unwrapEntityDataAreaWithOptions(entity, { skipKeys });
}

/**
 * Merges paymentTender subSchemas which are defined in their parent uiSchema as a uischema[ui:options]subSchemas directive
 * @param payload
 * @param state
 * @returns Object - uiSchema
 */
export function mergeSubSchemas(
  payload: { uiSchema: Record<string, AnyType>; entityId: string },
  state: Record<string, AnyType>,
) {
  const { uiSchema = {}, entityId } = payload || {};

  const { subSchemas } = uiSchema['ui:options'] || {};
  if (!subSchemas) {
    return uiSchema;
  }

  return subSchemas.reduce((acc: Record<string, AnyType>, next: Record<string, AnyType>) => {
    const { code, entitySubType, screenTypeCL, target, category, property } = next;
    const nextSchema =
      state?.ApiData[
        entitySubType
          ? `${code}_${screenTypeCL}_${entitySubType}_SCHEMAS`
          : `${code}_${screenTypeCL}_SCHEMAS`
      ]?.data?.uiSchema;

    const { formData } = state.Entities[entityId];

    const types = formData[target]?.map((item: Record<string, AnyType>) => item[property]);
    if (!types?.includes(entitySubType)) {
      return acc;
    }

    return {
      ...acc,
      [target]: acc[target].items
        ? {
            ...acc[target],
            items: {
              ...acc[target].items,
              [category]: {
                ...acc[target].items[category],
                ...nextSchema?.[category],
              },
            },
          }
        : {
            ...acc[target],
            [category]: {
              ...acc[target][category],
              ...nextSchema?.[category],
            },
          },
    };
  }, uiSchema);
}

const getSchemaPropertyKeys = (uiSchema) => {
  return Object.keys(uiSchema || {})?.filter(
    (p) =>
      p !== 'customFieldsKey' &&
      p !== 'ui:disabled' &&
      p !== 'ui:readonly' &&
      p !== 'ui:widget' &&
      p !== 'ui:field' &&
      p !== 'ui:template' &&
      p !== 'items' &&
      p !== 'disabledFrom' &&
      p !== 'ui:page' &&
      p !== 'ui:labels' &&
      p != 'ui:groups' &&
      p !== 'ui:buttons' &&
      // p != 'sidePanelInfo' &&
      p !== 'callApis' &&
      p !== 'ui:options' &&
      p !== 'ui:card:colors' &&
      p !== 'ui:colors' &&
      p !== 'schemas' &&
      p !== 'criteria' &&
      p !== 'assessmentParameters' &&
      p !== 'serverParameters' &&
      p !== 'reportedFormData' &&
      !UI_METADATA.includes(p),
  );
};

export const getTargetDataInForm = (path: string[], formData: AnyType) => {
  return path.reduce((acc, key) => acc?.[key], formData);
};

// Recursively clear all fields not in readOnlyWidgetSet using lodash transform.
// - key in readOnlyWidgetSet           → keep value as-is
// - key not readonly, is object  → recurse inside (to preserve any readonly descendants)
// - key not readonly, primitive  → set undefined
const clearEditableFields = (object: AnyType, readOnlyWidgetSet: Set<string>): AnyType => {
  return transform(
    object,
    (result: AnyType, value: AnyType, key: string) => {
      if (readOnlyWidgetSet.has(key)) {
        result[key] = value;
      } else if (isObject(value) && !isArray(value)) {
        result[key] = clearEditableFields(value, readOnlyWidgetSet);
      } else {
        result[key] = undefined;
      }
    },
    {},
  );
};

export const clearFormStepperFieldsOnly = (
  parentId: string,
  widgetGroups: AnyType,
  clonedFormData: AnyType,
  readOnlyWidgets?: Set<string>,
) => {
  if (!widgetGroups || !clonedFormData) return clonedFormData;
  const toBeClearWidgets = widgetGroups.flatMap((group) => group.widgets);
  const formStepPath = parentId.split('_').slice(1);
  const targetData = getTargetDataInForm(formStepPath, clonedFormData);
  if (targetData && typeof targetData === 'object') {
    const widgetSet = new Set(toBeClearWidgets);
    const readOnlyWidgetSet = readOnlyWidgets ?? new Set<string>();
    for (const key of Object.keys(targetData)) {
      if (!widgetSet.has(key) || readOnlyWidgetSet.has(key)) continue;
      if (isObject(targetData[key]) && !isArray(targetData[key])) {
        targetData[key] = clearEditableFields(targetData[key], readOnlyWidgetSet);
      } else {
        targetData[key] = undefined;
      }
    }
  }
  return clonedFormData;
};
