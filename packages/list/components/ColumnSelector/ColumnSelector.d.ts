import { AnyType } from '@pkg-common/types';

export interface ColumnSelectorProps {
  tableId: string;
  tableName: string;
  visible?: boolean;
  parentId?: string;
  filtersType?: string;
  onClose?: AnyType;
  columnOptions?: AnyType;
  onColumnVisibilityChange?: AnyType;
  selectedColumnValues?: AnyType;
}
