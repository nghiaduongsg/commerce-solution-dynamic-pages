import { ReactNode } from 'react';
import { AnyType } from '@pkg-common/types';

export type DetailTableRow = Record<string, AnyType>;

export type DetailTableColumn = {
  /** Property read from each row for this column. */
  key: string;
  /** Already-translated header label. */
  label: string;
  /** Optional custom cell renderer; defaults to a SingleValueRenderer of row[key]. */
  render?: (row: DetailTableRow) => ReactNode;
};

export type DetailTableProps = {
  /** Columns shown in the compact table (keep these minimal). */
  columns: Array<DetailTableColumn>;
  /** The records to display, one per row. */
  rows: Array<DetailTableRow>;
  /** Stable identity for a row; defaults to its index. */
  getRowId?: (row: DetailTableRow, index: number) => string;
  /** Heading shown for a row in the side panel (and its accessible name). */
  rowTitle?: (row: DetailTableRow) => string;
  /** Side-panel body for the opened row; defaults to a ValuesRenderer of the row. */
  renderDetail?: (row: DetailTableRow) => ReactNode;
  dataTestId?: string;
};
