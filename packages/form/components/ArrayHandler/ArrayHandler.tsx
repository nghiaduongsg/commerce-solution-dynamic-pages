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
import SearchWidgetList from '@pkg-form/components/ConfigurableListWidget/SearchWidgetList';
import CardButton from '@pkg-common/atomics/CardButton/CardButton';
import { uniq } from 'lodash';
import ConfigurableSubformItem from '@pkg-form/templates/ArrayItem/ConfigurableSubformItem';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const focusRow = (rowIndex) => {
  const addedRows = document.querySelectorAll(`[aria-rowindex='${rowIndex}']`);

  if (addedRows?.length) {
    try {
      const children = addedRows[0]?.children;
      const buttons = children[children?.length - 1].getElementsByTagName('button');
      if (buttons?.length) {
        buttons[0].focus();
      }
    } catch {}
  }
};

const focusAddButton = (id) => {
  const addBtn = document.getElementById(id);

  if (addBtn) {
    try {
      addBtn.focus();
    } catch {}
  }
};

const getTypeFromSort = (defaultSortBy, columns) => {
  if (!columns || !defaultSortBy) {
    return;
  }

  const [key] = defaultSortBy.split(':');
  const column = columns.find((col) => col.sortBy?.field === key);

  return column?.type || 'string';
};

