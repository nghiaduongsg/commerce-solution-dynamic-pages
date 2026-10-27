import { createContext, useContext } from 'react';

interface FormManagerType {
  disabledValues: {
    [key: string]: {
      [key: string]: Array<string>;
    };
  };
  getFieldDisabledValues: (fieldId: string, property: string) => Array<string>;
  setFieldDisabledValues: (
    fieldId: string,
    items: { [property: string]: Array<string | boolean | number> },
  ) => void;
  clearAllDisabledValues: () => void;
  visibility: { [key: string]: boolean };
  setFieldVisibility: (fieldId: string, visible: boolean) => void;
  setManyFieldsVisibility: (fieldIds: Array<string>, visible: boolean) => void;
  isFieldVisible: (fieldId: string) => boolean;
  registerReadOnlyField: (fieldId: string, readMode: boolean) => void;
  getReadOnlyFields: () => Set<string>;
  addComponentValueType: (componentId: string, code: string) => void;
  getComponentValueType: (componentId: string) => string;

  dirtyFlags: { [key: string]: boolean };
  setFieldDirty: (fieldId: string, dirty: boolean) => void;
  isFieldDirty: (fieldId: string, checkParent?: boolean) => boolean;
  isFormDirty: (fieldId: string) => boolean;
  forceDirty: (fieldId: string) => void;
  clearDirtyFlags: (fieldId: string) => void;
}

const FormManagerContext = createContext<FormManagerType | null>(null);

export const useFormManagerContext = () => {
  const context = useContext(FormManagerContext);
  if (!context) {
    throw new Error('useFormManagerContext must be used within a FormManagerProvider');
  }
  return context;
};

export default FormManagerContext;
