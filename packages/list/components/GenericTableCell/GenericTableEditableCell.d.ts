import { AnyType } from '@pkg-common/types';

export interface GenericTableEditableCellProps {
  tableId: string;
  row?: AnyType;
  rowId: string;
  rowIndex?: number;
  columnIndex?: number;
  rowIndex?: number;
  disabled?: boolean;
  defaultSymbol?: string;
  validations?: ValidationRule;
  cellId?: string;
  value?: AnyType;
  columnName?: string;
}
