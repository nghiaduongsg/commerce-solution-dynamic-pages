import {
  ArrayItemActionsSchema,
  ChangeIndicatorsSchema,
  CheckFromSchema,
  DataSourceSchema,
  SubformSchema,
} from '@pkg-form/types';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import {
  ActionButtonType,
  AppActionButtons,
  AppActionsType,
} from '@pkg-common/components/AppActions/types';
import { AppColors } from '@pkg-common/types';

export type CardArrayItem = {
  key: string;
  children: any;
  hasRemove: boolean;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  onDropIndexClick: (index) => () => void;
  onReorderClick: (index, newIndex) => void;
  status: string;
  initData: any;
  title: string;
  cardType: string;
  modalSize: 'sm' | 'md' | 'lg' | 'xl' | 'xs' | false;
  index: number;
};

export type CardArrayItemProps = {
  item: ArrayItem;
  formId: string;
  label: string;
  namespace: string;
  parentId: string;
  onItemDuplicated: (data: any) => void;
  onDeleteItemPressed: (data: any) => void;
  onActionComplete: () => void;
  onSaveItem?: () => void;
  disabled: boolean;
  cardUiSchema: any;
  options: string;
  cardVisibility?: boolean;
  buttons?: AppActionButtons;
  modalButtons?: AppActionButtons;
  cardColors?: Array<AppColors>;
  changeIndicators?: ChangeIndicatorsSchema;
};
