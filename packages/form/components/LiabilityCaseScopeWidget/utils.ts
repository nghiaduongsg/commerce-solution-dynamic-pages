export const getCaseLiabilitySummary = (scope) => {
  const liabilityScope = scope?.billSegmentTypes || [];

  const summary = {};
  (liabilityScope || []).forEach((item) => {
    const {
      percentage,
      maxAmount,
      billSegments,
      periods = [],
      billSegmentTypeCode: code,
      billSegmentTypeDescription: description,
    } = item;

    summary[code] = {
      code,
      description,
      percentage,
      maxAmount,
      initialPercentage: percentage,
      initialMaxAmount: maxAmount,
      list: billSegments.map((b) => ({
        ...b,
        billSegment: { id: b.id, identificationLabel: description },
      })),
      periods: periods.map((p) => {
        return {
          ...p,
          list: p?.billSegments?.map((b) => ({
            ...b,
            billSegment: { id: b.id },
          })),
        };
      }),
    };
  });

  return summary;
};

export const getCaseSavedSummary = (scope) => {
  const summary = {};
  (scope || []).forEach((item) => {
    summary[item.billSegmentTypeCode] = {
      ...item,
      code: item.billSegmentTypeCode,
      description: item.billSegmentTypeDescription,
      list: item.billSegments?.filter((segment) => segment.included),
    };
  });

  return summary;
};

export const getCaseCurrentSummary = (scope) => {
  const summary = {};
  Object.keys(scope || {}).forEach((item) => {
    const {
      percentage,
      maxAmount,
      billSegments,
      periods = [],
      billSegmentTypeCode: code,
      billSegmentTypeDescription: description,
    } = scope[item];

    const filteredBillSegments = billSegments?.filter((segment) => segment.included);

    summary[code] = {
      percentage,
      maxAmount,
      code,
      description,
      initialPercentage: percentage,
      list: filteredBillSegments,
      periods: periods.map((p) => {
        return {
          ...p,
          list: p?.billSegments?.map((b) => ({
            ...b,
            billSegment: { id: b.id },
          })),
        };
      }),
    };
  });

  return summary;
};

export const getValueAfterPeriodChange = (
  value,
  selectedBillSegmentType,
  periods,
  selectedRows,
  extraData,
  includeAllBillSegments,
) => {
  const savedValue = (value || {})[selectedBillSegmentType?.billSegmentTypeCode];

  const billSegmentType = savedValue || selectedBillSegmentType;

  const billSegments = selectedBillSegmentType?.billSegments
    ?.filter((segment) => !selectedRows[segment.id])
    .map((segment) => {
      let percentage = undefined;
      let maxAmount = undefined;

      const isDefinedByUser = (extraData || {})[segment.id];
      const { value: thisValue, isPercentage } = (extraData || {})[segment.id] || {};
      if (isDefinedByUser && isPercentage) {
        percentage = thisValue || segment.percentage;
      } else {
        maxAmount = thisValue || segment.maxAmount;
      }
      return {
        included: false,
        percentage,
        maxAmount,
        billSegment: { id: segment.id, identificationLabel: segment.id },
      };
    });

  const newPeriods = periods?.map((period) => {
    if (period?.billSegments) {
      period.billSegments = [];
    }
    return period;
  });

  return {
    ...(value || {}),
    [billSegmentType?.billSegmentTypeCode]: {
      ...billSegmentType,
      periods: newPeriods,
      billSegments,
      includeAllBillSegments,
    },
  };
};

export const getValueAfterPercentageChange = (
  value,
  billSegmentTypePercentage,
  selectedBillSegmentType,
  selectedRows,
  periods,
  includeAllBillSegments,
) => {
  const savedValue = (value || {})[selectedBillSegmentType?.billSegmentTypeCode];

  const billSegmentType = {
    ...(savedValue || selectedBillSegmentType),
    percentage: billSegmentTypePercentage,
  };

  return {
    ...(value || {}),
    [billSegmentType?.billSegmentTypeCode]: {
      ...billSegmentType,
      periods,
      includeAllBillSegments,
    },
  };
};

export const getValueAfterInclusion = (
  value,
  selectedBillSegmentType,
  selectedRows,
  extraData,
  periods,
  includeAllBillSegments,
  rowServerErrors,
  caseScopeLoading,
) => {
  const savedValue = (value || {})[selectedBillSegmentType?.billSegmentTypeCode];

  const billSegmentType = {
    ...(savedValue || selectedBillSegmentType),
  };
  const billSegments = selectedBillSegmentType?.billSegments
    ?.filter((segment) => {
      const oldBillSegment = savedValue?.list?.find(
        (billSegment) => billSegment?.billSegment.id === segment.id,
      );
      const { value, isPercentage } = (extraData || {})[segment.id] || {};
      if (isPercentage) {
        return !(
          oldBillSegment?.autoIncluded &&
          value === oldBillSegment?.percentage &&
          selectedRows[segment.id]
        );
      } else
        return !(
          oldBillSegment?.autoIncluded &&
          value === oldBillSegment?.maxAmount &&
          selectedRows[segment.id]
        );
    })
    ?.filter((segment) => {
      const { value: thisValue } = (extraData || {})[segment.id] || {};
      return (
        !selectedRows[segment.id] ||
        (selectedRows[segment.id] && thisValue && !Number.isNaN(thisValue))
      );
    })
    .map((segment) => {
      let percentage = undefined;
      let maxAmount = undefined;
      const isDefinedByUser = (extraData || {})[segment.id];
      const { value: thisValue, isPercentage } = (extraData || {})[segment.id] || {};
      if (isDefinedByUser && isPercentage) {
        percentage = thisValue || segment.percentage;
      } else {
        maxAmount = thisValue || segment.maxAmount;
      }
      return {
        included: !!selectedRows[segment.id],
        percentage,
        maxAmount,
        billSegment: { id: segment.id, identificationLabel: segment.id },
      };
    });

  const includedBillSegmentIndexesWithNoValue = selectedBillSegmentType?.billSegments
    ?.map((segment, index) => {
      const { value: thisValue } = (extraData || {})[segment.id] || {};
      return !selectedRows[segment.id] ||
        (selectedRows[segment.id] && thisValue && !Number.isNaN(thisValue))
        ? null
        : index;
    })
    .filter((q) => !!q || q === 0); // !! filters all false values with 0 included so extra condition required

  if (billSegments?.length) {
    if (rowServerErrors.length === 0 || caseScopeLoading) {
      //very important to return value only when errors are empty for the first time and every time case scope call is happening to check if there are again errors
      return {
        ...(value || {}),
        [billSegmentType?.billSegmentTypeCode]: {
          ...billSegmentType,
          billSegments,
          periods,
          includedBillSegmentIndexesWithNoValue,
        },
      };
    }
    return {
      ...(value || {}),
      [billSegmentType?.billSegmentTypeCode]: {
        ...billSegmentType,
        billSegments,
        periods,
      },
    };
  } else {
    return {
      ...(value || {}),
      [billSegmentType?.billSegmentTypeCode]: {
        ...billSegmentType,
        billSegments: [],
        periods,
      },
    };
  }
};

export const getValueAfterSetFutureDebt = (
  value,
  selectedBillSegmentType,
  includeAllBillSegments,
) => {
  const savedValue = (value || {})[selectedBillSegmentType?.billSegmentTypeCode];

  const billSegmentType = {
    ...(savedValue || selectedBillSegmentType),
  };

  return {
    ...(value || {}),
    [billSegmentType?.billSegmentTypeCode]: {
      ...billSegmentType,
      includeAllBillSegments,
    },
  };
};
