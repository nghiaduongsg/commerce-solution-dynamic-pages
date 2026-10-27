import { TableActions, TableConfiguration } from '@pkg-list/src/types';
import { ChangeIndicatorsSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';
import { ReactNode } from 'react';

export interface TableProps {
  subtitle?: string;
  filtering?: {
    openFilters: boolean;
    enabled: boolean;
    schema: { [key: string]: any };
    uiSchema: { [key: string]: any };
  };
  actions?: TableActions;
  pagination?: {
    enabled: boolean;
  };
  configuration: TableConfiguration;
  entityUrl?: string;
  entityNewUrl?: string;
  parentId?: string;
  headerContent?: JSX.Element | null;
  rowContent?: ({ row: AnyType }) => ReactNode | null;
  onFocus?: () => void;
  changeIndicators?: ChangeIndicatorsSchema;
  onExpanded?: () => void;
  buttonsPosition?: 'EMBEDDED' | 'PAGE_LEVEL';
}
