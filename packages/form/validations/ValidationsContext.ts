import { createContext, useContext } from 'react';

export interface ValidationsContextType {
  errors: Record<string, string[]>;
  setFieldErrors: (fieldId: string, errors: Array<string>) => void;
  getFieldErrors: (fieldId: string) => Array<string>;
  addFieldErrors: (fieldId: string, errors: Array<string>) => void;
  removeFieldErrors: (fieldId: string, errors: Array<string>) => void;
  removeMultipleFieldErrors: (fieldIds: Array<string>) => void;
  isFieldValid: (fieldId: string) => boolean;
  isFormValid: (fieldId: string) => boolean;
  isGroupValid: (fields: Array<string>) => boolean;
  clearErrors: () => void;
  clearParentFieldErrors: (fieldId: string) => void;
}

const ValidationsContext = createContext<ValidationsContextType | null>(null);

export const useValidationsContext = () => {
  const context = useContext(ValidationsContext);
  if (!context) {
    throw new Error('useValidationsContext must be used within a ValidationsProvider');
  }
  return context;
};

export default ValidationsContext;
