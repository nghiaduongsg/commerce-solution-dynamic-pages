import { AnyType } from '@pkg-common/types';
import { getWidgetImmediateParentId } from '@pkg-form/validations/utils/widgetUtils';

const objectToString = (item: AnyType) => {
  return Object.values(item)
    .map((value) => {
      if (typeof value === 'object' && value !== null) {
        return objectToString(value);
      }
      return value?.toString().toLowerCase();
    })
    .join(' ');
};

export const filterItems = (
  items: Array<AnyType> = [],
  searchKey: string | null,
  keepAll = false,
) => {
  if (!searchKey) {
    return items;
  }

  if (keepAll) {
    return items?.map((item) => {
      return { ...item, __HIDDEN__: objectToString(item).indexOf(searchKey) === -1 };
    });
  }
  return items?.filter((item) => {
    return objectToString(item).indexOf(searchKey) !== -1;
  });
};

export const getTreeSchema = (
  schema: AnyType,
  childrenProperty: string,
  action: string,
  level: number,
  childrenProperties?: Array<string>,
) => {
  if (action === 'add' && childrenProperty && level > 0) {
    const emptyProps = {};
    (childrenProperties ?? []).forEach((x) => (emptyProps[x] = undefined));
    return {
      properties: {
        ...schema?.items?.properties[childrenProperty]?.items?.properties,
        ...emptyProps,
      },
      type: 'object',
    };
  }
  return {
    properties: {
      ...schema?.items?.properties,
      [childrenProperty || '']: undefined,
    },
    type: 'object',
  };
};

export const getTreeUiSchema = (
  id: string,
  uiSchema: AnyType,
  namespace: string,
  childrenProperty: string,
  action: string,
  level: number,
) => {
  if (action === 'add' && childrenProperty && level > 0) {
    return {
      ...uiSchema?.items[childrenProperty]?.items,
      'ui:labels': { namespace },
      'ui:page': { id },
    };
  }

  return { ...uiSchema?.items, 'ui:labels': { namespace }, 'ui:page': { id } };
};

export const getLevelElementId = (
  id: string,
  childrenProperty: string,
  level: number,
  jsonPath: string,
  isAboutToAdd: boolean,
  isAboutToEdit: boolean,
  isAboutToDelete: boolean,
  isAboutToDuplicate: boolean,
) => {
  if (level === 0 && isAboutToAdd) {
    return id;
  }
  if (isAboutToEdit) {
    return jsonPath;
  } else if (isAboutToAdd) {
    return `${jsonPath}_${childrenProperty}`;
  } else if (isAboutToDelete) {
    return getWidgetImmediateParentId(jsonPath);
  } else if (isAboutToDuplicate) {
    return id;
  }
  return '';
};
