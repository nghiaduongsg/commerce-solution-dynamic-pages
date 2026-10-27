import { ApiValuesSchema, CheckFromSchema, AnyType } from '@pkg-common/types';

export type MainButtonProps = {
  id: string;
  onSaveEntity: (options?: { contextToken?: string }) => void;
  data?: any;
  schema?: AnyType;
  parentPageId?: string;
  buttonProperties: {
    type: 'submit' | 'redirect';
    style: 'CLASSIC' | 'FLOATING';
    icon: 'save' | 'next';
    label: string;
    values?: ApiValuesSchema;
    markPresses: boolean;
    clearErrors?: boolean;
    color: 'primary' | 'secondary';
    avoidSubmit?: boolean;
    enableContext?: boolean;
    confirmChanges?: boolean;
    warnOnAction?: {
      whenToWarn?: CheckFromSchema;
      translation: { warningTitleKey: string; warningMessageKey: string; namespace?: string };
    };
    permissionKey?: string | ApiValuesSchema;
    visibilityFrom?: CheckFromSchema;
  };
};
