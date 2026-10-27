import { ActionButtonType, AppActionButtons } from '@pkg-common/components/AppActions/types';
import {
  TableSelectionsConfiguration,
  TableActionsDetails,
  TableConfiguration,
} from '@table/types';
import { ChangeIndicatorsSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';
import { ReactNode } from 'react';

export interface TableBodyProps {
  tableId: string;
  namespaces?: Array<string>;
  selections: TableSelectionsConfiguration;
  actionDetails?: TableActionsDetails;
  boldRows?: 'LAST' | 'EVEN' | 'ODD';
  configuration: TableConfiguration;
  parentId?: string;
  rowButtons?: AppActionButtons;
  rowContent?: ({ row: AnyType }) => ReactNode | null;
  mode?: 'LOCAL' | 'DEFAULT';
  changeIndicators?: ChangeIndicatorsSchema;
}
