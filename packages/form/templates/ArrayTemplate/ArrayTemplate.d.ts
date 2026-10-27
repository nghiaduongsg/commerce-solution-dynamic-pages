import { CardArrayItem } from '../ArrayItem/CardArrayItem.d';
import { FormContextSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';

export type ArrayTemplateProps = {
  title: string;
  canAdd: boolean;
  items: Array<CardArrayItem>;
  formData: Array<AnyType>;
  uiSchema: AnyType;
  schema: AnyType;
  disabled: boolean;
  onAddClick: () => void;
  idSchema: {
    $id: string;
  };
  formContext: FormContextSchema;
  defaultItemActions: AppActionButtons;
  itemViewAction: AppActionButtons;
};
