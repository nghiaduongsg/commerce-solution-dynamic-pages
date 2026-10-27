import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import { hasValue } from '@pkg-common/utils';
import { CODELISTS, ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useTable from '@pkg-list/hooks/useTable';
import { useSelector } from 'react-redux';
import { selectAllLists } from '@pkg-core/codeList/redux/selectors';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const deleteCriterion = (criteria, criterionId, criterionValue = '') => {
  const value = criteria[criterionId];
  const updated = { ...criteria };
  if (Array.isArray(value)) {
    updated[criterionId] = value.filter((v) => v !== criterionValue);
  } else {
    delete updated[criterionId];
  }
  return updated;
};

export const TableFiltersChips = ({ tableId, namespace, filterUiSchema }) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([CODELISTS, ACCESSIBILITY, COMMON, namespace]);

  const { criteria, predefinedCriteria, removableQueries, applyCriteria, setPredefinedCriteria } =
    useTable(tableId);
  const { getComponentValueType } = useFormManagerContext();
  const codelistLists = useSelector(selectAllLists);

  const onDeleteCriterion = (
    predefinedCriteria,
    isPredefined,
    excluded,
    allCriteria,
    allowDelete?,
  ) => {
    if (isPredefined) {
      const updatedPredefinedCriteria = deleteCriterion(predefinedCriteria, excluded, allowDelete);
      const updatedCriteria = deleteCriterion(allCriteria, excluded, allowDelete);
      setPredefinedCriteria(updatedPredefinedCriteria);
      applyCriteria(updatedCriteria);
    } else {
      applyCriteria(deleteCriterion(allCriteria, excluded, allowDelete));
    }
  };

  const renderChip = (criterion: string, value: string, onDelete?: () => void) => {
    const translationKey =
      (filterUiSchema?.[criterion]?.['ui:options']?.translation?.key as string) ?? criterion;

    const finalValue =
      value === 'Y' || value === 'N'
        ? translate((value === 'Y').toString(), { ns: 'COMMON', lng: selectedLanguage })
        : value || '';

    const formattedValue = finalValue.toString().replace(/:\s*/g, '.');
    const translatedCriterion = translate(translationKey, { ns: namespace, lng: selectedLanguage });
    const valueType = getComponentValueType(criterion);

    const codelist = codelistLists?.[valueType];

    const translatedValue =
      codelist?.find((item) => item.code === formattedValue)?.label ?? formattedValue;

    const translatedLabel = `${translatedCriterion}: ${translatedValue}`;

    return (
      <Tooltip
        title={translatedLabel}
        placement="top"
        role={hasValue(translatedLabel) ? 'tooltip' : undefined}
      >
        <Chip
          key={`${criterion}-${value}`}
          id={`table-filter-${criterion}`}
          label={translatedLabel}
          onDelete={onDelete}
          size="medium"
          variant="outlined"
          color="primary"
        />
      </Tooltip>
    );
  };

  const renderChips = (allCriteria, isPredefined, excluded, allFiltersApplied, allowDelete?) => {
    const allChips: Array<JSX.Element> = [];

    const processObjectEntries = (rest, onDelete) => {
      const validEntries = Object.entries(rest).filter(([_, val]) => !!val);
      validEntries.forEach(([key, val]) => {
        allChips.push(renderChip(key, val?.toString() ?? '', onDelete));
      });
    };

    const processArrayValue = (
      value,
      c,
      isDeletionAllowed,
      allCriteria,
      isPredefined,
      allFiltersApplied,
    ) => {
      const onDelete =
        isDeletionAllowed &&
        (() => onDeleteCriterion(allCriteria, isPredefined, c, allFiltersApplied, value));

      if (typeof value === 'object' && value !== null) {
        const { identificationLabel, ...rest } = value;
        if (identificationLabel) {
          allChips.push(renderChip(c, identificationLabel, onDelete));
        } else {
          processObjectEntries(rest, onDelete);
        }
      } else {
        allChips.push(renderChip(c, value, onDelete));
      }
    };

    Object.keys(allCriteria ?? {})
      .filter((c) => !!allCriteria[c] && !excluded[c])
      .forEach((c) => {
        const allowRemoveQueries = Array.isArray(removableQueries)
          ? removableQueries.includes(c)
          : false;
        const isDeletionAllowed = allowDelete ?? allowRemoveQueries;

        const criterionValue = allCriteria[c];

        if (Array.isArray(criterionValue)) {
          criterionValue.forEach((value) => {
            processArrayValue(
              value,
              c,
              isDeletionAllowed,
              allCriteria,
              isPredefined,
              allFiltersApplied,
            );
          });
        } else if (typeof criterionValue === 'object' && criterionValue !== null) {
          const onDelete =
            isDeletionAllowed &&
            (() => onDeleteCriterion(allCriteria, isPredefined, c, allFiltersApplied));

          const { identificationLabel, ...rest } = criterionValue;

          if (identificationLabel) {
            allChips.push(renderChip(c, identificationLabel, onDelete));
          } else {
            processObjectEntries(rest, onDelete);
          }
        } else {
          const onDelete =
            isDeletionAllowed &&
            (() => onDeleteCriterion(allCriteria, isPredefined, c, allFiltersApplied));

          allChips.push(renderChip(c, criterionValue, onDelete));
        }
      });

    return allChips;
  };

  return (
    <>
      {renderChips(predefinedCriteria, true, {}, criteria)}
      {renderChips(criteria, false, predefinedCriteria, criteria, true)}
    </>
  );
};
