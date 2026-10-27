import { AnyType, AppColors } from '@pkg-common/types';

export interface GenericTableCellProps {
  value: string;
  tableId: string;
  rowId: string;
  row: AnyType;
  styles?: AnyType;
  namespaces?: Array<AnyType>;
  relatedColumnValue?: string;
  cellAriaDescription?: string;
  config: {
    align: 'left' | 'center' | 'right' | 'justify' | 'inherit' | undefined;
    entityTitle: string;
    defaultSymbol: string;
    entityId: string;
    clickable: boolean;
    newLine?: boolean;
    expandable?: boolean;
    validations?: AnyType;
    colors?: Array<AppColors>;
    name: string;
    format: string;
    type: string;
    bold: boolean | undefined;
    index: number;
    actionModalSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    truncate?: {
      enabled: boolean;
      width: number;
      lines: number;
    };
  };
}
