import { TableFiltersMode, TableFiltersType } from '@pkg-list/src/types';

export interface TableFiltersProps {
  id: string;
  jsonSchema: { [key: string]: any };
  uiSchema: { [key: string]: any };
  parentId?: string;
  onClose?: () => void;
  collapsible?: boolean;
  mode?: TableFiltersMode;
  type?: TableFiltersType;
}
