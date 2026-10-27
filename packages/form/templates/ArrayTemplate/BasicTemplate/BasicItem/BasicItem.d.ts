import { AppActionButtons } from '@pkg-common/components/AppActions/types';
import { CheckFromSchema } from '@pkg-common/types';
import { AnyType } from '@common/types';
import { ChangeIndicatorsSchema } from '@pkg-form/types';

export type BasicItem = {
  key: string;
  index: number;
  title: string;
  children: any;
  hasRemove: boolean;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  uniqueFields: AnyType;
  onDropIndexClick: (index) => () => void;
  onReorderClick: (index, newIndex) => void;
  selectable?: boolean;
  multiple?: boolean;
  isNew?: boolean;
  initData?: any;
  cardType?: string;
  disabled?: boolean;
};

export type BasicItemProps = {
  id: string;
  item: BasicItem;
  parentId: string;
  buttons?: AppActionButtons;
  warnOnAction?: {
    whenToWarn: CheckFromSchema;
    translation: { warningTitleKey: string; warningMessageKey: string; namespace?: string };
  };
  schema?: AnyType;
  uiSchema?: AnyType;
  changeIndicators?: ChangeIndicatorsSchema;
};
