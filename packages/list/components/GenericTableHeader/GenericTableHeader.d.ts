import { TableSelectionsConfiguration } from '@table/types';

export interface TableHeaderProps {
  namespaces: Array<string>;
  tableId: string;
  selections?: TableSelectionsConfiguration;
  baseDataTestId?: string;
  extraHeaderColumns?: number;
  sticky?: boolean;
  hasRowActions?: boolean;
  hasMandatoryBulkActionCriterion?: boolean;
}
