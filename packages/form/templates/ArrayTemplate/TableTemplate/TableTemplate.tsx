import React, { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnyType } from '@pkg-common/types';
import { humanizeKey } from '@pkg-common/utils';
import DetailTable from '@pkg-common/components/DetailTable/DetailTable';
import SingleValueRenderer from '@pkg-common/components/ValuesRenderer/SingleValueRenderer';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { ArrayTemplateProps } from '../ArrayTemplate.d';

type TableColumnDecl = { key: string; labelKey: string };

const isPlainObject = (value: AnyType) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isEmptyValue = (value: AnyType) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/**
 * Flattens a record one level deep so a nested group (e.g. `validation`) sits
 * beside the record's own fields, letting the side panel show them as a single
 * labelled list. Top-level keys win over nested ones on collision.
 */
const flattenRow = (row: AnyType): Record<string, AnyType> => {
  const flat: Record<string, AnyType> = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    if (isPlainObject(value)) {
      Object.entries(value as Record<string, AnyType>).forEach(([nestedKey, nestedValue]) => {
        if (!(nestedKey in flat)) flat[nestedKey] = nestedValue;
      });
    } else if (!(key in flat)) {
      flat[key] = value;
    }
  });
  return flat;
};

/**
 * `ui:ArrayType: "table"` — renders an array of objects as a compact,
 * read-only table (minimal columns) that opens a side panel with the full
 * record on row select. It adapts the schema declaration to the reusable
 * `DetailTable`: column headers and detail labels are resolved against the
 * page's translation namespace from the stable keys declared in the schema.
 *
 * `ui:options`:
 * - `tableColumns`: `[{ key, labelKey }]` columns shown in the table.
 * - `titleKey`: property used as each row's side-panel heading.
 * - `detailLabels`: `{ [propertyKey]: translationKey }` labels (and ordering)
 *   for the side panel, including nested validation keys. When provided, only
 *   these properties are shown; otherwise every non-empty property is listed
 *   with a humanized key.
 */
const TableTemplate = (props: ArrayTemplateProps) => {
  const { formData, uiSchema, formContext } = props;
  const options = (uiSchema && uiSchema['ui:options']) || {};
  const namespace = formContext?.namespace || COMMON;
  const { t } = useTranslation(namespace);

  const tableColumns: Array<TableColumnDecl> = options.tableColumns || [];
  const detailLabels: Record<string, string> = options.detailLabels || {};
  const titleKey: string = options.titleKey || tableColumns[0]?.key;

  const rows = Array.isArray(formData) ? formData : [];

  const columns = useMemo(
    () => tableColumns.map((column) => ({ key: column.key, label: t(column.labelKey, { ns: namespace }) })),
    [tableColumns, namespace, t],
  );

  const labelMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(detailLabels).forEach(([key, labelKey]) => {
      map[key] = t(labelKey, { ns: namespace });
    });
    return map;
  }, [detailLabels, namespace, t]);

  const rowTitle = (row: AnyType) =>
    String(row?.[titleKey] ?? (tableColumns[0] ? row?.[tableColumns[0].key] : '') ?? '');

  const renderValue = (value: AnyType) => {
    if (Array.isArray(value)) {
      return <Typography variant="body2">{value.map((item) => String(item)).join(', ')}</Typography>;
    }
    return <SingleValueRenderer value={value} />;
  };

  const renderDetail = (row: AnyType) => {
    const flat = flattenRow(row);
    const configured = Object.keys(detailLabels);
    const keys = (configured.length ? configured : Object.keys(flat)).filter(
      (key) => !isEmptyValue(flat[key]),
    );
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {keys.map((key) => (
          <Grid container spacing={1} key={key}>
            <Grid size={{ xs: 5 }}>
              <Typography variant="body2" color="textSecondary">
                {labelMap[key] ?? humanizeKey(key)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 7 }}>{renderValue(flat[key])}</Grid>
          </Grid>
        ))}
      </Box>
    );
  };

  return (
    <DetailTable
      columns={columns}
      rows={rows}
      getRowId={(row, index) => String(row?.key ?? row?.id ?? index)}
      rowTitle={rowTitle}
      renderDetail={renderDetail}
      dataTestId={formContext?.dataTestId}
    />
  );
};

export default TableTemplate;
