import { CardArrayItem } from '@pkg-form/templates/ArrayItem/CardArrayItem.d';
import { AnyType, AppColors } from '@pkg-common/types';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';
import { ChangeIndicatorsSchema } from '@pkg-form/types';

export type ArrayItemProps = {
  formId: string;
  id: string;
  parentId: string;
  onDeleteConfirmPressed: (data) => void;
  onDelete: () => void;
  onEdit: () => void;
  onDuplicate: (data: any) => void;
  icon?: string;
  item: CardArrayItem;
  allowActionsIfDisabled?: boolean;
  cardUiSchema?: AnyType;
  cardVisibility?: boolean;
  buttons?: AppActionButtons;
  cardColors?: Array<AppColors>;
  changeIndicators?: ChangeIndicatorsSchema;
};
