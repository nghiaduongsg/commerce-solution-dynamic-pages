import { TableActionsDetails } from '@pkg-list-types/*';
import { AnyType } from '@pkg-common/types';

export interface HistoryFieldsTableActionsProps {
  tableId: string;
  rowIdKey: string;
  rowData: AnyType;
  actionDetails?: TableActionsDetails;
  configuration: AnyType;
  parentId?: string;
}
