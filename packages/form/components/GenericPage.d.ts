import { AnyType } from '@pkg-common/types';

export type GenericPageProps = {
  schema: { [key: string]: AnyType };
  uiSchema: { [key: string]: AnyType };
  disabled?: boolean;
  hideActionButtons?: boolean;
  hideSubmitButton?: boolean;
  onSuccessCallback?: () => void;
  parentPageId?: string;
};
