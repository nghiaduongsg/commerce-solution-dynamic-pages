import { CardArrayItem } from '../../../ArrayItem/CardArrayItem.d';
import { ChangeIndicatorsSchema, DataSourceSchema, FormContextSchema } from '@pkg-form/types';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';

export type TreeItemProps = {
  item: CardArrayItem & { isNew: boolean };
  parentId: string;
  formContext: FormContextSchema;
  depth: number;
  entityTitle: string;
  collapsed?: boolean;
  visibilityProperty: string;
  onActionComplete: () => void;
  onItemDuplicated: (data) => void;
  onToggleCollapse: (fieldId, collapsed) => void;
  buttons?: AppActionButtons;
  modalButtons?: AppActionButtons;
  info?: Array<DataSourceSchema>;
  modalSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  changeIndicators?: ChangeIndicatorsSchema;
};
