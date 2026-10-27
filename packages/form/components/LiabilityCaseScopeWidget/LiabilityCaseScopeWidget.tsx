import React, { useEffect, useMemo, useState } from 'react';

import { FormWidgetProps } from '@pkg-form/types';
import useTable from '@pkg-list/hooks/useTable';
import GenericTable from '@pkg-list/components/GenericTable';
import GenericSelect from '@pkg-common/atomics/GenericSelect/GenericSelect';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { Box, InputAdornment } from '@mui/material';
import GenericTextField from '@pkg-common/atomics/GenericTextField/GenericTextField';
import useFormField from '@pkg-entity/hooks/useFormField';
import { arrayToMap } from '@pkg-common/utils/utils';
import usePrevious from 'react-use/lib/usePrevious';
import CaseScopeSummary from '@pkg-form/components/LiabilityCaseScopeWidget/CaseScopeSummary';
import {
  getCaseCurrentSummary,
  getCaseLiabilitySummary,
  getCaseSavedSummary,
  getValueAfterInclusion,
  getValueAfterPercentageChange,
  getValueAfterPeriodChange,
  getValueAfterSetFutureDebt,
} from './utils';
import { useTheme } from '@mui/material/styles';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import GenericCheckbox from '@pkg-common/atomics/GenericCheckbox/GenericCheckbox';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import { useTranslation } from 'react-i18next';
import { UiIncludedBillSegmentContext } from '@pkg-form/components/LiabilityScopeWidget/LiabilityScopeWidget';
import { useApiDataState } from '@pkg-core/apiData';
import LiabilityIconButton from '../LiabilityScopeWidget/LiabilityIconButton';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import useLoader from '@pkg-common/loader/useLoader';
import useSystem from '@pkg-setup/src/system/useSystem';

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
});

const INCLUDED_BILL_SEGMENT_COLUMN = 10;
const CASE_SCOPE = 'CaseScope';

