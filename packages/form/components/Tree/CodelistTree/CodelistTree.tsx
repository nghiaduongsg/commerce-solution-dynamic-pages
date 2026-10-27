import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useFormField from '@pkg-entity/hooks/useFormField';
import { CodelistTreeOptions, FormWidgetProps } from '@pkg-form/types';
import CodelistTreeNode, { CodeListItemLabelsType } from './CodelistTreeNode';
import { Box, Chip, FormControl, Grid, Typography, useTheme } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useCodeListWidgetUtils from '../../SelectCodeListWidget/hooks/useCodeListWidgetUtils';
import useClearFrom from '@pkg-form/hooks/useClearFrom';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';
import getStyles from './../styles';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';
import DynamicForm from '../../DynamicForm/DynamicForm';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const TOP_LEVEL_FILTER_ID = 'codelistTree-topLevelFilter';

const concatFilters = (data, apiValues) => {
  const queryFrom: Array<{ key: string; defaultValue: AnyType }> = [];
  Object.keys(data ?? {}).forEach((key) => {
    if (data[key]) {
      queryFrom.push({ key, defaultValue: data[key] });
    }
  });

  return {
    ...apiValues,
    queryFrom,
  };
};

const CodelistTree = ({
  id,
  options,
  schema,
  serverErrors,
  formContext,
  serverErrorTypes,
  diffs,
  value: innerValue,
  onChange,
}: FormWidgetProps & { options: CodelistTreeOptions }) => {
  const {
    apiValues,
    validations,
    openByDefault,
    multiple,
    mapToProperty,
    clearFrom,
    relationshipType,
    truncate = { enabled: false },
    topLevelFilter,
  } = options;
  const theme = useTheme();
  const styles = getStyles(theme);

  const { mechanism } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';
  const { selectedLanguage } = useSystem();
  const { value, setFieldValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    600,
  );
  const {
    labelUppercase: label,
    omitValidationHints,
    required,
  } = useWidgetUtils(schema, options, formContext);
  const { valid, errors } = useTextWidgetValidations(id, value, validations, serverErrors || []);
  useClearFrom(id, clearFrom);

  const { getUpdatedValue, selectedValue } = useCodeListWidgetUtils(value, multiple, mapToProperty);

  const [codelistItems, setCodelistItems] = useState<AnyType[] | null>(null);
  const { formData, setEntityFormData } = useEntityFormData(TOP_LEVEL_FILTER_ID);
  const [showTopLevelFilters, setShowTopLevelFilters] = useState(false);
  const [open, setOpen] = useState(false);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const [childrenMap, setChildrenMap] = useState([]);
  const [updateSignal, setUpdateSignal] = useState(0);

  const finalApiValues = useMemo(() => {
    if (updateSignal > 0) {
      return concatFilters(formData, apiValues);
    }

    return apiValues;
  }, [apiValues, updateSignal]);

  const response = useApiData(id, finalApiValues as ApiValuesSchema);

  useEffect(() => {
    if (response !== undefined) {
      setCodelistItems(response);
    }
  }, [response]);

  const selectedItems = useMemo(() => {
    const values = Array.isArray(selectedValue)
      ? selectedValue
      : selectedValue
        ? [selectedValue]
        : [];

    if (relationshipType === 'WITHIN') {
      return codelistItems && values.length > 0
        ? codelistItems.filter((i) => values.includes(i.code))
        : [];
    } else {
      const selected =
        childrenMap && values.length > 0
          ? childrenMap.filter((i: AnyType) => {
              return values.includes(i.codeListItemDetails.codeListItemCode);
            })
          : [];

      return selected.map((item: AnyType) => ({
        id: item?.id,
        code: item.codeListItemDetails.codeListItemCode,
        label: item.codeListItemDetails.codeListItemDescription,
      }));
    }
  }, [relationshipType, codelistItems, selectedValue, childrenMap]);

  const handleChildrenFetched = (response) => {
    setChildrenMap(response);
  };

  useEffect(() => {
    if (openByDefault) {
      setOpen(true);
    }
  }, [openByDefault]);

  const hasTopLevelResults = useMemo(() => {
    return codelistItems === null || codelistItems?.length > 0;
  }, [codelistItems]);

  const onApplyFilters = useCallback(() => {
    setUpdateSignal(new Date().getTime());
  }, []);

  const onClearFilters = useCallback(() => {
    setShowTopLevelFilters(false);
    setEntityFormData({});
    setUpdateSignal(0);
  }, [setEntityFormData]);

  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      <FormControl
        fullWidth={true}
        title={label}
        required={(validations || {}).required || false}
        error={!valid}
      >
        <FieldTitle
          sx={styles.fieldLabel}
          title={
            <StyledFieldLabel
              label={label}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          }
          isValid={valid}
        />
        <Box sx={styles.box} tabIndex={0} onClick={() => setOpen((prev) => !prev)}>
          <Box sx={styles.selectedItem}>
            {selectedItems.length === 0 ? (
              !value ? (
                <Box sx={{ color: 'text.secondary' }}>
                  {translate('noSelection', { ns: COMMON, lng: selectedLanguage })}
                </Box>
              ) : (
                <Box sx={{ color: 'text.secondary' }}>
                  {(Array.isArray(selectedValue) ? selectedValue : [selectedValue])?.map(
                    (item, index) => (
                      <Chip
                        key={`${item}-${index}`}
                        label={<TruncatedInput truncate={truncate} title={item} />}
                        size="small"
                        variant="outlined"
                        clickable={false}
                      />
                    ),
                  )}
                </Box>
              )
            ) : (
              selectedItems.map((item, index) => {
                return (
                  <Chip
                    key={`${item.code}-${index}`}
                    label={`${item.code} - ${
                      item?.labels?.find(
                        (label: CodeListItemLabelsType) => label.languageCL === selectedLanguage,
                      )?.description ?? ''
                    }`}
                    size="small"
                    variant="outlined"
                    clickable={false}
                  />
                );
              })
            )}
          </Box>
          {topLevelFilter &&
            (hasTopLevelResults ? (
              <GenericIconButton
                id={`${id}-search-icon`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTopLevelFilters((prev) => !prev);
                }}
                ariaLabel={translate('search', { ns: COMMON, lng: selectedLanguage })}
                size={'small'}
                icon={<AssetByType input="icons" name="Search" />}
                applyDebounce={false}
              />
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}
              >
                {translate('noItemsFound', {
                  ns: COMMON,
                  lng: selectedLanguage,
                })}
              </Typography>
            ))}
          <GenericIconButton
            id={`collapsible-tree-button-${id}`}
            testId={`collapsible-tree-button-${id}`}
            ariaLabel={translate(open ? 'collapse' : 'expand', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
            ariaExpanded={open}
            ariaControls={open ? `collapsible-tree-${id}` : undefined}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen((prev) => !prev);
            }}
            icon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          />
        </Box>
        {showTopLevelFilters && topLevelFilter && (
          <Box
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            sx={styles.filtersContainer}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {translate('valueSearch', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
            </Typography>

            <DynamicForm
              id={TOP_LEVEL_FILTER_ID}
              schema={topLevelFilter.filterSchema}
              uiSchema={topLevelFilter.filterUiSchema}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Grid size={{ xs: 'auto' }}>
                <GenericButton
                  id={`${id}-clear-btn`}
                  testId={`${id}-clear-btn`}
                  label={translate('clear', { ns: COMMON, lng: selectedLanguage })}
                  ariaLabel={translate('clearButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  variant="outlined"
                  size="small"
                  onClick={onClearFilters}
                />
              </Grid>

              <Grid size={{ xs: 'auto' }}>
                <GenericButton
                  id={`${id}-apply-btn`}
                  testId={`${id}-apply-btn`}
                  label={translate('apply', { ns: COMMON, lng: selectedLanguage })}
                  ariaLabel={translate('applyButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  styles={{ ml: 2 }}
                  size="small"
                  type="button"
                  onClick={onApplyFilters}
                />
              </Grid>
            </Box>
          </Box>
        )}
      </FormControl>
      {errors && (
        <ValidationErrors
          id={id}
          clientErrors={errors}
          serverErrors={serverErrors}
          serverErrorTypes={serverErrorTypes}
          diffs={diffs}
          dirty={dirty}
        />
      )}
      {open && (
        <SimpleTreeView id={`collapsible-tree-${id}`}>
          {(Array.isArray(codelistItems) ? codelistItems : [codelistItems])?.map((item) => (
            <CodelistTreeNode
              id={id}
              options={options}
              key={item?.id}
              item={item}
              level={0}
              onSelect={(id) => setFieldValue(getUpdatedValue(id))}
              value={selectedValue}
              onChildrenFetched={handleChildrenFetched}
            />
          ))}
        </SimpleTreeView>
      )}
    </Box>
  );
};

export default CodelistTree;
