import { AnyType } from '@pkg-common/types';

import { ReactNode } from 'react';
import {
  TableActionsDetails,
  TableConfiguration,
  TableSelectionsConfiguration,
} from '@pkg-list/src/types';
import { ChangeIndicatorsSchema } from '@pkg-form/types';

export interface GenericTableRowProps {
  tableId: string;
  row: any;
  selections: TableSelectionsConfiguration;
  actionDetails?: TableActionsDetails;
  configuration: TableConfiguration;
  parentId?: string;
  namespaces?: Array<string>;
  rowButtons?: AnyType;
  rowContent?: ({ row: AnyType }) => ReactNode | null;
  mode?: 'LOCAL' | 'DEFAULT';
  level?: 0 | 1 | 2;
  changeIndicators?: ChangeIndicatorsSchema;
}
