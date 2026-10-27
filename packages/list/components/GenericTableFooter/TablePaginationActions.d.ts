export interface TablePaginationActionsProps {
  tableId: string;
  onChangePage: (event: MouseEvent<HTMLButtonElement>, newPage: number) => void;
  parentId?: string;
}
