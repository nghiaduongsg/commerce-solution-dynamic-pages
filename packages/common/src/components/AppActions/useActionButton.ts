import { useCallback, useContext, useMemo, useState } from 'react';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import isEmpty from 'lodash/isEmpty';
import { downloadFile, setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import { ActionButtonType } from './types';
import useCallApiData from '@pkg-core/apiData/hooks/useCallApiData';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AnyType } from '@pkg-common/types';
import useTable from '../../../../list/hooks/useTable';
import { appendQueryParams, getFormIdFromWidgetId, hasValue } from '@pkg-common/utils';
import { isExternal } from '@pkg-common/utils/utils';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import useNotifiers from '../../notifier/useNotifiers';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import UISchemaContext from '@pkg-form/UISchemaContext';
import useButtonPress from '@pkg-common/button/useButtonPress';
import { commonCodes } from '@pkg-constants/validationCodes';
import useFormField from '@pkg-entity/hooks/useFormField';
import { getButtonFinalId } from '@pkg-common/components/AppActions/utils';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';
import { exportFilters, importFilters } from '@pkg-setup/src/userSettings/reducers';
import { useEntity } from '@pkg-entity/index';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';
import { handlePayloadErrorsForToolkit } from '@pkg-entity/utils/utils';
import { SetFormServerErrors } from '@pkg-form/validations/redux/reducers';
import {
  getBEValidations,
  getBEValidationTypes,
} from '@pkg-form/validations/utils/validationUtils';
import { useDispatch } from 'react-redux';
import useLatestButtonAction from '@pkg-common/button/useLatestButtonAction';
import TableHelperContext from '@pkg-form/components/ArrayHandler/TableHelperContext';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const useActionButton = (
  widgetId: string,
  action: ActionButtonType,
  onSuccessCallback?: AnyType,
  parentId?: string,
  onButtonPress?: () => void,
) => {
  const { onRowActivated } = useContext(TableHelperContext);
  const {
    visibilityFrom,
    values,
    type,
    schemas,
    onClick,
    disabledFrom,
    source,
    notify = { success: 'updateEntitySuccess' },
    title,
    avoidSubmit = false,
    showClientValidations = false,
    onSuccessRedirect,
    addToField = '',
    actionId,
    namespace,
    icon,
    refersTo,
    shouldSetPageDirty = true,
  } = action;

  const { apiUrl } = useSystem();
  const dispatch = useDispatch();
  const apiDataId = values?.resourceId ?? `${widgetId}_btn_call`;
  const finalId = getButtonFinalId(apiDataId, widgetId, title, values?.resourceId, source);

  const { schema, uiSchema } = useMemo(() => schemas ?? { schema: {}, uiSchema: {} }, [schemas]);
  const { modalSize = 'sm' } = uiSchema?.['ui:options'] ?? {};
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, namespace ?? '']);

  const finalApi = useDynamicApi(widgetId, values, source);
  const pageId = getFormIdFromWidgetId(widgetId);
  const { markButtonPress } = useButtonPress(`${apiDataId}_${title}`);
  const entityId = values?.resourceToEntity ?? widgetId?.split('_')[0];
  const callApi = useCallApiData(
    finalId,
    pageId,
    values,
    widgetId,
    source,
    notify,
    onSuccessCallback,
    onSuccessRedirect,
    values?.avoidClearApiData,
    parentId,
  );

  const { check: visible } = useCheckFrom(widgetId, visibilityFrom, true, source);
  const { check: disabledFromValue } = useCheckFrom(widgetId, disabledFrom, false, source);

  const { setTemporaryAttachment } = useEntity(getFormIdFromWidgetId(widgetId));
  const { formData, clearEntityFormData, setEntityFormData } = useEntityFormData(
    isEmpty(schemas) && !type?.includes('LOCALLY') ? '' : schema?.id ?? TRANSITION_FORM,
  );

  const dynamicAddToField: string = useMemo((): string => {
    if (!addToField) return '';
    if (addToField.includes('_')) return addToField;
    const baseId = widgetId?.split('-')[0] ?? '';
    return baseId ? `${baseId}_${addToField}` : addToField;
  }, [addToField, widgetId]);

  const { formData: pageEntityData } = useEntityFormData(pageId);
  const { filters } = useUserSettings();
  const { addItem } = useFormField(addToField);
  const { addItem: caseAddItem } = useFormField(dynamicAddToField);
  const { setFieldValue } = useFormField(widgetId);
  const { setLatestButtonAction } = useLatestButtonAction();

  const {
    saveTableData,
    addLocalTableRow,
    deleteLocalTableRow,
    editLocalTableRow,
    undoLocalTableRow,
  } = useTable(pageId);

  const { setActiveRow } = useTable(widgetId);
  const { isFormValid } = useFormValidity(pageId);
  const { forceDirty, clearDirtyFlags } = useFormManagerContext();
  const { enqueueSnackbar } = useNotifiers();
  const pageUiSchema = useContext(UISchemaContext);

  const onButtonClick = useMemo(() => {
    if (!isEmpty(schemas)) {
      return () => {
        if (type !== 'EDIT_CASE_ACTIVITY') {
          if (source) setEntityFormData(source, false, uiSchema['ui:page']?.customFieldsKey);
          else clearEntityFormData();
        }
        setOpenModal(true);
      };
    }

    if (onClick) {
      return (params) => {
        onClick(params, source);
        if (actionId) {
          setLatestButtonAction(actionId);
        }
      };
    }

    if (type === 'exportFilters') {
      return () => {
        exportFilters(filters);
      };
    }

    if (type === 'importFilters') {
      return (e) => {
        importFilters(e);
      };
    }

    if (type === 'SAVE_LOCAL_TABLE') {
      return () => {
        saveTableData(finalApi.url, entityId, finalApi?.method, finalApi?.data);
      };
    }
    if (type === 'UNDO_LOCALLY') {
      return () => {
        undoLocalTableRow({ rowData: source });
      };
    }
    if (type === 'DELETE_LOCALLY') {
      return () => {
        deleteLocalTableRow({ rowData: source });
      };
    }

    if (!onClick && source && type !== 'redirect' && !values) {
      return () => {
        const activeRow = {
          ...source,
          __ACTION__: action?.type ?? action?.title,
        };
        if (actionId) {
          setLatestButtonAction(actionId);
        }

        if (onSuccessCallback) {
          onSuccessCallback();
        }
        if (onRowActivated && typeof onRowActivated === 'function') {
          // @ts-ignore
          onRowActivated(activeRow);
        } else {
          setActiveRow(activeRow);
        }
      };
    }

    if (type === 'download') {
      const effectiveSource = source ?? pageEntityData;
      return () => {
        downloadFile(
          finalApi.url,
          effectiveSource?.fileName?.replace(/\.[^/.]+$/, ''),
          apiUrl,
          finalApi?.data,
        ).then(({ url, error }: AnyType) => {
          let finalError = error;

          if (error?.status === 403 || error?.status === 401) {
            finalError = { ...error, message: 'forbidden' };
          } else if (error?.status === 409) {
            finalError = { ...error, message: 'conflict' };
          }

          !error &&
            dispatch(
              EnqueueSnackbar({
                key: new Date().getTime().toString(),
                message: 'operationSuccessful',
              }),
            );
          !error && dispatch(SetFormServerErrors({ errors: {}, errorTypes: {} }));
          // @ts-ignore
          error && dispatch(EnqueueSnackbar(handlePayloadErrorsForToolkit(finalError)));
          error &&
            dispatch(
              SetFormServerErrors({
                errors: getBEValidations(pageId, error?.violations),
                errorTypes: getBEValidationTypes(pageId, error?.violationTypes),
              }),
            );
          setTemporaryAttachment(url);
        });
      };
    } else if (type === 'redirect') {
      return () => {
        document.title = '';
        const announcer = document.getElementById('route-announcer');
        if (announcer) {
          announcer.textContent = '';
        }
        if (!isExternal(finalApi.url)) {
          navigate(appendQueryParams(finalApi.url, finalApi.queryParams ?? {}), {
            state: { ...finalApi.data },
          });
        }
      };
    } else if (type === 'main') {
      return () => {
        callApi(pageId, formData, pageUiSchema);
        clearDirtyFlags(pageId);
      };
    } else {
      return () => {
        callApi(pageId, formData);
      };
    }
  }, [onClick, finalApi, pageId, callApi, isFormValid, source, action]);

  const wrappedOnButtonClick = useMemo(() => {
    if (!onButtonPress) {
      return onButtonClick;
    }
    return (...args: AnyType[]) => {
      onButtonPress();
      return (onButtonClick as AnyType)(...args);
    };
  }, [onButtonClick, onButtonPress]);

  const validateEntity = useMemo(() => {
    if (showClientValidations || type === 'main') {
      if (isFormValid) {
        return wrappedOnButtonClick;
      } else {
        return () => {
          if (shouldSetPageDirty) {
            forceDirty(pageId);
          }

          enqueueSnackbar({
            key: new Date().getTime().toString(),
            message: `${commonCodes['clientValidationErrors'] ? commonCodes['clientValidationErrors'] + ':' : ''} ${translate('clientValidationErrors', { ns: COMMON, lng: selectedLanguage })}`,
            severity: 'error',
            namespace: COMMON,
          });
          if (actionId) {
            setLatestButtonAction(actionId);
          }
        };
      }
    } else {
      return wrappedOnButtonClick;
    }
  }, [showClientValidations, wrappedOnButtonClick, type, shouldSetPageDirty]);

  const onCancel = useCallback(() => {
    setOpenModal(false);
    const timeoutId = setTimeout(() => {
      if (hasValue(formData)) {
        clearEntityFormData();
      }
    }, 0);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [clearEntityFormData, formData]);

  const onClose = useCallback(() => setOpenModal(false), []);
  const onSubmit = useCallback(() => {
    if (onClick && avoidSubmit) {
      onClick(formData);
    } else {
      if (!values) {
        markButtonPress();
      }

      const caseActivityInfoValues = {
        name: formData?.name,
        caseTypeActivityTypeCL: formData?.caseTypeActivityTypeCL,
        caseTypeActivityTypeCLDescription:
          formData?.caseTypeActivityTypeCLDescription ?? formData?.caseTypeActivityTypeCL,
        humanTaskTypeCode: formData?.humanTaskTypeCode,
        processTaskTypeCode: formData?.processTaskTypeCode,
        activityCaseTypeCode: formData?.activityCaseTypeCode,
        phaseCode: formData?.phaseCode,
        repeatAllowed: formData?.repeatAllowed,
        cancelAllowed: formData?.cancelAllowed,
        cancelReasonRequired: formData?.cancelReasonRequired,
      };

      switch (type) {
        case 'ADD_LOCALLY':
          if (addToField) {
            addItem(formData);
          } else {
            addLocalTableRow({ rowData: formData });
          }
          break;
        case 'ADD_CASE_ACTIVITY':
          if (dynamicAddToField) {
            caseAddItem({
              manuallyAddedSw: true,
              caseActivityStatusCL: formData?.caseActivityStatusCL ?? 'PENDING',
              caseActivityStatusCLDescription:
                formData?.caseActivityStatusCLDescription ?? 'Pending',
              caseTypeActivityInfo: caseActivityInfoValues,
              ...formData,
            });
            setAnnouncement(
              `${pageId}_activities-alert-help-text`,
              translate('newItemAdded', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              }),
            );
          } else {
            addLocalTableRow({ rowData: formData });
          }
          break;
        case 'DELETE_LOCALLY':
          deleteLocalTableRow({ rowData: formData });
          break;
        case 'UNDO_LOCALLY':
          undoLocalTableRow({ rowData: formData });
          break;
        case 'EDIT_LOCALLY':
          editLocalTableRow({ rowData: formData });
          break;
        case 'EDIT_CASE_ACTIVITY':
          {
            const prevState = formData;
            const updated = {
              ...prevState,
              caseTypeActivityInfo: {
                ...prevState?.caseTypeActivityInfo,
                ...caseActivityInfoValues,
              },
              order: formData?.order,
            };
            setFieldValue(updated);
          }
          break;
        default:
          callApi(pageId, formData, uiSchema);
          break;
      }
      onCancel();
    }
  }, [callApi, onCancel, pageId, formData, finalApi, uiSchema]);

  const finalTranslationKey = useMemo(() => {
    if (hasValue(title)) {
      return title;
    }

    if (type === 'redirect') {
      return 'genericRedirectButton';
    }

    if (hasValue(icon)) {
      return icon?.toLowerCase()?.trim();
    }

    return 'redirect';
  }, [title, type, icon]);

  const finalTranslationNamespace = useMemo(() => {
    if (hasValue(namespace)) {
      return namespace;
    }

    return COMMON;
  }, [namespace]);

  return {
    onSubmit,
    onCancel,
    onClose,
    onClick: validateEntity,
    visible,
    schema,
    uiSchema,
    modalSize,
    modalOpen: openModal,
    finalApi,
    disabledFromValue,
    title: translate(finalTranslationKey ?? 'redirect', {
      ns: finalTranslationNamespace,
      lng: selectedLanguage,
      label: refersTo,
    }),
  };
};

export default useActionButton;
