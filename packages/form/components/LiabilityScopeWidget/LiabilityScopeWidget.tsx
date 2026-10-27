import React, { useEffect, useMemo, useState, createContext } from 'react';

import useCodeListWidget from '@pkg-form/components/SelectCodeListWidget/hooks/useCodeListWidget';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import ConfirmationBox from '@pkg-common/components/ConfirmationBox/ConfirmationBox';
import useClearFrom from '@pkg-form/hooks/useClearFrom';
import useFormArrayFieldSelections from '@pkg-entity/hooks/useFormArrayFieldSelections';
import usePrevious from 'react-use/lib/usePrevious';
import LiabilityScopeSummary from '@pkg-form/components/LiabilityScopeWidget/LiabilityScopeSummary';
import { AnyType } from '@pkg-common/types';
import { getAllTextValidationErrors } from '@pkg-form/validations/utils/textValidationUtils';
import { FormWidgetProps } from '@pkg-form/types';
import useTable from '@pkg-list/hooks/useTable';
import GenericTable from '@pkg-list/components/GenericTable';
import GenericSelect from '@pkg-common/atomics/GenericSelect/GenericSelect';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { Box, InputAdornment } from '@mui/material';
import GenericTextField from '@pkg-common/atomics/GenericTextField/GenericTextField';
import useFormField from '@pkg-entity/hooks/useFormField';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import GenericCheckbox from '@pkg-common/atomics/GenericCheckbox/GenericCheckbox';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import { useTranslation } from 'react-i18next';
import { useDynamicApi } from '@pkg-common/dataResolver';
import useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';
import { BOOLEAN_CODELIST_ATTRIBUTES } from '@pkg-constants/codeListVariables';
import LiabilityIconButton from './LiabilityIconButton';
import { LiabilityScopeWidgetOptions } from './types.d';
import { useTheme } from '@mui/material/styles';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useIsFirstRender } from '@pkg-common/hooks/useIsFirstRender';

export const UiIncludedBillSegmentContext = createContext({ disabled: false });

const PERCENTAGE_COLUMN = 4;
const INCLUDED_BILL_SEGMENT_COLUMN = 5;

const getStyles = (theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(1),
  },
  containerTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0.5),
  },
  percentageContainer: { width: 100, margin: 4 },
});

