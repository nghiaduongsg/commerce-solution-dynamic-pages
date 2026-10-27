export interface TableMessageProps {
  hasNoData: boolean;
  error?: { errorCode?: string };
  namespaces?: string[];
  colSpan?: number;
  loading?: boolean;
}