const LiabilityCaseScopeWidget = ({
  id,
  options,
  formContext,
  value: innerValue,
  onChange,
}: FormWidgetProps) => {
  const styles = getStyles(useTheme());
  const { serverErrors } = useFormValidity('CaseScope_caseLiabilityBillSegmentTypes');
  const { mechanism, namespace } = formContext || {};
  const {
    configuration,
    periodSchemas,
    liabilityPeriodSchemas,
    savedScopeJsonPath,
    dependentChargesJsonPath,
    validations,
  } = options;
  const { tableId, rowId } = configuration || {};
  const { schema: formSchema, uiSchema: formUiSchema } = periodSchemas || {};
  const { schema, uiSchema } = liabilityPeriodSchemas || {};

  const useDefaultMechanism = mechanism === 'DEFAULT';
  const { value, setFieldValue } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { formData, setEntityFormData } = useEntityFormData(TRANSITION_FORM);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);
  const { data: scope } = useApiDataState('LIABILITY_SCOPE');
  const { nestedData: savedScope } = useApiDataState('CASE_LIABILITY_SCOPE', savedScopeJsonPath);
  const { nestedData: dependentCharges } = useApiDataState(
    'CASE_LIABILITY_SCOPE',
    dependentChargesJsonPath,
  );

  const { visible: caseScopeLoading } = useLoader();

  const { selectedRows: includedRows, setSelections: setIncludedSelections } = useTable(
    tableId,
    INCLUDED_BILL_SEGMENT_COLUMN,
  );

  const includedChildBillSegments = useMemo(() => {
    return includedRows || {};
  }, [includedRows]);

  const { formData: caseScopeFormData, setEntityFormData: setCaseScopeFormData } =
    useEntityFormData(CASE_SCOPE);

  const {
    setTableData,
    setSelections,
    initTable,
    loading,
    tableData,
    selectedRows,
    toggleAllTableRows,
    allExtraData,
    setExtraTableData,
  } = useTable(tableId);

  useEffect(() => {
    initTable({
      columns: configuration?.columns,
      rowIdKey: rowId,
      selectedRowIds: {
        0: {},
      },
      url: '',
    });
  }, []);

  const [type, setType] = useState('');
  const [billSegmentTypePercentage, setBillSegmentTypePercentage] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [byPeriod, setByPeriod] = useState(false);
  const [isNewFormData, setIsNewFormData] = useState(false);
  const [includeAllBillSegments, setIncludeAllBillSegments] = useState(false);
  const [childIncluded, setChildIncluded] = useState(false);
  const prevType = usePrevious(type);

  const billSegmentTypeList = useMemo(() => {
    return constructList(
      scope?.billSegmentTypes,
      'billSegmentTypeCode',
      ['billSegmentTypeDescription', 'percentage'],
      ['', '%'],
    );
  }, [scope]);

  const billSegmentsByType = useMemo(() => {
    return arrayToMap(scope?.billSegmentTypes || [], 'billSegmentTypeCode');
  }, [scope]);

  const selectedBillSegmentType = useMemo(() => {
    return billSegmentsByType[type];
  }, [type]);

  const rowIndex = useMemo(() => {
    return Object.keys(value || {}).indexOf(selectedBillSegmentType?.billSegmentTypeCode);
  }, [selectedBillSegmentType, value]);

  useEffect(() => {
    initTable({
      validationsId: `CaseScope_caseLiabilityBillSegmentTypes_${rowIndex}_billSegments`,
    });
  }, [rowIndex]);

  const rowServerErrors = useMemo(() => {
    return serverErrors;
  }, [serverErrors]);

  useEffect(() => {
    initTable({
      includedBillSegmentsWithoutValue: (value || {})[selectedBillSegmentType?.billSegmentTypeCode]
        ?.includedBillSegmentIndexesWithNoValue,
    });
  }, [selectedBillSegmentType, caseScopeLoading]); // we need indexes when billsegmenttype changes but we also need to set up the errors when bill segment type doesnt change so we put extra param caseScopeLoading

  const percentageColumn = useMemo(() => {
    return configuration?.columns?.length - 3;
  }, [configuration]);

  const selectedPeriodBillSegments = useMemo(() => {
    return (
      selectedBillSegmentType?.periods?.find((p) => p.id === selectedPeriod)?.billSegments || []
    );
  }, [selectedPeriod, selectedBillSegmentType]);

  const isBillSegmentTypePercentageValid = useMemo(() => {
    return (billSegmentTypePercentage || 0) <= (selectedBillSegmentType?.percentage || 100);
  }, [billSegmentTypePercentage, selectedBillSegmentType]);

  const includedBillSegments = useMemo(() => {
    return selectedRows;
  }, [selectedRows]);

  const billSegmentPercentages = useMemo(() => {
    return (allExtraData || {})[percentageColumn];
  }, [allExtraData]);

  const summaryLiabilityScope = useMemo(() => {
    if (!scope) {
      return {};
    }

    return getCaseLiabilitySummary(scope);
  }, [scope]);

  const summaryCaseCurrentScope = useMemo(() => {
    if (!value) {
      return {};
    }

    return getCaseCurrentSummary(value || {});
  }, [value]);

  useEffect(() => {
    setSelectedPeriod('');
    if ((value || {})[type]) {
      setBillSegmentTypePercentage((value || {})[type]?.percentage);
    } else {
      setBillSegmentTypePercentage(selectedBillSegmentType?.percentage);
    }
  }, [type, selectedBillSegmentType, value]);

  useEffect(() => {
    const data = selectedPeriod
      ? selectedPeriodBillSegments
      : selectedBillSegmentType?.billSegments;
    setTableData({ data });
  }, [selectedPeriod, selectedPeriodBillSegments, selectedBillSegmentType, value, byPeriod]);

  useEffect(() => {
    if (selectedBillSegmentType?.billSegments?.length) {
      setFieldValue(
        getValueAfterInclusion(
          value,
          selectedBillSegmentType,
          includedBillSegments,
          billSegmentPercentages,
          formData?.periods,
          includeAllBillSegments,
          rowServerErrors,
          caseScopeLoading,
        ),
      );
    }
  }, [
    includedBillSegments,
    billSegmentPercentages,
    selectedBillSegmentType,
    setFieldValue,
    value,
    caseScopeLoading,
  ]);

  const selectedDataPeriods = useMemo(() => {
    return {
      periods:
        selectedBillSegmentType?.periods?.map((period) =>
          period.maxAmount ? { ...period, percentage: null } : period,
        ) || [],
    };
  }, [selectedBillSegmentType]);

  const addedPeriods = useMemo(() => {
    const savedValue = (value || {})[selectedBillSegmentType?.billSegmentTypeCode];
    return { periods: savedValue?.periods || [] };
  }, [selectedBillSegmentType, isNewFormData, value]);

  useEffect(() => {
    setEntityFormData(addedPeriods);
  }, [selectedDataPeriods, isNewFormData]);

  useEffect(() => {
    if (Object.keys(formData).length === 0) {
      setIsNewFormData((prevValue) => !prevValue);
    }
  }, [formData]);

  useEffect(() => {
    const refinedSavedScope = getCaseSavedSummary(savedScope || []);
    if (type && !prevType) {
      let selections = {};
      savedScope?.forEach((item) => {
        item?.billSegments?.forEach((curr) => {
          selections[curr?.billSegment?.id] = !!curr.included;
        });
        setExtraTableData(
          item?.billSegments?.reduce((acc, curr) => {
            acc[curr?.billSegment?.id] = curr.percentage
              ? { value: curr.percentage, isPercentage: true }
              : { value: curr.maxAmount };
            return acc;
          }, {}),
          percentageColumn,
        );
      });
      setSelections(selections);
      setEntityFormData({
        periods:
          refinedSavedScope[selectedBillSegmentType?.billSegmentTypeCode]?.periods.map(
            (period) => ({ ...period, numberType: period.maxAmount ? 'MAX_AMOUNT' : 'PERCENTAGE' }),
          ) || [],
      });
      setFieldValue(getCaseSavedSummary(savedScope || []));
    }
  }, [selectedBillSegmentType]);
  useEffect(() => {
    setFieldValue(getCaseSavedSummary(savedScope || []));
  }, [savedScope]);

  const isIncludedBillSegmentTypeDisabled = useMemo(() => {
    const thisIncludedBillSegments = tableData?.filter(
      (item) => caseScopeFormData.dependentCharges?.parentBillSegmentIds?.indexOf(item.id) !== -1,
    );

    if (thisIncludedBillSegments?.length) {
      return true;
    }

    return !type || loading;
  }, [type, loading, includedChildBillSegments, caseScopeFormData, value, prevType]);

  useEffect(() => {
    if (type && !prevType) {
      if (
        (!caseScopeFormData?.dependentCharges?.parentBillSegmentTypeCodes ||
          !caseScopeFormData?.dependentCharges?.parentBillSegmentIds) &&
        !dependentCharges?.parentBillSegmentIds &&
        !dependentCharges?.parentBillSegmentTypeCodes
      ) {
        setCaseScopeFormData({
          ...caseScopeFormData,
          dependentCharges: {
            parentBillSegmentTypeCodes: [],
            parentBillSegmentIds: [],
          },
        });
      }
      if (dependentCharges?.parentBillSegmentIds || dependentCharges?.parentBillSegmentTypeCodes) {
        setCaseScopeFormData({
          ...caseScopeFormData,
          dependentCharges: dependentCharges,
        });
      }
    }
  }, [selectedBillSegmentType]);

  useEffect(() => {
    if (
      childIncluded &&
      caseScopeFormData?.dependentCharges?.parentBillSegmentTypeCodes?.indexOf(type) === -1
    ) {
      setCaseScopeFormData({
        ...caseScopeFormData,
        dependentCharges: {
          ...caseScopeFormData?.dependentCharges,
          parentBillSegmentTypeCodes: [
            ...(caseScopeFormData?.dependentCharges?.parentBillSegmentTypeCodes ?? []),
            type,
          ],
        },
      });
    }
    if (!childIncluded) {
      const excludedCharges =
        caseScopeFormData?.dependentCharges?.parentBillSegmentTypeCodes?.filter(
          (item) => item !== type,
        );
      setCaseScopeFormData({
        ...caseScopeFormData,
        dependentCharges: {
          ...caseScopeFormData?.dependentCharges,
          parentBillSegmentTypeCodes: excludedCharges,
        },
      });
    }
  }, [childIncluded]);

  useEffect(() => {
    const billSegmentIds = tableData.map((item) => item?.id);
    billSegmentIds?.forEach((item) => {
      if (includedChildBillSegments[item] === undefined) {
        return;
      } else if (
        includedChildBillSegments[item] &&
        caseScopeFormData?.dependentCharges?.parentBillSegmentIds?.indexOf(item) === -1
      ) {
        setCaseScopeFormData({
          ...caseScopeFormData,
          dependentCharges: {
            ...caseScopeFormData?.dependentCharges,
            parentBillSegmentIds: [
              ...(caseScopeFormData?.dependentCharges?.parentBillSegmentIds || []),
              item,
            ],
          },
        });
      } else if (
        !includedChildBillSegments[item] &&
        caseScopeFormData?.dependentCharges?.parentBillSegmentIds?.indexOf(item) !== -1
      ) {
        const excludedCharges = caseScopeFormData?.dependentCharges?.parentBillSegmentIds?.filter(
          (billSegmentId) => billSegmentId !== item,
        );
        setCaseScopeFormData({
          ...caseScopeFormData,
          dependentCharges: {
            ...caseScopeFormData?.dependentCharges,
            parentBillSegmentIds: excludedCharges,
          },
        });
      }
    });
  }, [includedChildBillSegments]);

  useEffect(() => {
    setChildIncluded(false);
    if (caseScopeFormData?.dependentCharges?.parentBillSegmentTypeCodes?.includes(type)) {
      setChildIncluded(true);
    }

    const list = {};
    if (tableData?.length && !loading) {
      tableData?.forEach((item) => {
        if (caseScopeFormData?.dependentCharges?.parentBillSegmentIds?.indexOf(item.id) !== -1) {
          list[item.id] = true;
        }
      });

      setIncludedSelections(list, INCLUDED_BILL_SEGMENT_COLUMN);
    }
  }, [type, value, loading, selectedBillSegmentType, prevType]);

  useEffect(() => {
    setIncludeAllBillSegments(false);
    setIncludeAllBillSegments((value || {})[type]?.includeAllBillSegments || false);
    if ((value || {})[type]?.includeAllBillSegments) {
      toggleAllTableRows(true);
    }
  }, [selectedBillSegmentType]);

  useEffect(() => {
    selectedBillSegmentType &&
      setFieldValue(
        getValueAfterSetFutureDebt(value, selectedBillSegmentType, includeAllBillSegments),
      );
  }, [includeAllBillSegments]);
  return (
    <Box>
      <Box sx={styles.containerTop}>
        <GenericSelect
          id={`${id}-bill-segment-type-selection`}
          testId="bill-segment-type-selection"
          options={billSegmentTypeList}
          onChange={(e) => {
            setType(e.target.value);
          }}
          value={type}
          fullWidth
          label={translate('billSegmentType', { ns: namespace, lng: selectedLanguage })}
          required={(validations || {}).required || false}
        />
        {type && (
          <Box style={{ width: 200 }}>
            <GenericTextField
              type="number"
              id={id}
              testId={'bill-segment-type-percentage'}
              disabled={!type}
              placeHolder={selectedBillSegmentType?.percentage}
              value={billSegmentTypePercentage}
              label={translate('percentage', { ns: namespace, lng: selectedLanguage })}
              onChange={(v) => {
                try {
                  const data = Number.parseFloat(v);
                  setBillSegmentTypePercentage(data);
                } catch {}
              }}
              onBlur={(_, str) => {
                try {
                  const data = Number.parseFloat(str);
                  setFieldValue(
                    getValueAfterPercentageChange(
                      value,
                      data,
                      selectedBillSegmentType,
                      includedBillSegments,
                      formData?.periods,
                      includeAllBillSegments,
                    ),
                  );
                  const savedValue = (value || {})[selectedBillSegmentType?.billSegmentTypeCode];

                  const billSegmentType = {
                    ...(savedValue || selectedBillSegmentType),
                  };

                  const extraData = {};
                  selectedBillSegmentType?.billSegments?.forEach((s) => {
                    extraData[s?.id] =
                      billSegmentPercentages[s?.id]?.value === billSegmentType?.percentage
                        ? { value: data, isPercentage: true }
                        : billSegmentPercentages[s?.id];
                  });

                  setExtraTableData(extraData, percentageColumn);
                } catch {}
              }}
              valid={isBillSegmentTypePercentageValid}
              errorsList={[]}
              fullWidth
              inputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: {
                  max: 100,
                  min: 0,
                  ['data-testid']: `${id}-input`,
                },
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={styles.container}>
        {type && (
          <>
            <GenericCheckbox
              id={`${id}-by-period`}
              value={byPeriod}
              onChange={() => setByPeriod((prevValue) => !prevValue)}
              label={translate('applyPeriod', { ns: namespace, lng: selectedLanguage })}
            />
            <GenericCheckbox
              id={`${id}-set-includeAll`}
              value={includeAllBillSegments}
              onChange={() => {
                setIncludeAllBillSegments((prevValue) => !prevValue);
                toggleAllTableRows(!includeAllBillSegments);
              }}
              label={translate('includeAllBillSegments', { ns: namespace, lng: selectedLanguage })}
            />
            <GenericCheckbox
              id={`${id}-include-child-bill-segments`}
              value={childIncluded}
              onChange={() => setChildIncluded(!childIncluded)}
              label={translate('includeChildBillSegments', {
                ns: namespace,
                lng: selectedLanguage,
              })}
              disabled={isIncludedBillSegmentTypeDisabled}
            />
            <LiabilityIconButton
              type={selectedBillSegmentType?.billSegmentTypeCode}
              namespaces={[namespace]}
              visible={childIncluded}
              isCell={false}
            />
          </>
        )}
      </Box>
      {selectedBillSegmentType &&
        selectedBillSegmentType?.periods &&
        selectedBillSegmentType?.periods.length > 0 && (
          <Box sx={styles.container}>
            <DynamicForm
              id={'test'}
              data={selectedDataPeriods}
              schema={schema}
              uiSchema={uiSchema}
              disabled={true}
              formContext={{ mechanism: 'DEFAULT' }}
            />
          </Box>
        )}
      {byPeriod && (
        <Box sx={styles.container}>
          <DynamicForm
            id={TRANSITION_FORM}
            data={formData}
            schema={formSchema}
            uiSchema={formUiSchema}
            formContext={{ debounceUpdates: true, mechanism: 'DEFAULT' }}
            onChange={(data) => {
              setEntityFormData(data);
              setFieldValue(
                getValueAfterPeriodChange(
                  value,
                  selectedBillSegmentType,
                  data?.periods || [],
                  includedBillSegments,
                  billSegmentPercentages,
                  includeAllBillSegments,
                ),
              );
            }}
          />
        </Box>
      )}
      {type && !byPeriod && selectedBillSegmentType?.billSegments?.length !== 0 && (
        <UiIncludedBillSegmentContext.Provider value={{ disabled: childIncluded }}>
          <GenericTable parentId={id} configuration={configuration} />
        </UiIncludedBillSegmentContext.Provider>
      )}

      <CaseScopeSummary
        widgetId={id}
        selections={summaryLiabilityScope}
        savedScope={getCaseSavedSummary(savedScope)}
        currentScope={summaryCaseCurrentScope}
        namespace={namespace}
      />
    </Box>
  );
};

const constructList = (
  object,
  codeProperty: string,
  labelProperties: Array<string> = [],
  suffixes: Array<string> = [],
) => {
  return object?.map((obj) => ({
    code: obj[codeProperty],
    label:
      labelProperties
        .map(
          (prop, index) =>
            `${obj[prop] || (index === 0 ? obj[codeProperty] : '')}${suffixes[index] || ''}`,
        )
        .filter((prop) => !!prop)
        .join(' - ') || obj[codeProperty],
  }));
};

export default LiabilityCaseScopeWidget;
