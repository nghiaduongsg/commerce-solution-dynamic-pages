import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GenericTable from '@pkg-list/components/GenericTable';
import useFormField from '@pkg-entity/hooks/useFormField';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import ActionDialogButtons from '@pkg-common/components/AppActions/ActionDialogButtons';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useTable from '@pkg-list/hooks/useTable';
import { hasValue } from '@pkg-common/utils';
import { getWidgetArrayParentId } from '@pkg-form/validations/utils/widgetUtils';
import { Alert, Box, InputAdornment, TextField } from '@mui/material';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { useTranslation } from 'react-i18next';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import { filterItems } from '@pkg-form/components/ArrayHandler/utils';
import Resource from '@pkg-common/components/Resource/Resource';
import ArrayErrorContainer from '@pkg-form/templates/ArrayTemplate/ArrayErrorContainer';
import { cleanDuplicatedData, setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useClearFrom from '@pkg-form/hooks/useClearFrom';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTheme } from '@mui/material/styles';
import { useDebounce } from 'react-use';
import useDisableValues from '@pkg-form/templates/ArrayTemplate/hooks/useDisableValues';
import DynamicSubformItem from '@pkg-form/templates/ArrayItem/DynamicSubformItem';
import ConfigurableSubformItem from '@pkg-form/templates/ArrayItem/ConfigurableSubformItem';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import TableHelperContext from './TableHelperContext';
import useEntity from '@pkg-entity/hooks/useEntity';
import usePrevious from 'react-use/lib/usePrevious';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useValueFrom from '@pkg-form/hooks/useValueFrom';

const focusRow = (rowId: string) => {
  const row = document.getElementById(rowId);
  if (row) {
    row.focus();
  }
};

/**
 * This is a more efficient version of ArrayHandler.
 * The aim is to replace the old version of ArrayHandler.
 * To have a smooth transition, this version will be used only in certain pages.
 */

