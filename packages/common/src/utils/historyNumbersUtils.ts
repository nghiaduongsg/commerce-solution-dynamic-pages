import { AnyType } from '../types';

const getUpdatedValue = (
  value: number | undefined = 0,
  modification: number | undefined = 0,
  active = false,
) => {
  return active ? value + +modification : 0;
};

const getCalculatedRow = (row: AnyType, addedValue: AnyType, index: AnyType) => {
  return {
    ...row,
    correctedValue: getUpdatedValue(addedValue, row.modification, row.active),
    sequence: index + 1,
    user: row.id ? row.user : null,
    active: row.active ?? false,
  };
};

const recalculateRows = (list: AnyType, reported = 0) => {
  let activeIndex = -1;

  list.forEach((row: AnyType, index: AnyType) => {
    const value = activeIndex === -1 ? +reported : +list[activeIndex].correctedValue;
    const addedValue = row.active ? value : 0;

    list[index] = getCalculatedRow(row, addedValue, index);

    if (row.active) {
      activeIndex = index;
    }
  });

  return list;
};

const fillRows = (list: AnyType) => {
  list.forEach((row: AnyType, index: number) => {
    list[index] = getTextRow(row, index);
  });

  return list;
};

const getTextRow = (row: AnyType, index: number) => {
  return {
    ...row,
    correctedValue: row.correctedValue,
    sequence: index + 1,
    user: row.id ? row.user : null,
    active: row.active ?? false,
  };
};

export function addEditLocallySavedTextRow(tableData: AnyType[], row: AnyType): AnyType[] {
  if (tableData?.length === 0) {
    return [getTextRow(row, 0)];
  }
  if (row.sequence) {
    const indexOfEditedItem = tableData.findIndex((tableRow) => tableRow.sequence === row.sequence);
    tableData[indexOfEditedItem] = row;
    return fillRows(tableData);
  }
  return fillRows([...tableData, row]);
}

export const deleteLocallySavedTextRow = (tableData: AnyType, deletedRow: AnyType): AnyType[] => {
  return tableData.filter((row: AnyType) => row.sequence !== deletedRow.sequence);
};

export function addEditLocallySavedRow(
  tableData: AnyType[],
  row: AnyType,
  reported: AnyType,
): AnyType[] {
  // if list is empty, add new entry
  if (tableData?.length === 0) {
    return [getCalculatedRow(row, reported, 0)];
  }
  // edit
  if (row.sequence) {
    const indexOfEditedItem = tableData.findIndex((tableRow) => tableRow.sequence === row.sequence);
    tableData[indexOfEditedItem] = row;
    return recalculateRows(tableData, reported);
  } else {
    // add new on Existing List
    return recalculateRows([...tableData, row], reported);
  }
}

export const deleteLocallySavedRow = (
  tableData: AnyType,
  deletedRow: AnyType,
  reported: AnyType,
): AnyType[] => {
  return recalculateRows(
    tableData.filter((row: AnyType) => row.sequence !== deletedRow.sequence),
    reported,
  );
};
