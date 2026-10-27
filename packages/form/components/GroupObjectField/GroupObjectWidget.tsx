import useFormField from '@pkg-entity/hooks/useFormField';
import React, { useEffect, useMemo, useRef } from 'react';
import { GenericTable } from '@pkg-list/components';
import useTable from '@pkg-list/hooks/useTable';
import { formatMetadata, getFinalConfiguration, getTableRows } from './utils';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import { FormWidgetProps, GroupObjectWidgetOptions } from '@pkg-form/types';
import useSystem from '@pkg-setup/src/system/useSystem';

const GroupObjectWidget = ({
  id,
  options,
  value: innerValue,
  onChange,
  formContext,
  uiSchema,
}: FormWidgetProps & { options: GroupObjectWidgetOptions }) => {
  const {
    allColumns,
    rows,
    disabledFrom,
    correctionsDisabledFrom,
    translations,
    apiValues,
    showTitle = true,
  } = options;
  const buttons = uiSchema['ui:buttons'];

  const useDefaultMechanism = formContext?.mechanism === 'DEFAULT';
  const { value, setFieldValue } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    false,
  );

  const valueRef = useRef({});

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([formContext?.namespace]);

  const { check: disabled } = useCheckFrom(id, disabledFrom, false);
  const { check: correctionsDisabled } = useCheckFrom(id, correctionsDisabledFrom, true);

  const { setTableData, setAllExtraTableData, initTable, tableData } = useTable(id);
  const previousTableData = useRef(tableData);

  useEffect(() => {
    initTable({ correctionsDisabled });
  }, [correctionsDisabled]);

  useEffect(() => {
    initTable({ disabled });
  }, [disabled]);

  const configuration = useMemo(
    () =>
      getFinalConfiguration(
        id,
        allColumns,
        formContext?.namespace || '',
        rows,
        apiValues,
        showTitle,
        buttons,
      ),
    [allColumns],
  );

  useEffect(() => {
    if (JSON.stringify(value || {}) !== JSON.stringify(valueRef.current || {}) || !value) {
      valueRef.current = value;
      setTableData({
        data: getTableRows(
          rows,
          allColumns,
          translations?.namespace || '',
          value,
          translate as any,
          selectedLanguage,
        ),
      });
    }
  }, [value, selectedLanguage]);

  useEffect(() => {
    setAllExtraTableData(formatMetadata(allColumns, rows));
  }, [allColumns, rows, value, setAllExtraTableData]);

  useEffect(() => {
    let groupedTableData = {};
    tableData.forEach(
      (line) =>
        (groupedTableData = {
          ...groupedTableData,
          ...line,
          label: undefined,
          translatedLabel: undefined,
          code: undefined,
          calculatedByBe: undefined,
        }),
    );
    const newValue = { ...value, ...groupedTableData };
    if (!isEqual(tableData, previousTableData.current)) {
      setFieldValue(newValue);
    }

    previousTableData.current = tableData;
  }, [tableData]);

  return (
    <GenericTable
      parentId={id}
      configuration={configuration as any}
      disabled={disabled}
      hasRefreshButton={false}
      filterSaveSupport={false}
    />
  );
};

export default GroupObjectWidget;
