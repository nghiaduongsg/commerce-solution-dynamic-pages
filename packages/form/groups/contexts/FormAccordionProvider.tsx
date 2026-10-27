import React, { useContext, useMemo } from 'react';
import FormAccordionContext from '@pkg-form/groups/contexts/FormAccordionContext';
import useAccordionState from './useAccordionState';

interface FormManagerProviderProps {
  children?: React.ReactNode;
}

const FormAccordionProvider: React.FC<FormManagerProviderProps> = ({ children }) => {
  const context = useAccordionState();
  const parentContext = useContext(FormAccordionContext);

  const contextValue = useMemo(() => parentContext ?? context, [parentContext, context]);

  return (
    <FormAccordionContext.Provider value={contextValue}>{children}</FormAccordionContext.Provider>
  );
};

export default FormAccordionProvider;
