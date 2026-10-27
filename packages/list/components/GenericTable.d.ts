import { AnyType } from '@pkg-common/types';
import { TableConfiguration } from '@pkg-list/src/types';
import { ReactElement, ReactNode } from 'react';
import { ChangeIndicatorsSchema } from '@pkg-form/types';

export interface GenericTableProps {
  parentId?: string;
  configuration: TableConfiguration;
  filterSchema?: any;
  filterUiSchema?: any;
  entityUrl?: string;
  disabled?: boolean;
  maintainFilters?: boolean;
  headerContent?: ReactElement | null;
  rowContent?: ({ row: AnyType }) => ReactNode | null;
  fieldId?: string;
  hasRefreshButton?: boolean;
  initialState?: AnyType;
  changeIndicators?: ChangeIndicatorsSchema;
  filterSaveSupport?: boolean;
  delayInitialisation?: boolean;
  buttonsPosition?: 'EMBEDDED' | 'PAGE_LEVEL';
}
