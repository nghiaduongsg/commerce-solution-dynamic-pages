import omit from 'lodash/omit';
import findKey from 'lodash/findKey';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { AnyType } from '@pkg-common/types';
import { isArray } from 'lodash';

// We assume that if a schema property is type array, that property is the children for the tree.
export const getChildrenKeyName = (schema) =>
  findKey(schema.properties, (schemaField) => schemaField.type === 'array');

export const dropChildrenFromSchema = (schema) => {
  const childrenKeyName = getChildrenKeyName(schema);

  return omit(schema, [`properties.${childrenKeyName}`]);
};

export const keepOnlyChildrenFromSchema = (schema) => {
  const childrenKeyName = getChildrenKeyName(schema);

  return pick(schema, [`properties.${childrenKeyName}`, 'type']);
};

export const convertUiSchemaToReadMode = (uiSchema) => {
  const newUiSchema = cloneDeep(uiSchema);

  for (const property in newUiSchema) {
    newUiSchema[property]['ui:options'].treeItemIsInReadMode = true;
  }

  return newUiSchema;
};

export const getSchemaHasChildren = (schema) => Boolean(getChildrenKeyName(schema));

export const getTreeItemPadding = (depth = 0) => {
  return depth > 0 ? depth * 4 : 0;
};

export const getAddNewButtonPaddingLeft = (depth: number) => {
  return (depth + 1) * 48;
};

export const getFinalMessages = (infoValue) => {
  const lines: Array<AnyType> = [];
  Object.values(infoValue || []).forEach((item) => {
    if (typeof item === 'string' || typeof item === 'number') {
      lines.push(item);
    } else if (isArray(item)) {
      item.forEach((p) => lines.push(p));
    }
  });
  return lines.filter((item) => !!item);
};