const LiabilityScopeWidget = ({
  id,
  options,
  formContext,
  onChange,
  value: innerValue,
}: FormWidgetProps & { options: LiabilityScopeWidgetOptions }) => {
  const styles = getStyles(useTheme());
  const { apiValues, filterFrom, renderWith, configuration, clearFrom, periodSchemas } =
    options || {};
  const { tableId, filterSchema = {}, filterUiSchema = {} } = configuration || {};
  const { schema = {}, uiSchema = {} } = periodSchemas || {};
  const { mechanism, namespace } = formContext || {};

  const entityId = id?.split('_')[0];

  const useDefaultMechanism = mechanism === 'DEFAULT';
  const { setFieldValue } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  useClearFrom(id, clearFrom);

  const [type, setType] = useState('');
  const prevType = usePrevious(type);

  const [userSelection, setUserSelection] = useState(innerValue || {});

  const [byPeriod, setByPeriod] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [included, setIncluded] = useState(false);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  const {
    triggerRefresh,
    applyCriteria,
    tableData,
    setSelections,
    loading,
    setExtraTableData,
    selectedRows,
    allExtraData,
  } = useTable(tableId);

  const { selectedRows: includedRows, setSelections: setIncludedSelections } = useTable(
    tableId,
    INCLUDED_BILL_SEGMENT_COLUMN,
  );

  const includedBillSegments = useMemo(() => {
    return includedRows || {};
  }, [includedRows]);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);

  const { formData, setEntityFormData } = useEntityFormData(TRANSITION_FORM);
  const { formData: liabilityFormData, appendEntityFormData } = useEntityFormData(entityId);
  const isFirstRender = useIsFirstRender();
  useEffect(() => {
    if (
      included &&
      liabilityFormData.dependentCharges?.parentBillSegmentTypeCodes?.indexOf(type) === -1
    )
      appendEntityFormData({
        dependentCharges: {
          ...liabilityFormData.dependentCharges,
          parentBillSegmentTypeCodes: [
            ...liabilityFormData.dependentCharges.parentBillSegmentTypeCodes,
            type,
          ],
        },
      });
    if (!included) {
      const excludedCharges =
        liabilityFormData.dependentCharges?.parentBillSegmentTypeCodes?.filter(
          (item) => item !== type,
        );
      if (!isFirstRender) {
        appendEntityFormData({
          dependentCharges: {
            ...liabilityFormData.dependentCharges,
            parentBillSegmentTypeCodes: excludedCharges,
          },
        });
      }
    }
  }, [included]);

  useEffect(() => {
    const billSegmentIds = tableList.map((item) => item.billSegment.id);
    billSegmentIds?.forEach((item) => {
      if (includedBillSegments[item] === undefined) return;
      else if (
        includedBillSegments[item] &&
        liabilityFormData.dependentCharges?.parentBillSegmentIds?.indexOf(item) === -1
      ) {
        appendEntityFormData({
          dependentCharges: {
            ...liabilityFormData.dependentCharges,
            parentBillSegmentIds: [
              ...liabilityFormData.dependentCharges.parentBillSegmentIds,
              item,
            ],
          },
        });
      } else if (
        !includedBillSegments[item] &&
        liabilityFormData.dependentCharges?.parentBillSegmentIds?.indexOf(item) !== -1
      ) {
        const excludedCharges = liabilityFormData.dependentCharges?.parentBillSegmentIds?.filter(
          (billSegmentId) => billSegmentId !== item,
        );
        appendEntityFormData({
          dependentCharges: {
            ...liabilityFormData.dependentCharges,
            parentBillSegmentIds: excludedCharges,
          },
        });
      }
    });
  }, [includedBillSegments]);

  const { fieldSelectedItems, deselectArrayItems } = useFormArrayFieldSelections(
    `${TRANSITION_FORM}_periods`,
  );

  const { list, loading: loadingBillSegmentTypes } = useCodeListWidget(
    id,
    apiValues,
    filterFrom,
    renderWith,
    hasBeenFocused,
  );
  const apiVariableValues = useDynamicApi(id, apiValues);
  const { getAttribute } = useCodeListAttributes(apiVariableValues?.codeList);

  const isParent = useMemo(() => {
    return getAttribute(type, 'isParent')?.splice(0, 1)[0] === BOOLEAN_CODELIST_ATTRIBUTES.YES;
  }, [type]);
  const tableList = useMemo(() => {
    return (tableData || []).map((item) => ({
      billSegment: {
        id: item.id,
        identificationLabel: item.identificationLabel,
      },
      excluded: false,
    }));
  }, [tableData]);

  const isByPeriod = useMemo(() => {
    if (
      userSelection[type]?.isByPeriod === true &&
      type &&
      prevType &&
      type !== prevType &&
      userSelection[type]?.periods?.length
    ) {
      return true;
    }
    return byPeriod;
  }, [userSelection, byPeriod, type]);

  const isTableVisible = useMemo(() => {
    if (!isByPeriod) {
      return !!type;
    }
    return userSelection[type]?.isByPeriod === true && userSelection[type]?.periods?.length;
  }, [type, isByPeriod, userSelection]);

  const excludedSelections = useMemo(() => {
    return selectedRows || {};
  }, [selectedRows]);

  const percentageSelections = useMemo(() => {
    const selections = allExtraData[PERCENTAGE_COLUMN] || {};
    const percentages = {};
    Object.keys(selections).forEach((id) => {
      if (selections[id]?.isPercentage && (selections[id]?.value || selections[id]?.value === 0)) {
        percentages[id] = selections[id]?.value;
      }
    });
    return percentages;
  }, [allExtraData]);

  const maxAmountSelections = useMemo(() => {
    const selections = allExtraData[PERCENTAGE_COLUMN] || {};
    const maxAmounts = {};
    Object.keys(selections).forEach((id) => {
      if (!selections[id]?.isPercentage && (selections[id]?.value || selections[id]?.value === 0)) {
        maxAmounts[id] = selections[id]?.value;
      }
    });
    return maxAmounts;
  }, [allExtraData]);

  const isPeriodDisabled = useMemo(() => {
    return !type || loading;
  }, [type, loading]);

  const isIncludedBillSegmentTypeDisabled = useMemo(() => {
    const includedBillSegments = tableData?.filter(
      (item) => liabilityFormData.dependentCharges?.parentBillSegmentIds?.indexOf(item.id) !== -1,
    );

    if (includedBillSegments?.length) return true;

    return !type || loading || !isParent;
  }, [type, loading, includedBillSegments, liabilityFormData, userSelection]);

  const selectedPeriod = useMemo(() => {
    if (fieldSelectedItems && fieldSelectedItems.length) {
      return fieldSelectedItems[0];
    }
  }, [fieldSelectedItems]);

  // on type change
  useEffect(() => {
    appendEntityFormData({ billSegmentTypeCd: type });
    setByPeriod(false);
  }, [type, appendEntityFormData]);

  // on list data change
  useEffect(() => {
    if (tableList.length && !loading && type && !userSelection[type]) {
      setUserSelection((prevValue) => ({
        ...prevValue,
        [type]: { list: tableList },
      }));
    }
  }, [tableList, loading, userSelection]);

  useEffect(() => {
    if (!type || !prevType || type === prevType) {
      return;
    }
    setEntityFormData({ periods: userSelection[type]?.periods || [] });
  }, [byPeriod, type, prevType, setSelections, setExtraTableData, setEntityFormData]);

  useEffect(() => {
    setIncluded(false);
    if (!userSelection[type]?.list) {
      return;
    }
    setSelections(
      userSelection[type]?.list?.reduce((acc, curr) => {
        acc[curr?.billSegment?.id] = !!curr.excluded;
        return acc;
      }, {}),
    );

    setExtraTableData(
      userSelection[type]?.list?.reduce((acc, curr) => {
        if (!curr.excluded && (curr.percentage || curr.maxAmount)) {
          acc[curr?.billSegment?.id] = {
            value: curr.percentage || curr.maxAmount,
            isPercentage: !!curr.percentage,
          };
        } else {
          acc[curr?.billSegment?.id] = null;
        }
        return acc;
      }, {}),
      PERCENTAGE_COLUMN,
    );

    if (userSelection[type]?.isByPeriod) {
      setEntityFormData({ periods: userSelection[type]?.periods || [] });
    }
  }, [type, setFieldValue, setSelections, setExtraTableData, setEntityFormData]);

  useEffect(() => {
    if (
      type &&
      (Object.keys(excludedSelections).length ||
        Object.keys(percentageSelections).length ||
        Object.keys(maxAmountSelections).length)
    ) {
      setUserSelection((prevSelections) => {
        const list = [
          ...Object.keys(percentageSelections),
          ...Object.keys(maxAmountSelections),
          ...Object.keys(excludedSelections),
        ];

        const filteredList = list.filter((value, index) => list.indexOf(value) === index);

        const finalList = filteredList.map((key) => {
          return {
            billSegment: { id: key },
            excluded: !!excludedSelections[key],
            percentage: percentageSelections[key],
            maxAmount: maxAmountSelections[key],
          };
        });

        return {
          ...prevSelections,
          [type]: {
            ...prevSelections[type],
            list: finalList,
          },
        };
      });
    }
  }, [type, excludedSelections, percentageSelections, maxAmountSelections]);

  useEffect(() => {
    setFieldValue(userSelection);
  }, [userSelection]);

  const onPercentageChange = (percentage: number) => {
    setUserSelection((prevValue) => ({
      ...prevValue,
      [type]: { ...userSelection[type], percentage },
    }));
  };

  useEffect(() => {
    if (type && prevType && type !== prevType) {
      setUserSelection((prevValue) => ({
        ...prevValue,
        [type]: {
          ...prevValue[type],
          list: prevValue[type]?.list?.map((item) => ({
            ...item,
            percentage: percentageSelections[item.billSegment.id] || item.percentage,
            maxAmount: maxAmountSelections[item.billSegment.id] || item.maxAmount,
          })),
        },
      }));
    }
  }, [percentageSelections, maxAmountSelections, type]);

  const onShowAll = () => {
    if (selectedPeriod) {
      deselectArrayItems([selectedPeriod.__index]);
    }
  };

  const finalConfiguration = useMemo(() => {
    if (!isByPeriod) {
      return configuration;
    }

    const columns = configuration?.columns.filter(
      (column) => column.type !== 'check' && column.type !== 'editableNumber',
    );

    if (!selectedPeriod) {
      return {
        ...configuration,
        columns,
        selections: { enabled: false },
      };
    }

    return {
      ...configuration,
      columns,
      subTitle: `${selectedPeriod?.startDate} -  ${selectedPeriod?.endDate}`,
      selections: { enabled: false },
    };
  }, [isByPeriod, selectedPeriod]);

  const percentageErrors = useMemo(() => {
    if (!userSelection || !userSelection[type] || !type) {
      return [];
    }
    const percentage = userSelection[type]?.percentage;
    return getAllTextValidationErrors(
      { minValue: 0, maxValue: 100, shouldValidate: true },
      percentage?.toString(),
    );
  }, [userSelection, type]);

  useEffect(() => {
    if (!type) {
      return undefined;
    }

    const criteria: AnyType = {};
    if (!isByPeriod) {
      appendEntityFormData({ billSegmentTypeCd: type });
      triggerRefresh();
      return;
    }
    if (selectedPeriod) {
      if (selectedPeriod.endDate) {
        criteria.effectiveToDt = selectedPeriod.endDate;
      }
      if (selectedPeriod.startDate) {
        criteria.effectiveFromDt = selectedPeriod.startDate;
      }
    }

    appendEntityFormData({ billSegmentTypeCd: type });
    applyCriteria(criteria);
    // triggerRefresh();
  }, [selectedPeriod, type, isByPeriod, applyCriteria, appendEntityFormData]);

  useEffect(() => {
    if (liabilityFormData.dependentCharges?.parentBillSegmentTypeCodes?.includes(type)) {
      setIncluded(true);
    }

    const list = {};
    if (tableData?.length && !loading) {
      tableData?.forEach((item) => {
        if (liabilityFormData.dependentCharges?.parentBillSegmentIds?.indexOf(item.id) !== -1) {
          list[item.id] = true;
        }
      });

      setIncludedSelections(list, INCLUDED_BILL_SEGMENT_COLUMN);
    }
  }, [type, loading, userSelection]);

  return (
    <>
      <Box sx={styles.containerTop}>
        <Box style={{ width: 400, marginRight: 8 }}>
          <GenericSelect
            id={id}
            testId="bill-segment-type-selection"
            options={list}
            onChange={(e) => {
              setType(e.target.value);
            }}
            onFocus={() => setHasBeenFocused(true)}
            value={type}
            loading={loadingBillSegmentTypes}
            fullWidth
            label={translate('billSegmentType', { ns: namespace, lng: selectedLanguage })}
            required={true}
          />
        </Box>

        <Box style={{ width: 200 }}>
          <GenericTextField
            type="number"
            id={id}
            onChange={onPercentageChange}
            value={userSelection[type]?.percentage ?? ''}
            disabled={!type || loading || !tableList?.length}
            label={translate('percentage', { ns: namespace, lng: selectedLanguage })}
            fullWidth
            errorsList={percentageErrors}
            valid={percentageErrors?.length === 0}
            inputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: {
                max: 100,
                min: 0,
              },
            }}
            errors={
              <ValidationErrors
                id={id}
                clientErrors={percentageErrors}
                serverErrors={[]}
                diffs={[]}
                dirty={true}
              />
            }
          />
        </Box>
      </Box>
      <Box sx={styles.container}>
        <GenericCheckbox
          id={`${id}-by-period`}
          value={isByPeriod}
          onChange={() => setWarningModal(true)}
          label={translate('applyPeriod', { ns: namespace, lng: selectedLanguage })}
          disabled={isPeriodDisabled}
          ariaHasPopup={true}
        />

        <GenericCheckbox
          id={`${id}-include-child-bill-segments`}
          value={included}
          onChange={() => setIncluded(!included)}
          label={translate('include', { ns: namespace, lng: selectedLanguage })}
          disabled={isIncludedBillSegmentTypeDisabled}
        />

        <LiabilityIconButton
          type={type}
          namespaces={[namespace]}
          visible={included}
          isCell={false}
        />

        <ConfirmationBox
          open={warningModal}
          onClose={() => setWarningModal(false)}
          title={translate('confirm', { ns: COMMON, lng: selectedLanguage })}
          message={translate('billSegmentsPeriodModal', { ns: namespace, lng: selectedLanguage })}
          choices={[
            {
              label: translate('ok', { ns: COMMON, lng: selectedLanguage }),
              action: () => {
                setWarningModal(false);
                setByPeriod((isByPeriod) => !isByPeriod);
              },
            },
            {
              label: translate('cancel', { ns: COMMON, lng: selectedLanguage }),
              action: () => setWarningModal(false),
            },
          ]}
        />
      </Box>

      {isByPeriod && (
        <Box sx={styles.container}>
          <DynamicForm
            id={TRANSITION_FORM}
            data={formData}
            schema={schema}
            uiSchema={uiSchema}
            formContext={{ mechanism: 'DEFAULT' }}
            onChange={(data) => {
              setEntityFormData(data);
              setUserSelection((prevValue) => ({
                ...prevValue,
                [type]: {
                  list: prevValue[type]?.list?.map((item) => ({
                    ...item,
                    excluded: false,
                    percentage: undefined,
                  })),
                  percentage: prevValue[type]?.percentage,
                  periods: data?.periods || [],
                  isByPeriod,
                },
              }));
            }}
          />
        </Box>
      )}

      {isTableVisible && (
        <UiIncludedBillSegmentContext.Provider value={{ disabled: included || !isParent }}>
          <GenericTable
            parentId={id}
            configuration={finalConfiguration}
            filterSchema={filterSchema}
            filterUiSchema={filterUiSchema}
            disabled={false}
            headerContent={
              <>
                {isByPeriod && (
                  <GenericIconButton
                    id={`${id}-show-all-btn`}
                    testId={`${id}-show-all-btn`}
                    label={translate('showAll', { ns: COMMON, lng: selectedLanguage })}
                    ariaLabel={translate('showAll', {
                      ns: ACCESSIBILITY,
                      lng: selectedLanguage,
                    })}
                    ariaDescription={translate('showAllAriaDescription', {
                      ns: ACCESSIBILITY,
                      elementId: tableId,
                      lng: selectedLanguage,
                    })}
                    ariaHasPopup={true}
                    onClick={onShowAll}
                    icon={<AssetByType input="icons" name="SelectAllOutlined" />}
                  />
                )}
              </>
            }
          />
        </UiIncludedBillSegmentContext.Provider>
      )}

      <LiabilityScopeSummary
        widgetId={id}
        selections={userSelection}
        list={list}
        namespace={namespace}
      />
    </>
  );
};

export default LiabilityScopeWidget;
