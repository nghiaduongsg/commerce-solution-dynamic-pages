import { createContext, useContext } from 'react';

interface FormAccordionType {
  toggleAll: () => void;
  setAccordionState: (id: string, state: boolean) => void;
  areMostExpanded: boolean;
}

const FormAccordionContext = createContext<FormAccordionType | null>(null);

export const useFormAccordionContext = () => {
  const context = useContext(FormAccordionContext);
  if (!context) {
    throw new Error('useFormAccordionContext must be used within a FormAccordionProvider');
  }
  return context;
};

export default FormAccordionContext;