const ArrayHandlerV2 = (props) => {
  const theme = useTheme();

  const {
    id,
    options,
    formContext,
    onChange,
    value: innerValue,
    schema,
    uiSchema,
    disabled: isArrayDisabled,
  } = props;
  const parentId = getWidgetArrayParentId(id);
  const { mechanism, changeIndicators: globalChangeIndicators, formId } = formContext || {};
  const { selectedLanguage } = useSystem();

  const useDefaultMechanism = mechanism === 'DEFAULT';
  const {
    value: rawValue,
    addItem,
    removeItem,
  } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [actionCompleteSignal, setActionCompleteSignal] = useState(0);
  const signalRef = useRef(actionCompleteSignal);
  const [activeRow, setActiveRow] = useState<{
    __ACTION__?: 'edit' | 'add' | 'view' | 'duplicate' | 'delete';
    __INDEX__?: number;
  }>({});

  const value = useMemo(() => {
    return rawValue?.map((v, ind) => ({ ...v, __INDEX__: ind }));
  }, [rawValue]);

  const {
    configuration,
    uniqueFields,
    validations,
    callApis,
    allowCardItemDialogActionsFrom,
    defaultValueFrom,
    valueFrom,
    clearFrom,
    omitAddNew = false,
    applyAddWhen,
    fullWidth = false,
    modalSize = 'md',
    subform,
    translation,
    warnOnChange,
    changeIndicators,
  } = options;

  const { apiValues, url, rowId } = configuration || {};
  const dataFromApi = !!(apiValues || url);
  const disabled = uiSchema['ui:disabled'];
  const { clearParentFieldErrors, isFormValid } = useValidationsContext();
  const { clearDirtyFlags } = useFormManagerContext();
  const valid = isFormValid(id);

  const { whenToWarn, translation: warnTranslation } = warnOnChange || {};
  const { check: warnUnderCondition } = useCheckFrom(id, whenToWarn, false);

  const isDisabled = useMemo(() => {
    return disabled || isArrayDisabled;
  }, [disabled, isArrayDisabled]);

  const namespace = useMemo(() => {
    if (!configuration) {
      return '';
    }
    return configuration['ui:labels']?.namespace;
  }, [configuration]);

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);

  const { check: applyUnderCondition } = useCheckFrom(id, applyAddWhen);
  useDisableValues({
    fieldId: id,
    items: value,
    options,
    isDisabled,
  });

  const title = useMemo(() => {
    return translate(configuration?.title ?? translation?.key, {
      ns: namespace,
      lng: selectedLanguage,
    });
  }, [translate, translation, namespace, selectedLanguage, configuration?.title]);

  const shouldApplyAddNew = useMemo(() => {
    let shouldApply = true;

    if (applyAddWhen) {
      shouldApply = applyUnderCondition;
    }

    return shouldApply;
  }, [id, applyUnderCondition, applyAddWhen]);

  const hasCustomModalButtons = useMemo(() => {
    return !!uiSchema?.['ui:modal:buttons'];
  }, [uiSchema]);

  const showAddNew = useMemo(() => {
    return !isDisabled && !omitAddNew && shouldApplyAddNew;
  }, [isDisabled, omitAddNew, shouldApplyAddNew]);

  const { triggerRefresh, setAllTableData, initialised } = useTable(id);
  const { serverUpdate } = useEntity(formId);

  const { setFieldValue: setActiveRowValue, value: activeRowValue } = useFormField(
    `${id}_${activeRow?.__INDEX__}`,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { check: allowModalButtons } = useCheckFrom(parentId, allowCardItemDialogActionsFrom);
  useDefaultValueFrom(id, defaultValueFrom);
  useValueFrom(id, valueFrom);
  useClearFrom(id, clearFrom);

  const previousValueLength = usePrevious(value?.length || 0);

  const [_, cancel] = useDebounce(
    () => {
      if (hasValue(query)) {
        const results = filterItems(value, query);
        setAllTableData(results);
        setAnnouncement(
          `${id}-alert-help-text`,
          translate('searchKeyApplied', { ns: ACCESSIBILITY, count: results?.length }),
        );
      }
    },
    400,
    [query, value],
  );

  const onCancel = useCallback(() => {
    const action = activeRow?.__ACTION__?.toLowerCase();

    setOpenDialog(false);

    // Revert changes
    if (action === 'edit') {
      setActiveRowValue({ ...activeRow, __INDEX__: undefined, __ACTION__: undefined });
      clearDirtyFlags(id);
      if (!valid) {
        clearParentFieldErrors(id);
      }
    } else if (action === 'add') {
      setTimeout(() => {
        removeItem(activeRow?.__INDEX__ as number);
      });
      clearDirtyFlags(id);
      if (!valid) {
        clearParentFieldErrors(id);
      }
    }

    setTimeout(() => {
      focusRow(`${activeRow[rowId]}-${id}`);
      setActiveRow({});
    }, 0);
  }, [activeRow, id, valid, rowId]);

  const onAddItem = useCallback(() => {
    setActiveRow({ __ACTION__: 'add', __INDEX__: value?.length ?? 0 });
    addItem({});
  }, [value?.length]);

  const onSaveItem = useCallback(() => {
    setOpenDialog(false);

    if (dataFromApi) {
      triggerRefresh();
    } else {
      setAllTableData(value);
    }

    const action = activeRow?.__ACTION__;

    setAnnouncement(
      `${id}-alert-help-text`,
      translate(action === 'add' ? 'newItemAdded' : 'itemEdited', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
        count: value?.length,
      }),
    );

    setTimeout(() => {
      focusRow(`${activeRow[rowId]}-${id}`);
      setActiveRow({});
    }, 0);
  }, [dataFromApi, value, activeRow?.__ACTION__, rowId, id, selectedLanguage]);

  const onActionCustomButtonCallback = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const syncTableWIthValue = useCallback(() => {
    setAllTableData(value);
  }, [value]);

  useEffect(() => {
    const hasDefaultValue = !!(valueFrom || defaultValueFrom);
    // case of deletion
    const synchAfterDeletion = previousValueLength > value?.length || 0;
    // case of initial default value and reload value from useValueFrom
    const synchFromValueHook = hasDefaultValue && !!value?.length;

    if (synchAfterDeletion || synchFromValueHook) {
      syncTableWIthValue();
    }
  }, [value, previousValueLength, valueFrom, defaultValueFrom]);

  useEffect(() => {
    if (actionCompleteSignal > 0 && signalRef.current !== actionCompleteSignal) {
      signalRef.current = actionCompleteSignal;
      syncTableWIthValue();
    }
  }, [actionCompleteSignal, syncTableWIthValue]);

  useEffect(() => {
    if (initialised && hasValue(serverUpdate) && (serverUpdate ?? 0) > 0) {
      syncTableWIthValue();
    }
  }, [initialised, serverUpdate]);

  useEffect(() => {
    const activeIndex = activeRow?.__INDEX__;

    if (dataFromApi || !hasValue(activeIndex)) {
      return;
    }

    const action = activeRow?.__ACTION__?.toLowerCase();
    if (isDisabled && action !== 'view') {
      return;
    }

    if (action === 'view' || action === 'edit' || action === 'add') {
      setOpenDialog(true);
      return;
    }

    if (action === 'delete') {
      removeItem(activeIndex as number);
      setAnnouncement(
        `${id}-alert-help-text`,
        translate('itemDeleted', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        }),
      );
    }

    if (action === 'duplicate') {
      addItem(
        cleanDuplicatedData(uniqueFields, {
          ...activeRow,
          __INDEX__: undefined,
          __ACTION__: undefined,
        }),
      );

      setAnnouncement(
        `${id}-alert-help-text`,
        translate('itemDuplicated', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        }),
      );

      setActionCompleteSignal(new Date().getTime());
    }
  }, [activeRow, dataFromApi, isDisabled, selectedLanguage]);

  return (
    <>
      {value?.length > 0 &&
        callApis?.map((resource) => (
          <Resource key={resource.resourceId} resource={resource} widgetId={id} />
        ))}
      <ArrayErrorContainer fieldId={id} items={value} validations={validations} />
      <TableHelperContext.Provider value={{ onRowActivated: setActiveRow as any }}>
        <GenericTable
          parentId={parentId}
          filterSchema={{}}
          filterUiSchema={{}}
          maintainFilters={true}
          filterSaveSupport={false}
          changeIndicators={globalChangeIndicators ?? changeIndicators}
          configuration={{
            ...configuration,
            isDisabled,
            filterEntities: false,
            tableId: id,
            title,
          }}
          initialState={JSON.stringify({ pageData: value })}
          delayInitialisation={true}
          headerContent={
            <>
              <Box
                id={`${id}-alert-help-text`}
                role={'alert'}
                aria-live={'polite'}
                sx={{ marginRight: theme.spacing(1), fontSize: theme.typography.body2.fontSize }}
              />
              {!openSearch && (
                <GenericIconButton
                  id={`search-button`}
                  testId={`search-button`}
                  ariaLabel={translate('openSearchKeyButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                    table: title,
                  })}
                  onClick={() => setOpenSearch(!openSearch)}
                  icon={
                    <AssetByType
                      input="icons"
                      name="Search"
                      props={query ? { color: theme.palette.primary.dark } : {}}
                    />
                  }
                />
              )}
              {openSearch && (
                <TextField
                  size="small"
                  onChange={(event) => {
                    const searchKey = event.target.value.toLowerCase();
                    if (!hasValue(searchKey)) {
                      setQuery(null);
                      setAllTableData(value);
                    } else {
                      setQuery(searchKey);
                    }
                  }}
                  value={query}
                  autoFocus
                  slotProps={{
                    htmlInput: {
                      ['data-testid']: 'menu-searchField',
                      'aria-label': translate('searchKeyFieldAriaLabel', {
                        ns: ACCESSIBILITY,
                        lng: selectedLanguage,
                        table: title,
                      }),
                      tabIndex: 0,
                      role: 'searchbox',
                    },
                    input: {
                      style: { padding: theme.spacing(0.5, 1) },
                      endAdornment: (
                        <InputAdornment position="end">
                          <GenericIconButton
                            id={`${id}-close-search-btn`}
                            testId="close-search-btn"
                            ariaLabel={translate('clearSearchKeyButtonAriaLabel', {
                              ns: COMMON,
                              lng: selectedLanguage,
                              table: title,
                            })}
                            onClick={() => {
                              setOpenSearch(false);
                              setQuery(null);
                              setAllTableData(value);
                              setAnnouncement(
                                `${id}-search-key-clear`,
                                translate('searchKeyCleared', {
                                  ns: ACCESSIBILITY,
                                  lng: selectedLanguage,
                                }),
                              );
                            }}
                            icon={<AssetByType input="icons" name="Clear" />}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
              {showAddNew && (
                <GenericIconButton
                  id={`${id}-add-btn`}
                  testId="add-btn"
                  ariaLabel={translate('addButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                    table: title,
                  })}
                  ariaHasPopup={'dialog'}
                  ariaControls={(activeRow?.__INDEX__ ?? -1) >= 0 ? id : undefined}
                  onClick={onAddItem}
                  icon={<AssetByType input="icons" name="AddCircle" />}
                />
              )}
            </>
          }
        />
      </TableHelperContext.Provider>
      {warnOnChange && warnUnderCondition && (
        <Alert style={{ width: '100%' }} severity="warning">
          {translate(`${warnTranslation?.warnMessageKey || ''}`, {
            ns: namespace,
            lng: selectedLanguage,
          })}
        </Alert>
      )}

      <SimpleDialog
        id={id}
        open={openDialog}
        title={
          isDisabled
            ? translate('viewItem', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                title,
                count: (activeRow?.__INDEX__ ?? 0) + 1,
                ordinal: true,
              })
            : translate(activeRow?.__ACTION__ === 'edit' ? 'editItem' : 'addNewItem', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                title,
                count: (activeRow?.__INDEX__ ?? 0) + 1,
                ordinal: true,
              })
        }
        fullWidth={fullWidth}
        size={modalSize}
        onClose={onCancel}
        keepMounted={false}
        buttons={
          (!isDisabled || allowModalButtons) && (
            <ActionDialogButtons
              id={`${id}_${activeRow?.__INDEX__}`}
              onSubmit={hasCustomModalButtons ? undefined : onSaveItem}
              onCancel={onCancel}
              buttons={uiSchema?.['ui:modal:buttons']}
              onSuccessCallback={onActionCustomButtonCallback}
            />
          )
        }
      >
        {subform && subform.type === 'SUB_SCHEMA' && (
          <ConfigurableSubformItem
            id={`${parentId}_${activeRow?.__INDEX__}`}
            subform={subform}
            item={{ children: { props: { formData: activeRowValue } } }}
            disabled={disabled}
            namespace={namespace}
            formId={formId}
          />
        )}
        {subform && (subform.type === 'ELEMENTS' || subform.type === 'BANK_ELEMENTS') && (
          <DynamicSubformItem
            id={`${id}_${activeRow?.__INDEX__}`}
            subform={subform}
            disabled={isDisabled}
            namespace={namespace}
            schema={{ ...schema?.items, type: 'object' }}
            uiSchema={{
              ...uiSchema?.items,
              'ui:labels': { namespace: formContext?.namespace },
              'ui:disabled': isDisabled,
            }}
            formData={activeRowValue || {}}
            formId={formId}
          />
        )}
        {!subform && (
          <DynamicForm
            id={`${id}_${activeRow?.__INDEX__}`}
            schema={{ ...schema?.items, type: 'object' }}
            uiSchema={{
              ...uiSchema?.items,
              'ui:labels': { namespace: formContext?.namespace },
              'ui:disabled': isDisabled,
            }}
            disabled={isDisabled}
            data={activeRowValue || {}}
          />
        )}
      </SimpleDialog>
    </>
  );
};

export default ArrayHandlerV2;
