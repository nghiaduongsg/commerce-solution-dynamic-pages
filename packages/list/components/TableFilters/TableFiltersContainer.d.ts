import { TableFilteringConfiguration } from '../../types';
import { TableFiltersMode, TableFiltersType } from '@pkg-list/src/types';

export interface TableFiltersContainerProps {
  filtering: TableFilteringConfiguration;
  parentId?: string;
  tableId: string;
  mode?: TableFiltersMode;
  type?: TableFiltersType;
}
