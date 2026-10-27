import { ReactElement } from 'react';

export interface GenericTablePanelProps {
  filtering: {
    enabled: boolean;
    schema?: { [key: string]: any };
    uiSchema?: { [key: string]: any };
  };
  namespace: string;
  exportable?: boolean;
  exportOptions?: {
    applyNewExport: boolean;
    permissionKey: string;
    convertToListCriteria?: string[];
    url?: string;
  };
  parentId?: string;
  tableId: string;
  baseDataTestId?: string;
  actionButtons: ReactElement | null;
  headerContent?: ReactElement | null;
  showLocalSigns?: boolean;
  columnConfigurable?: boolean;
  heightAdjustable?: boolean;
  filtersType?: string;
  onTableExpand: (_) => void;
  uploadEntity?: {
    hasImport: boolean;
    uploadUrl: string;
    redirectPageId: string;
  };
  expanded?: boolean;
}
