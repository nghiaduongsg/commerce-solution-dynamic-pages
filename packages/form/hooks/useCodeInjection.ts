import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import usePrevious from '@pkg-common/hooks/usePrevious';
import useEntity from '@pkg-entity/hooks/useEntity';
import useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';
import { ClearFormServerErrors, SetFormServerErrors } from '@pkg-form/validations/redux/reducers';
import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { SetupCodeParams } from '@pkg-form/types';
import useSystem from '@pkg-setup/src/system/useSystem';
import {
  wrapEntityDataArea,
  unwrapEntityDataArea,
  handlePayloadErrors,
} from '@pkg-entity/utils/utils';
import {
  getBEValidations,
  getBEValidationTypes,
} from '@pkg-form/validations/utils/validationUtils';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import { AppErrorViolation } from '@pkg-common/types';
import useLoader from '@pkg-common/loader/useLoader';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { AnyType } from '@pkg-common/types';
import { jpValue } from '@pkg-common/dataResolver/utils';
import setupInterceptors from '@pkg-setup/src/interceptors/interceptors';
import axios from 'axios';
import authClient from '@pkg-setup/src/auth/authClient';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';

type SetupCodeBinding = {
  jsonPath: string;
  onChange: (data: any, prevData: any) => void;
};

type SetupButton = {
  id: string;
  label: string;
  onClick: () => void;
};

const initAxiosInstance = () => {
  const instance = axios.create({});
  setupInterceptors(instance, authClient);
  return instance;
};

const axiosInstance = initAxiosInstance();

const hasChanged = (prev, next, jsonPath) => {
  let prevValue;
  try {
    prevValue = jpValue(prev, jsonPath);
  } catch {
    return false;
  }

  let nextValue;
  try {
    nextValue = jpValue(next, jsonPath);
  } catch {
    return false;
  }

  return JSON.stringify(prevValue || {}) !== JSON.stringify(nextValue || {});
};

const useCodeInjection = (
  entityId: string,
  schemasConfig: {
    entityDataAreaKey?: string;
    uiJsonSchema?: AnyType;
    jsonSchema?: AnyType;
    subType?: AnyType;
  },
  setupCode: (params: SetupCodeParams) => SetupCodeBinding[],
  setupButtons?: (params: SetupCodeParams) => SetupButton[],
  omitCustomCode?: boolean,
): SetupButton[] => {
  const dispatch = useDispatch();
  const { addFieldErrors, removeFieldErrors, setFieldErrors } = useValidationsContext();
  const { entityDataAreaKey, uiJsonSchema, jsonSchema, subType } = schemasConfig;

  const { enqueueSnackbar } = useNotifiers();
  const { apiUrl } = useSystem();

  const entityHandler = useEntity(entityId);
  const { formDataForCodeInjection: formData } = useEntityFormData(entityId);
  const prevFormData = usePrevious(formData);

  const { showLoader, hideLoader } = useLoader();

  const addValidationErrors = (field: string, errors: string[]) => {
    addFieldErrors(field, errors);
  };

  const removeValidationErrors = (field: string, errors: string[]) => {
    removeFieldErrors(field, errors);
  };

  const setValidationErrors = (field: string, errors: string[]) => {
    setFieldErrors(field, errors);
  };

  const setServerErrors = (violations: Array<AppErrorViolation>) => {
    dispatch(
      SetFormServerErrors({
        errors: getBEValidations(entityId, violations),
        errorTypes: getBEValidationTypes(entityId, violations),
      }),
    );
  };

  const clearServerErrors = () => {
    dispatch(ClearFormServerErrors());
  };

  const raiseSnackbar = (message: string, severity: 'dark' | 'error' | undefined, key?: string) => {
    enqueueSnackbar({
      key: key || new Date().getTime().toString(),
      message,
      severity,
      namespace: COMMON,
    });
  };

  const raiseSnackbars = (
    snackbars: Array<{
      payload: { message: string; severity: 'dark' | 'error' | undefined };
      type: string;
    }>,
  ) => {
    (snackbars || []).forEach((snackbar, index) =>
      raiseSnackbar(
        snackbar.payload.message,
        snackbar.payload.severity,
        `${new Date().getTime().toString()}_${index}`,
      ),
    );
  };

  const params: SetupCodeParams = {
    entityId,
    entityHandler,
    formData,
    codeListHandler: useCodeListAttributes,
    validationsHandler: {
      addValidationErrors,
      removeValidationErrors,
      setValidationErrors,
      setServerErrors,
      clearServerErrors,
    },
    requestHandler: {
      baseUrl: apiUrl,
      axios: axiosInstance,
    },
    utils: {
      wrapEntity: (data) => wrapEntityDataArea(data, entityDataAreaKey, uiJsonSchema),
      unwrapEntity: (data) => unwrapEntityDataArea(data),
      raiseSnackbar,
      raiseSnackbars,
      showLoader,
      hideLoader,
      handlePayloadErrors,
    },
    schemas: {
      dataSchema: jsonSchema,
      uiSchema: uiJsonSchema,
      subType,
    },
  };

  const bindings: SetupCodeBinding[] =
    setupCode && typeof setupCode === 'function' && !omitCustomCode ? setupCode(params) : [];
  const buttons: SetupButton[] =
    setupButtons && typeof setupButtons === 'function' ? setupButtons(params) : [];

  useEffect(() => {
    bindings.forEach((change) => {
      if (hasChanged(prevFormData, formData, change.jsonPath)) {
        change.onChange(formData, prevFormData);
      }
    });
  }, [formData, prevFormData, bindings]);

  return useMemo(() => {
    return buttons;
  }, [formData, buttons]);
};

export default useCodeInjection;
