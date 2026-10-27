import jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { AnyType, AppColors } from '@pkg-common/types';
import { formatMessage, hasValue } from '@pkg-common/utils/utils';
import { shouldBeApplied } from '@pkg-common/dataResolver/utils';
import * as XLSX from 'xlsx';
import { encodeText } from '@pkg-common/utils';
import { TableColumnConfiguration, TableActionsDetails } from '@pkg-list/src/types';

/**
 * Utilitizes configuration schema and table data,
 * to resolve the route path of a related single form component
 */
const processValueType = (value, type, translateFn) => {
  switch (type) {
    case 'boolean':
      if (value === 'INACTIVE') return false.toString();
      return translateFn((!!value).toString());
    case 'string':
    default:
      return value;
  }
};

export const getCorrectColorConfiguration = (
  tableId: string,
  row: AnyType,
  extraData: { user?: string; state: AnyType; routeParams: AnyType; routerData: AnyType },
  colors: Array<AppColors>,
) => {
  return colors.find((colorConfig: AppColors) => {
    return shouldBeApplied(colorConfig?.visibilityFrom, tableId, extraData, row);
  });
};

export const getCellContent = (
  rowData: AnyType,
  column: TableColumnConfiguration,
  selectedLanguage: string,
  translateFn,
  namespaces: string | Array<string>,
  useFallbackAccessors = false,
) => {
  const {
    filterByUserLanguage = false,
    type,
    subType,
    accessors: defaultAccessors,
    fallbackAccessors,
    populatedBy,
    newLine,
  } = column;

  if (populatedBy) {
    return populatedBy?.map((key) => jp.value(rowData, key)).join(' ');
  }
  const accessors =
    (useFallbackAccessors && fallbackAccessors?.length ? fallbackAccessors : defaultAccessors) ??
    [];

  const path = ['$', ...accessors];

  if (type === 'object') {
    const rawValue = (rowData || {})[accessors[0]];
    const objectValue =
      typeof (rawValue || {}) === 'object' ? rowData || {} : JSON.parse(rawValue || {});
    const newColumns = accessors.slice(1, accessors.length);
    return getCellContent(
      objectValue,
      { ...column, accessors: newColumns, type: subType || 'string' },
      selectedLanguage,
      translateFn,
      namespaces,
    );
  }

  if (filterByUserLanguage) {
    const customAccessors = ['$', ...accessors];
    return jp.value(
      rowData,
      jp.stringify(customAccessors).replace('LNG_PARAM', selectedLanguage).replaceAll('"', ''),
    );
  }

  const cellValue = !path.includes('*')
    ? jp.value(rowData, path)
    : jp.query(rowData, jp.stringify(path).replace(/"/g, ''));

  if (Array.isArray(cellValue)) {
    const clonedCellValue = Array.from(new Set(cellValue));
    return clonedCellValue
      .map((clonedCellValueItem) => processValueType(clonedCellValueItem, type, translateFn))
      .join(newLine ? '\n ' : ', ');
  }

  if (type === 'placeholder' && rowData && rowData.parameters) {
    return formatMessage(cellValue, rowData.parameters, translateFn, selectedLanguage, namespaces);
  }

  return processValueType(cellValue, type, translateFn);
};

export const getRelatedColumnValue = (row: AnyType, column: TableColumnConfiguration) => {
  const relatedColumn = column?.relatedColumn;
  if (!relatedColumn) return undefined;

  if (typeof relatedColumn === 'object' && Object.keys(relatedColumn).length > 0) {
    try {
      return jp.value(row, jp.stringify(relatedColumn));
    } catch {
      return undefined;
    }
  }

  if (typeof relatedColumn === 'string') {
    return row[relatedColumn];
  }

  return undefined;
};

const actions = {
  edit: 'updateEntity',
  read: 'readEntity',
  redirect: 'redirectEntity',
  duplicate: 'duplicateEntity',
};

export const extractRoutePath = (pathToRoute, row) => {
  return pathToRoute?.length
    ? jp.value(row, jp.stringify(pathToRoute).replaceAll('"', ''))
    : undefined;
};

export const extractRouteId = (pathParam, row) => {
  return pathParam?.length ? jp.value(row, jp.stringify(pathParam).replaceAll('"', '')) : undefined;
};

export const resolveRouteInfo = ({
  entityId,
  entityUrl,
  action,
  actionDetails,
  row,
}: {
  entityId: string;
  entityUrl: string | null | undefined;
  action: 'edit' | 'read' | 'redirect' | 'duplicate';
  actionDetails: TableActionsDetails | undefined;
  row: AnyType;
}): { routePath: string | null; routeState: { [key: string]: AnyType } | null } => {
  try {
    const routePath =
      actionDetails && actionDetails[actions[action]]
        ? extractRoutePath(actionDetails[actions[action]]?.jsonPath, row)
        : '';

    const finalEntityId =
      actionDetails && actionDetails[actions[action]]
        ? extractRouteId(actionDetails[actions[action]]?.pathParam, row)
        : entityId;

    const finalRoutePath = entityUrl
      ? `${entityUrl}${routePath ? '/' + routePath : ''}`
      : `${routePath ? '/' + routePath : ''}`;

    if (action === 'duplicate') {
      return {
        routePath: finalRoutePath,
        routeState: { id: finalEntityId },
      };
    }

    return {
      routePath: `${finalRoutePath}${finalEntityId ? '/' + encodeText(finalEntityId) : ''}`,
      routeState: {},
    };
  } catch (error) {
    return { routePath: null, routeState: null };
  }
};

export const buildJsonPath = (pathSegments: string[]) => {
  let path = '$';
  for (const segment of pathSegments) {
    if (segment === '*') path += '[*]';
    else path += `.${segment}`;
  }
  return path;
};

export const clearData = (
  initialData: { [key: string]: AnyType },
  paths: { jsonPath: string[]; value?: AnyType }[],
) => {
  const data = cloneDeep(initialData);
  const pathEntries = typeof paths === 'object' ? Object.values(paths) : paths;

  if (Array.isArray(pathEntries)) {
    pathEntries.forEach((prop) => {
      try {
        if (!prop?.jsonPath) return;
        const jsonPath = buildJsonPath(prop.jsonPath);

        jp.apply(data, jsonPath, () => prop?.value ?? null);
      } catch (error) {
        console.error('Error finding path:', prop?.jsonPath, error);
      }
    });
  }
  return data;
};

export const cleanId = (input: string) => input.replace(/^undefined_/, '').replace(/_\d+_/g, '_');

export const generateExcel = async (
  columns,
  pageData,
  translate,
  namespace,
  selectedLanguage,
  enqueueSnackbar,
  showDownloadDialog,
) => {
  const headers = columns.map((col) =>
    translate(col.name, { ns: namespace, lng: selectedLanguage }),
  );

  const rows = pageData.map((row) =>
    columns.map(
      (col) => getCellContent(row, col, selectedLanguage, translate, namespace) ?? col.defaultValue,
    ),
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const fileBlob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'data.xlsx',
        types: [
          {
            description: 'Excel Files',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(fileBlob);
      await writable.close();
      enqueueSnackbar({
        key: new Date().getTime(),
        message: 'filePickerSuccess',
        severity: 'dark',
      });
    } else {
      showDownloadDialog(() => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(fileBlob);
        link.download = 'data.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  } catch (error) {
    if (!(typeof error === 'object' && error?.toString().includes('The user aborted a request'))) {
      enqueueSnackbar({
        key: new Date().getTime(),
        message: 'filePickerError',
        severity: 'error',
      });
    }
  }
};

export const hasEmptyMandatoryFilters = (requiredFilters: string[], data: Record<string, any>) => {
  return requiredFilters.some((key) => {
    return !hasValue(data?.[key]);
  });
};

export const getActiveCriteriaCount = (criteria) => {
  if (!criteria) return 0;

  let count = 0;

  Object.keys(criteria)
    .filter((c) => !!criteria[c])
    .forEach((c) => {
      const criterionValue = criteria[c];

      if (Array.isArray(criterionValue)) {
        criterionValue.forEach((value) => {
          if (typeof value === 'object' && value !== null) {
            const { identificationLabel, ...rest } = value;
            count += identificationLabel ? 1 : Object.keys(rest).length;
          } else {
            count += 1;
          }
        });
      } else if (typeof criterionValue === 'object' && criterionValue !== null) {
        const { identificationLabel, ...rest } = criterionValue;

        if (identificationLabel) {
          count += 1;
        } else {
          const validProperties = Object.entries(rest).filter(([_, val]) => !!val);
          count += validProperties.length;
        }
      } else {
        count += 1;
      }
    });

  return count;
};
