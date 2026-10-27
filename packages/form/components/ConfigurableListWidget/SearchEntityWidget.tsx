import { SearchEntityWidgetProps } from './SearchEntityWidget.d';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import GenericTextField from '@pkg-common/atomics/GenericTextField/GenericTextField';
import { Tooltip, InputAdornment, Box, Chip, Alert } from '@mui/material';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import SearchWidgetList from '@pkg-form/components/ConfigurableListWidget/SearchWidgetList';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { SEARCH_FORM } from '@pkg-constants/screenTypeIds';
import {
  getFieldValue,
  widgetHasValue,
  getFieldLabel,
} from '@pkg-form/components/ConfigurableListWidget/utils/formWidgetUtils';
import useTable from '@pkg-list/hooks/useTable';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { AnyType } from '@pkg-common/types';
import useFormField from '@pkg-entity/hooks/useFormField';
import { useTranslation } from 'react-i18next';
import { getSchemasStoreId } from '@pkg-core/schemas/SchemasController';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import { arrayToMap, hasValue } from '@pkg-common/utils/utils';
import useSystem from '@pkg-setup/src/system/useSystem';
import useActionButton from '@pkg-common/components/AppActions/useActionButton';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import IstLoader from '@pkg-common/atomics/IstLoader/IstLoader';
import InfoTooltip from '@pkg-common/components/InfoTooltip/InfoTooltip';
import { useTheme } from '@mui/material/styles';
import QuickSearchField from '@pkg-form/components/ConfigurableListWidget/QuickSearchField';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const getStyles = () => {
  return {
    contentContainerStyles: {
      display: 'flex',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      minWidth: 0,
      color: '#555555',
      width: '100%',
      cursor: 'pointer',
    },
    multipleContentContainerStyles: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      color: '#555555',
      width: '500px',
      cursor: 'pointer',
    },
  };
};

const result = (arr, val) => {
  return arr.filter((item) => item !== val);
};

