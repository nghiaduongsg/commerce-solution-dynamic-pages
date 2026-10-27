export interface GenericTableToggleCellProps {
  tableId: string;
  rowId: string;
  isMultiSelect: boolean;
  columnIndex?: number;
  disabled?: boolean;
  sticky?: boolean;
  maxLimit?: number;
}
