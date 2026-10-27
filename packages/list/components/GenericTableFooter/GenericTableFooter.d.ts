import { AnyType } from '@pkg-common/types';
import { TableSelectionsConfiguration } from '@pkg-list-types/*';

export interface GenericTableFooterProps {
  tableId: string;
  parentId?: string;
  pagination: AnyType;
  selections: TableSelectionsConfiguration;
  // pageSizes: Array<number>;
  // selectable: boolean;
  // comparable?: boolean;
  // onSelectionsApplied?: (items) => void;
  // onCancel?: () => void;
  //
  // hasPagination?: boolean;
}