const ArrayHandler = (props) => {
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
  const { mechanism, changeIndicators: globalChangeIndicators } = formContext || {};
  const { clearParentFieldErrors } = useValidationsContext();
  const { clearDirtyFlags } = useFormManagerContext();
  const { selectedLanguage } = useSystem();

  const useDefaultMechanism = mechanism === 'DEFAULT';
  const {
    value: rawValue,
    addItem,
    removeItem,
    addItems,
  } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const [multiAddOpen, setMultiAddOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const value = useMemo(() => {
    return rawValue?.map((v, ind) => ({ ...v, __INDEX__: ind }));
  }, [rawValue]);

  useDisableValues({
    fieldId: id,
    items: value,
    options,
  });

  const {
    quickAdd,
    configuration,
    uniqueFields,
    validations,
    callApis,
    allowCardItemDialogActionsFrom,
    defaultValueFrom,
    clearFrom,
    omitAddNew = false,
    applyAddWhen,
    fullWidth = false,
    modalSize = 'md',
    subform,
    groupBy,
    translation,
    warnOnChange,
    changeIndicators,
  } = options;

  const { rowId, apiValues, url, defaultSortBy } = configuration || {};

  const {
    configuration: quickAddConfiguration,
    filterUiSchema: quickAddFilterUiSchema,
    filterSchema: quickAddFilterSchema,
    mapToProperty,
  } = quickAdd || {};

  const dataFromApi = !!(apiValues || url);

  const groups = useMemo(() => {
    if (groupBy) {
      return uniq(value?.map((v) => v[groupBy]));
    }
    return [];
  }, [value, groupBy]);
  const { whenToWarn, translation: warnTranslation } = warnOnChange || {};
  const { check: warnUnderCondition } = useCheckFrom(id, whenToWarn, false);

  const disabled = uiSchema['ui:disabled'];
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

  const [index, setIndex] = useState(-2);
  const parentId = getWidgetArrayParentId(id);

  const { setFieldValue: setActiveRowValue, value: activeRowValue } = useFormField(
    `${id}_${index}`,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const {
    activeRow,
    clearActiveRow,
    setAllTableData,
    triggerRefresh,
    tableData,
    setColumnData,
    setSortLocallyBy,
  } = useTable(id);
  const { clearSelections } = useTable(quickAddConfiguration?.tableId);

  const [visibleTableData, setVisibleTableData] = useState(value);
  const [query, setQuery] = useState('');

  const { check: allowModalButtons } = useCheckFrom(parentId, allowCardItemDialogActionsFrom);

  useDefaultValueFrom(id, defaultValueFrom);
  useClearFrom(id, clearFrom);

  useEffect(() => {
    return () => {
      if (cancel) {
        cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (dataFromApi) {
      return;
    }
    if (activeRow?.__INDEX__ >= 0) {
      const isView = activeRow?.__ACTION__?.toLowerCase() === 'view';
      if (isDisabled !== isView) return;

      if (activeRow?.__ACTION__ === 'delete') {
        removeItem(activeRow.__INDEX__);
        setAnnouncement(
          `${id}-alert-help-text`,
          translate('itemDeleted', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          }),
        );
      } else {
        setIndex(activeRow.__INDEX__);
        setOpenDialog(true);
        if (activeRow?.__ACTION__ === 'duplicate') {
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
          setActiveRowValue(null);
          clearActiveRow();
          setIndex(-1);
          setOpenDialog(false);
        }
      }
    }
  }, [activeRow, clearActiveRow, dataFromApi, isDisabled]);

  useEffect(() => {
    if (index === -1) {
      clearActiveRow();
    }
  }, [index, clearActiveRow]);

  const [_, cancel] = useDebounce(
    () => {
      if (!query) {
        return setVisibleTableData(value);
      }

      return setVisibleTableData(filterItems(value, query));
    },
    400,
    [query, value],
  );

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    if (configuration?.columns?.length) {
      setColumnData({ data: configuration.columns });
      initializedRef.current = true;
    }
  }, [configuration?.columns, setColumnData]);

  const tableInSynch = useMemo(() => {
    if (dataFromApi) {
      return true;
    }
    return tableData?.length === 0 && (visibleTableData || [])?.length === 0;
  }, [visibleTableData, tableData, dataFromApi]);

  useEffect(() => {
    if (index < 0 && !tableInSynch) {
      setAllTableData(visibleTableData);
    }
    if (defaultSortBy) {
      setSortLocallyBy(defaultSortBy, getTypeFromSort(defaultSortBy, configuration?.columns));
    }
  }, [visibleTableData, index, tableInSynch, defaultSortBy]);

  useEffect(() => {
    setAnnouncement(
      `${id}-alert-help-text`,
      translate('searchKeyApplied', { ns: ACCESSIBILITY, count: visibleTableData?.length }),
    );
  }, [query, visibleTableData]);

  const onCancel = useCallback(() => {
    // add
    if (!hasValue(activeRow) || activeRow?.__ACTION__ === 'delete') {
      removeItem(index);

      focusAddButton(`${id}-add-btn`);
      setOpenDialog(false);
    } else {
      //revert to old value
      if (activeRow?.__ACTION__ === 'edit' || activeRow?.__ACTION__ === 'add') {
        setActiveRowValue({ ...activeRow, __INDEX__: undefined, __ACTION__: undefined });
      }
      focusRow(activeRow.__INDEX__);
      setOpenDialog(false);
    }
    setIndex(-1);
    clearParentFieldErrors(id);
    clearDirtyFlags(id);
  }, [activeRow, index, id]);

  const onAddItem = useCallback(() => {
    setIndex(value?.length || 0);
    setOpenDialog(true);
    setQuery('');
    addItem({});
  }, [value]);

  const onSaveItem = useCallback(() => {
    setTimeout(() => {
      focusRow(index);
    });
    setIndex(-1);
    setOpenDialog(false);
    triggerRefresh();
    setAnnouncement(
      `${id}-alert-help-text`,
      translate('newItemAdded', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
        count: visibleTableData?.length,
      }),
    );
  }, [index]);

  const onActionCustomButtonCallback = useCallback(() => {
    setIndex(-1);
    setOpenDialog(false);
  }, []);

  const [openSearch, setOpenSearch] = useState(false);

  const keepDialogMounted = useMemo(() => {
    return !(subform && (subform.type === 'ELEMENTS' || subform.type === 'BANK_ELEMENTS'));
  }, [subform]);

  return (
    <>
      {value?.length > 0 &&
        callApis?.map((resource) => (
          <Resource key={resource.resourceId} resource={resource} widgetId={id} />
        ))}
      <ArrayErrorContainer fieldId={id} items={value} validations={validations} />
      {groupBy && (
        <Box mb={3}>
          <CardButton
            id={`${id}-add-btn`}
            message={translate(value?.length ? 'addNew' : 'noItemsAdded', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
            fullHeight
            ctaAction={onAddItem}
            ctaLabel={translate('addNew', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
            ariaDescription={translate('addButtonAriaLabel', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
              table: title,
            })}
          />
        </Box>
      )}
      {groupBy &&
        groups.length > 0 &&
        (groups as string[]).map((groupName) => (
          <GroupedTableData
            parentId={parentId}
            key={(configuration as any)?.[groupName]?.tableId ?? `${id}_${groupName}`}
            id={(configuration as any)?.[groupName]?.tableId ?? `${id}_${groupName}`}
            configuration={
              configuration?.[groupName] ?? {
                ...configuration,
                isDisabled,
                filterEntities: false,
                omitLinePreviewWhenDisabled: true,
                tableId: `${id}_${groupName}`,
              }
            }
            isDisabled={isDisabled}
            changeIndicators={globalChangeIndicators ?? changeIndicators}
          />
        ))}
      {!groupBy && (
        <>
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
                    onChange={(event) => setQuery(event.target.value.toLowerCase())}
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
                                setQuery('');
                                setOpenSearch(false);
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
                    ariaControls={index >= 0 ? id : undefined}
                    onClick={onAddItem}
                    icon={<AssetByType input="icons" name="AddCircle" />}
                  />
                )}
                {!!quickAdd && (
                  <GenericIconButton
                    id={`${id}-multi-add-btn`}
                    testId="multi-add-btn"
                    ariaLabel={translate('addButtonAriaLabel', {
                      ns: ACCESSIBILITY,
                      lng: selectedLanguage,
                      table: title,
                    })}
                    ariaHasPopup={'dialog'}
                    ariaControls={multiAddOpen ? `${id}-multi-add` : undefined}
                    onClick={() => setMultiAddOpen(true)}
                    icon={<AssetByType input="icons" name="Queue" />}
                  />
                )}
              </>
            }
          />
          {warnOnChange && warnUnderCondition && (
            <Alert style={{ width: '100%' }} severity="warning">
              {translate(`${warnTranslation?.warnMessageKey || ''}`, {
                ns: namespace,
                lng: selectedLanguage,
              })}
            </Alert>
          )}
        </>
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
                count: index + 1,
                ordinal: true,
              })
            : translate(activeRow?.__ACTION__ === 'edit' ? 'editItem' : 'addNewItem', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                title,
                count: index + 1,
                ordinal: true,
              })
        }
        fullWidth={fullWidth}
        size={modalSize}
        onClose={onCancel}
        keepMounted={keepDialogMounted}
        buttons={
          (!isDisabled || allowModalButtons) && (
            <ActionDialogButtons
              id={`${id}_${index}`}
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
            id={`${parentId}_${index}`}
            subform={subform}
            item={{ children: { props: { formData: activeRowValue } } }}
            disabled={disabled}
            namespace={namespace}
          />
        )}
        {subform && (subform.type === 'ELEMENTS' || subform.type === 'BANK_ELEMENTS') && (
          <DynamicSubformItem
            id={`${id}_${index}`}
            subform={subform}
            disabled={disabled}
            namespace={namespace}
            schema={{ ...schema?.items, type: 'object' }}
            uiSchema={{ ...uiSchema?.items, 'ui:labels': { namespace: formContext?.namespace } }}
            formData={activeRowValue || {}}
          />
        )}
        {!subform && (
          <DynamicForm
            id={`${id}_${index}`}
            schema={{ ...schema?.items, type: 'object' }}
            uiSchema={{ ...uiSchema?.items, 'ui:labels': { namespace: formContext?.namespace } }}
            disabled={isDisabled}
            data={activeRowValue || {}}
          />
        )}
      </SimpleDialog>

      <SimpleDialog
        id={`${id}-multi-add`}
        open={multiAddOpen}
        title={
          isDisabled
            ? translate('viewItem', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                title,
                count: index + 1,
                ordinal: true,
              })
            : translate(activeRow?.__ACTION__ === 'edit' ? 'editItem' : 'addNewItem', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                title,
                count: index + 1,
                ordinal: true,
              })
        }
        fullWidth={true}
        size={modalSize}
        onClose={onCancel}
        filters={true}
        isSimple={true}
      >
        <SearchWidgetList
          parentId={`${parentId}_auto-add`}
          entitySourceId={'BillSegment'}
          widgetLabel={'BillSegment'}
          fallbackSchemas={{
            schema: quickAddFilterSchema || {},
            uiSchema: quickAddFilterUiSchema || {},
            configuration: quickAddConfiguration || {},
          }}
          onSelectionsApplied={(s) => {
            if (!mapToProperty) {
              addItems(s);
            } else {
              addItems(
                s.map((s) => ({
                  ...s,
                  [mapToProperty]: {
                    [rowId]: s[rowId],
                    identificationLabel: s.identificationLabel,
                  },
                })),
              );
            }

            setMultiAddOpen(false);
            clearSelections();
          }}
          onCancel={() => {
            setMultiAddOpen(false);
            clearSelections();
          }}
        />
      </SimpleDialog>
    </>
  );
};

const GroupedTableData = ({ parentId, id, configuration, isDisabled, changeIndicators }) => {
  const { selectedLanguage } = useSystem();

  const namespace = useMemo(() => {
    if (!configuration) {
      return '';
    }
    return configuration['ui:labels']?.namespace;
  }, [configuration]);

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);

  const title = useMemo(() => {
    return translate(id, { ns: namespace, lng: selectedLanguage });
  }, [translate, id, namespace, selectedLanguage]);

  if (!configuration) {
    return <Box mb={2}>Configuration not found for {id}</Box>;
  }

  return (
    <Box mb={2}>
      <GenericTable
        parentId={parentId}
        filterSchema={{}}
        filterUiSchema={{}}
        maintainFilters={true}
        configuration={{
          ...configuration,
          isDisabled,
          filterEntities: false,
          tableId: id,
          title,
        }}
        changeIndicators={changeIndicators}
        filterSaveSupport={false}
      />
    </Box>
  );
};

export default ArrayHandler;