const SearchEntityWidget = ({
  parentId = '',
  value,
  onChange,
  entitySourceId,
  selectAll,
  idKeyAs,
  namespace,
  fieldKeyAs,
  entityIdKey: entityIdKeyProvided,
  entityFields = [],
  entitySource,
  isFlat = false,
  uiSchema,
  schema,
  warnOnChange,
  configuration,
  linkRoute,
  options,
  widgetLabel,
  formContext,
  excludeFromLabel = [],
  valid = true,
  filters = false,
  searchById = {
    enabled: false,
    idParam: 'ids',
  },
}: SearchEntityWidgetProps) => {
  const theme = useTheme();
  const styles = getStyles();
  const {
    tableId = entitySourceId,
    inlineOpen = false,
    modalActionButtons,
    multiline = false,
    rows,
    rowId,
  } = configuration || {};
  const { multiple } = configuration?.selections || {
    enabled: true,
    multiple: false,
  };

  const { showLabel = true, translation } = options || {};
  const { placeholder } = translation || {};

  const [open, setOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [itemsToDelete, setItemsToDelete] = useState<Record<string, unknown>[]>([]);

  const { allSymbol, selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, COMMON, ACCESSIBILITY]);

  const { labelUppercase, label, helpText, omitValidationHints, required } = useWidgetUtils(
    schema,
    options,
    formContext,
    parentId,
  );

  const { setSelections, rowIdKey: entityIdKeyStore, selectedRows } = useTable(tableId);

  const { onSubmit } = useActionButton(tableId, {
    values: modalActionButtons,
    title: 'save',
  });

  const { hasError: hasErrorButton, finished } = useApiDataState(
    modalActionButtons?.resourceId || '',
  );
  const { hasError } = useApiDataState(getSchemasStoreId(entitySourceId, SEARCH_FORM));
  const { whenToWarn, translation: warnTranslation } = warnOnChange || {};
  const { check: warnUnderCondition } = useCheckFrom(tableId, whenToWarn, false);

  const useDefaultMechanism = formContext?.mechanism === 'DEFAULT';

  const { setFieldValue } = useFormField(
    parentId,
    useDefaultMechanism
      ? {
          value,
          onChange,
        }
      : undefined,
  );

  const entityIdKey = useMemo(() => {
    return entityIdKeyStore && entityIdKeyStore.length > 0 ? entityIdKeyStore : entityIdKeyProvided;
  }, [entityIdKeyStore, entityIdKeyProvided]);

  const finalRowIdKey = useMemo(() => {
    return idKeyAs || entityIdKey || '';
  }, [idKeyAs, entityIdKey]);

  const valueExists = useMemo(() => {
    return widgetHasValue(value, isFlat, finalRowIdKey, multiple);
  }, [value, isFlat, finalRowIdKey, multiple]);

  const selectedRowIds = useMemo(() => {
    if (!valueExists) {
      return { 0: {} };
    }
    return multiple
      ? value.reduce((acc, curr) => {
          !isFlat ? (acc[curr[finalRowIdKey]] = true) : (acc[curr] = true);
          return acc;
        }, {})
      : !isFlat
        ? { [value[finalRowIdKey]]: true }
        : { [value]: true };
  }, [multiple, value, finalRowIdKey, isFlat, valueExists]);

  const mappedData = useMemo(() => {
    if (!multiple) {
      return [];
    }

    return arrayToMap(
      value?.map((item) => ({ ...item, [entityFields[0]]: item[fieldKeyAs || ''] })),
      rowId,
    );
  }, [multiple, value, fieldKeyAs, entityFields, rowId]);

  const shouldReverseValue = useMemo(() => {
    return (
      finished && hasErrorButton && setItemsToDelete?.length > 0 && modalActionButtons?.resourceId
    );
  }, [finished, hasErrorButton, setItemsToDelete, modalActionButtons?.resourceId]);

  const fieldFullLabel = useMemo(() => {
    return getFieldLabel(
      multiple && hasValue(value) ? value[0] : value,
      isFlat,
      fieldKeyAs ? [fieldKeyAs] : entityFields,
      excludeFromLabel,
      finalRowIdKey,
    );
  }, [multiple, value, isFlat, fieldKeyAs, entityFields, excludeFromLabel, finalRowIdKey]);

  const [loadingEntity, setLoadingEntity] = useState<boolean>(false);
  const [loadingEntityError, setLoadingEntityError] = useState<string | null>(null);

  useEffect(() => {
    if (!firstLoad && modalActionButtons) {
      onSubmit();
    }
  }, [value, firstLoad, modalActionButtons]);

  // Reverse value if call api fails
  useEffect(() => {
    if (shouldReverseValue) {
      setFieldValue([...value, ...itemsToDelete]);
      setItemsToDelete([]);
    }
  }, [shouldReverseValue, setItemsToDelete, itemsToDelete, value]);

  useEffect(() => {
    if (!showDialog) {
      const selectedPrev = Object.values(selectedRows).filter((key) => !!key);
      const selected = Object.values(selectedRowIds).filter((key) => !!key);
      if (selectedPrev?.length > selected?.length) {
        setSelections(selectedRowIds);
      }
    }
  }, [showDialog, selectedRows, selectedRowIds]);

  useEffect(() => {
    if (showDialog) {
      window.LIST = tableId;
      setSelections(selectedRowIds);
    }
  }, [tableId, showDialog]);

  const setGlobalListToParent = useCallback(() => {
    const parentEntity = parentId?.split('-')?.[0];
    if (parentEntity) {
      window.LIST = parentEntity;
    }
  }, [parentId]);

  // Apply modal button
  const onSelectionsApplied = useCallback(
    (selectedEntities) => {
      if (selectedEntities && selectedEntities.length > 0) {
        const fieldValue = multiple
          ? selectedEntities
              .filter((item) => !!item)
              .map((selected) =>
                getFieldValue(isFlat, selected, entityIdKey, entityFields, idKeyAs, fieldKeyAs),
              )
          : getFieldValue(
              isFlat,
              selectedEntities[0],
              entityIdKey,
              entityFields,
              idKeyAs,
              fieldKeyAs,
            );

        setFieldValue(fieldValue);
        setShowDialog(false);
        setFirstLoad(false);
        setGlobalListToParent();
      }
      if (inlineOpen) {
        setOpen(false);
      }
    },
    [multiple, isFlat, entityIdKey, idKeyAs, fieldKeyAs, onChange],
  );

  // Clear all button from field
  const onClear = useCallback(() => {
    if (multiple) {
      setFieldValue([]);
    } else {
      setFieldValue(isFlat ? undefined : {});
    }
    setLoadingEntityError(null);
  }, [setFieldValue, isFlat]);

  const onCancel = useCallback(() => {
    setShowDialog(false);
    setGlobalListToParent();
  }, []);

  const onSelectAll = useCallback(() => {
    onCancel();
    if (!multiple) {
      setFieldValue(allSymbol);
    } else {
      setFieldValue([{ [finalRowIdKey]: allSymbol }]);
    }
  }, [onCancel, multiple, setFieldValue, finalRowIdKey, allSymbol]);

  const enableSearchIdField = searchById?.enabled || entitySourceId === 'BillSegment';

  const inputProps = useMemo(() => {
    const genericStyle: AnyType = {
      startAdornment: (
        <div style={valueExists && multiple ? { width: '87%' } : { width: '70%' }}>
          <Box
            id={`${parentId}`}
            data-testid={`${parentId}_value`}
            onClick={() => setShowDialog(true)}
            sx={multiple ? styles.multipleContentContainerStyles : styles.contentContainerStyles}
          >
            {multiple && hasValue(value) ? (
              value.map((v) => (
                <Tooltip
                  key={`${parentId}_${v}`}
                  title={getFieldLabel(
                    v,
                    isFlat,
                    fieldKeyAs ? [fieldKeyAs] : entityFields,
                    excludeFromLabel,
                    finalRowIdKey,
                  )}
                  placement="top"
                  role="tooltip"
                >
                  <Chip
                    id={`${parentId}_${v}`}
                    data-testid={`${parentId}-${v}`}
                    size="medium"
                    onDelete={() => {
                      const valueToDelete = value?.find((item) => item === v);
                      if (valueToDelete && valueToDelete[finalRowIdKey]) {
                        setFieldValue(result(value, v));
                        setFirstLoad(false);
                        if (modalActionButtons?.resourceId) {
                          setItemsToDelete([valueToDelete]);
                        }
                      }
                    }}
                    clickable={false}
                    label={getFieldLabel(
                      v,
                      isFlat,
                      fieldKeyAs ? [fieldKeyAs] : entityFields,
                      excludeFromLabel,
                      finalRowIdKey,
                    )}
                    variant="outlined"
                  />
                </Tooltip>
              ))
            ) : (
              <Tooltip title={fieldFullLabel} placement="top" role="tooltip">
                <Box
                  id={`${parentId}_value`}
                  onClick={() => setShowDialog(true)}
                  sx={styles.contentContainerStyles}
                >
                  {fieldFullLabel}
                </Box>
              </Tooltip>
            )}
          </Box>
        </div>
      ),
      style: {
        maxWidth: 600,
        justifyContent: 'space-between',
      },
    };
    if (valueExists) {
      genericStyle.endAdornment = (
        <InputAdornment position="end">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              flexWrap: 'nowrap',
              maxWidth: '100%',
              flexDirection: 'row',
            }}
          >
            {selectAll && (
              <GenericIconButton
                id={`${parentId}-selectAllListButton`}
                testId={'selectAllListButton'}
                ariaLabel={translate('selectAllAriaLabel', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                })}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectAll();
                }}
                icon={
                  <AssetByType
                    input="icons"
                    name="PlaylistAddCheck"
                    props={{ color: 'secondary' }}
                  />
                }
              />
            )}
            {onClear && (
              <GenericIconButton
                id={`${parentId}-formEntityCancelButton`}
                testId={'formEntityCancelButton'}
                ariaLabel={translate('clearSelectionAriaLabel', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                  label,
                })}
                onClick={() => {
                  onClear();
                  setFirstLoad(false);
                  if (modalActionButtons?.resourceId) {
                    setItemsToDelete(value);
                  }
                }}
                icon={<AssetByType input="icons" name="Cancel" />}
              />
            )}
            {multiple && (
              <GenericIconButton
                id={`${parentId}-openListButton`}
                testId={`${parentId}-openListButton`}
                ariaLabel={translate('openListAriaLabel', {
                  label,
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                })}
                ariaHasPopup={true}
                onClick={() => setShowDialog(true)}
                icon={<AssetByType input="icons" name="List" />}
              />
            )}

            {linkRoute && value !== allSymbol && (
              <AppActions
                page={{
                  id: parentId,
                  refersTo: fieldFullLabel,
                }}
                actions={{
                  buttons: [
                    {
                      type: 'redirect',
                      style: 'icon',
                      values: linkRoute || {},
                      permissionKey: 'defaultItemActions',
                      namespace: COMMON,
                    },
                  ],
                }}
                checkPermissions={true}
              />
            )}
          </Box>
        </InputAdornment>
      );
    } else if (enableSearchIdField) {
      genericStyle.startAdornment = (
        <QuickSearchField
          parentId={parentId}
          onPasteInitiated={() => {
            setLoadingEntity(true);
            setLoadingEntityError(null);
          }}
          onPasteComplete={(value) => {
            onSelectionsApplied([value]);
            setLoadingEntity(false);
          }}
          onPasteError={(error) => {
            setLoadingEntity(false);
            setLoadingEntityError(error);
          }}
          entitySourceId={entitySourceId}
          configuration={configuration}
          dataTestId={formContext?.dataTestId}
          searchIdParam={searchById?.idParam}
        />
      );
      genericStyle.endAdornment = (
        <InputAdornment position="end">
          {loadingEntity && <IstLoader busy={loadingEntity} />}
          {loadingEntityError && (
            <InfoTooltip
              id={`${parentId}-loadingEntityError`}
              icon={
                <AssetByType
                  input="icons"
                  name="ErrorOutline"
                  props={{ sx: { color: theme.palette.error.main } }}
                />
              }
              message={loadingEntityError}
              dataTestId={`${parentId}-loadingEntityError`}
            />
          )}
          {selectAll && (
            <GenericIconButton
              id={`${parentId}-selectAllListButton`}
              testId={'selectAllListButton'}
              ariaLabel={translate('selectAll', { ns: COMMON, lng: selectedLanguage })}
              ariaHasPopup={true}
              ariaExpanded={showDialog}
              ariaControls={showDialog ? `${parentId}_dialogContent` : undefined}
              onClick={(event) => {
                event.stopPropagation();
                onSelectAll();
              }}
              icon={
                <AssetByType input="icons" name="PlaylistAddCheck" props={{ color: 'secondary' }} />
              }
            />
          )}

          <GenericIconButton
            id={`${parentId}-openListButton`}
            testId={`${parentId}-openListButton`}
            ariaLabel={translate('openList', {
              label: label,
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            ariaHasPopup={'dialog'}
            ariaExpanded={showDialog}
            ariaControls={showDialog ? `${parentId}_dialogContent` : undefined}
            onClick={() => {
              setShowDialog(true);
              setOpen(true);
            }}
            icon={<AssetByType input="icons" name="List" />}
          />
        </InputAdornment>
      );
    } else {
      genericStyle.startAdornment = (
        <InputAdornment position="start" sx={{ maxWidth: '100%', overflow: 'hidden' }}>
          <Box
            id={`${parentId}_value`}
            onClick={() => setShowDialog(true)}
            sx={{
              display: 'block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              minWidth: '100%',
            }}
          >
            {translate(placeholder ?? 'clickToChoose', {
              ns: placeholder ? namespace : COMMON,
              list: label,
              lng: selectedLanguage,
            })}
          </Box>
        </InputAdornment>
      );
      genericStyle.endAdornment = (
        <InputAdornment position="end">
          {loadingEntity && <IstLoader busy={loadingEntity} />}
          {loadingEntityError && (
            <InfoTooltip
              id={`${parentId}-loadingEntityError`}
              icon={
                <AssetByType
                  input="icons"
                  name="ErrorOutline"
                  props={{ sx: { color: theme.palette.error.main } }}
                />
              }
              message={loadingEntityError}
              dataTestId={`${parentId}-loadingEntityError`}
            />
          )}
          {selectAll && (
            <GenericIconButton
              id={`${parentId}-selectAllListButton`}
              testId={'selectAllListButton'}
              ariaLabel={translate('selectAll', { ns: COMMON, lng: selectedLanguage })}
              ariaHasPopup={true}
              ariaExpanded={showDialog}
              ariaControls={showDialog ? `${parentId}_dialogContent` : undefined}
              onClick={(event) => {
                event.stopPropagation();
                onSelectAll();
              }}
              icon={
                <AssetByType input="icons" name="PlaylistAddCheck" props={{ color: 'secondary' }} />
              }
              styles={{ alignSelf: 'flex-end' }}
            />
          )}

          <GenericIconButton
            id={`${parentId}-openListButton`}
            testId={`${parentId}-openListButton`}
            ariaLabel={translate('openList', {
              label: label,
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            ariaHasPopup={'dialog'}
            ariaExpanded={showDialog}
            ariaControls={showDialog ? `${parentId}_dialogContent` : undefined}
            onClick={() => {
              setShowDialog(true);
              setOpen(true);
            }}
            icon={<AssetByType input="icons" name="List" />}
          />
        </InputAdornment>
      );
    }
    return genericStyle;
  }, [
    value,
    isFlat,
    multiple,
    entityIdKey,
    label,
    onSelectAll,
    loadingEntity,
    loadingEntityError,
    searchById,
    entitySourceId,
  ]);

  if (inlineOpen) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          alignItems: 'center',
        }}
      >
        <GenericTextField
          id={parentId}
          testId={`${formContext?.dataTestId}_${widgetLabel}_textField`}
          fullWidth={true}
          disabled={true}
          label={showLabel ? labelUppercase : ''}
          styledFieldLabel={
            showLabel ? (
              <StyledFieldLabel
                label={label}
                required={required}
                omitValidationHints={omitValidationHints}
              />
            ) : undefined
          }
          description={helpText}
          multiline={multiline}
          rows={rows}
          showLabel={true}
          textAreaProps={valueExists && multiple ? { style: { display: 'none', width: 0 } } : {}}
          onClick={() => {
            setOpen(!open);
          }}
          inputProps={{
            ...inputProps,
            'aria-controls': showDialog ? `${parentId}_dialogContent` : undefined,
            'aria-haspopup': 'dialog',
            sx: valueExists && multiple ? { display: 'none', width: 0 } : {},
          }}
        />
        {open && (
          <SearchWidgetList
            parentId={parentId}
            entitySourceId={entitySourceId}
            widgetLabel={widgetLabel}
            fallbackSchemas={{
              schema,
              uiSchema,
              configuration,
            }}
            onSelectionsApplied={onSelectionsApplied}
          />
        )}
      </Box>
    );
  }

  return hasError && entitySource ? (
    <GenericTextField
      id={`${parentId}`}
      testId={`${formContext?.dataTestId}_${widgetLabel}_textField`}
      value={value}
      onChange={setFieldValue}
      label={labelUppercase}
      multiline={multiline}
      rows={rows}
      textAreaProps={valueExists && multiple ? { style: { display: 'none', width: 0 } } : {}}
      description={helpText}
      type="string"
      showLabel={true}
      variant={'outlined'}
    />
  ) : (
    <>
      <GenericTextField
        id={`${parentId}`}
        testId={`${formContext?.dataTestId}_${widgetLabel}_textField`}
        fullWidth={true}
        disabled={true}
        label={showLabel ? labelUppercase : ''}
        styledFieldLabel={
          showLabel ? (
            <StyledFieldLabel
              label={label}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          ) : undefined
        }
        description={helpText}
        multiline={multiline}
        rows={rows}
        showLabel={true}
        textAreaProps={valueExists && multiple ? { style: { display: 'none', width: 0 } } : {}}
        valid={valid}
        inputProps={{
          ...inputProps,
          'aria-controls': showDialog ? `${parentId}_dialogContent` : undefined,
          'aria-haspopup': 'dialog',
          tabIndex: 0,
        }}
      />
      <SimpleDialog
        id={`${parentId}_dialogContent`}
        size={'lg'}
        fullWidth={true}
        isSimple={true}
        onClose={() => {
          setShowDialog(false);
          setGlobalListToParent();
        }}
        filters={filters}
        open={showDialog}
        title={translate('chooseEntity', {
          ns: ACCESSIBILITY,
          tableId: tableId || entitySourceId,
          lng: selectedLanguage,
        })}
      >
        <SearchWidgetList
          parentId={parentId}
          entitySourceId={entitySourceId}
          widgetLabel={widgetLabel}
          fallbackSchemas={{
            schema,
            uiSchema,
            configuration,
          }}
          onSelectionsApplied={onSelectionsApplied}
          onCancel={onCancel}
          initialState={{ selectedRowIds: { 0: selectedRowIds }, mappedData, multiple }}
        />
      </SimpleDialog>
      {warnOnChange && warnUnderCondition && !firstLoad && (
        <Alert style={{ width: '600px' }} severity="warning">
          {translate(`${warnTranslation?.warnMessageKey || ''}`, {
            ns: namespace,
            lng: selectedLanguage,
          })}
        </Alert>
      )}
    </>
  );
};
export default SearchEntityWidget;
