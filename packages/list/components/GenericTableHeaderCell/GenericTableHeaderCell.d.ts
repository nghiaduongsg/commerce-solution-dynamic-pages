import { TableColumnConfiguration } from '@table/types';
import { SxProps } from '@mui/system';

export interface GenericTableHeaderCellProps {
  namespaces: Array<string>;
  tableId: string;
  column: TableColumnConfiguration;
  sx?: SxProps;
}
