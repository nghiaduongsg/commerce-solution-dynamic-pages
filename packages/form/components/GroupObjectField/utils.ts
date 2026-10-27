import { AnyType } from '@pkg-common/types';
import { GroupObjectRows } from '@pkg-form/types';
import { ApiValuesSchema, CheckFromSchema } from '@pkg-common/types';
import { AppActionButtons } from '@pkg-common/button/types';

const getDefaultColumnConfig = (name: string) => ({
  type: 'editable',
  name,
  accessors: [name],
  align: 'left',
  visible: true,
  truncate: {
    enabled: false,
    width: 100,
    lines: 1,
  },
});

export const getFinalConfiguration = (
  tableId: string,
  columns: string[],
  namespace: string,
  rows: GroupObjectRows,
  apiValues?: ApiValuesSchema,
  showTitle?: boolean,
  buttons?: AppActionButtons,
) => {
  const baseConf = {
    'ui:labels': {
      namespace,
    },
    avoidDefaultLoad: true,
    tableId,
    showTitle,
    rowId: 'label',
    url: '',
    heightAdjustable: false,
    columnConfigurable: false,
    unfolded: true,
    apiValues,
    columns: [
      {
        type: 'string',
        name: 'fiscalCode',
        accessors: ['code'],
        align: 'left',
        visible: showCodeColumn(rows),
        bold: true,
        width: 10,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
      {
        type: 'string',
        name: 'label',
        accessors: ['translatedLabel'],
        align: 'left',
        visible: true,
        bold: true,
        truncate: {
          enabled: false,
          width: 100,
          lines: 1,
        },
      },
    ],
  };

  if (buttons) {
    baseConf['ui:buttons'] = buttons;
  }

  const additionalColumns = columns.map((columnName: string) => getDefaultColumnConfig(columnName));

  // @ts-ignore
  baseConf.columns.push(...additionalColumns);

  return baseConf;
};

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const formatMetadata = (allColumns: Array<string>, rows: GroupObjectRows) => {
  const metadata = {};
  allColumns.forEach((_, index) => (metadata[index + (showCodeColumn(rows) ? 2 : 1)] = {})); // adding one or two for first fixed columns of label and possible code

  const rowLabels = Object.keys(rows);

  rowLabels.forEach((r, index) => {
    const inner = rows[r];

    inner?.columns?.forEach((c) => {
      const columnIndex = allColumns.indexOf(c) + (showCodeColumn(rows) ? 2 : 1); // adding one or two for first fixed columns of label and possible code
      metadata[columnIndex][index] = true;
    });
  });
  return metadata;
};

export const getTableRows = (
  rows: GroupObjectRows,
  allColumns: Array<string>,
  namespace: string,
  value: AnyType,
  translate: (string: string, options: AnyType) => string,
  lng: string,
) => {
  const rowNames = Object.keys(rows);

  return rowNames.map((key) => {
    const line = {
      label: key,
      translatedLabel: translate(key, { ns: namespace, lng }),
      calculatedByBe: rows[key].calculatedByBe ?? false,
      code: rows[key]?.code ?? '',
    };

    allColumns.forEach((c: string) => {
      const capitalizedC = capitalizeFirstLetter(c);
      const finalKey = `${key}${capitalizedC}`;
      line[finalKey] = value ? value[finalKey] : null;
    });

    return line;
  });
};

export const showCodeColumn = (rows: GroupObjectRows) => {
  const rowNames = Object.keys(rows);
  return rowNames.some((key) => rows[key]?.code);
};
