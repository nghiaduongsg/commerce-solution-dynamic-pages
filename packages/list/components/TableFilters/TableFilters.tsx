import React, { useCallback, useEffect, useMemo } from 'react';
import useTable from '@pkg-list/hooks/useTable';
import { TableFiltersProps } from './TableFilters.d';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import {
  isValidRequired,
  hasValidMinLength,
} from '@pkg-form/validations/utils/textValidationUtils';
import useDebouncedAction from '@pkg-common/hooks/useDebouncedAction';
import { getDebounceDelay } from '../../../form/validations/utils/widgetUtils';
import { hasValue } from '@pkg-common/utils';

const TableFilters = ({
  id,
  jsonSchema,
  uiSchema,
  parentId,
  onClose,
  collapsible = false,
  mode = 'ON_CLICK',
  type = 'DRAWER',
}: TableFiltersProps) => {
  const { applyCriteria, clearCriteria, setFilterData, filterData, setTableData } = useTable(id);

  const invalidFields = useMemo(() => {
    return Object.keys(uiSchema)?.filter((key) => {
      const isRequired = !!uiSchema[key]?.['ui:options']?.validations?.required;
      const minLength = uiSchema[key]?.['ui:options']?.validations?.minLength;
      return !(
        isValidRequired(isRequired, filterData?.[key], false) &&
        hasValidMinLength(minLength, filterData?.[key])
      );
    });
  }, [uiSchema, filterData]);

  const isValid = useMemo(() => {
    return invalidFields?.length === 0;
  }, [invalidFields]);

  const onApply = useCallback(() => {
    onClose?.();
    applyCriteria();
  }, [applyCriteria, onClose]);

  const onClear = useCallback(() => {
    onClose?.();
    clearCriteria();
  }, [clearCriteria, onClose]);

  const applyFiltersDebounced = useDebouncedAction(onApply, getDebounceDelay(true) + 50);
  const clearFiltersDebounced = useDebouncedAction(onClear, getDebounceDelay(true) + 50);

  useEffect(() => {
    if (mode !== 'QUICK_FILTER') {
      return;
    }

    if (isValid && hasValue(filterData)) {
      applyCriteria();
    } else {
      setTableData({ data: [] });
    }
  }, [mode, filterData, isValid, applyCriteria]);

  const formContext = useMemo(
    () => ({
      mechanism: 'DEFAULT',
      buttonPosition: collapsible || type === 'TOP' ? 'DEFAULT' : 'ABSOLUTE',
      hideButtons: mode === 'QUICK_FILTER' || type === 'TOP',
      filterMode: true,
    }),
    [type, mode, collapsible],
  );

  return (
    <DynamicForm
      id={`${id}-filters`}
      dataTestId={parentId || `${id}-filters`}
      data={filterData}
      schema={jsonSchema}
      uiSchema={uiSchema}
      onClear={clearFiltersDebounced}
      onSubmit={isValid ? applyFiltersDebounced : undefined}
      formContext={formContext}
      onChange={setFilterData}
    />
  );
};

export default TableFilters;
