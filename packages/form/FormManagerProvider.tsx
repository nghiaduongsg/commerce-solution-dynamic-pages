import React, { useContext, useMemo } from 'react';
import FormManagerContext from '@pkg-form/FormManagerContext';
import useFormManager from '@pkg-form/useFormManager';

interface FormManagerProviderProps {
  children?: React.ReactNode;
}

const FormManagerProvider: React.FC<FormManagerProviderProps> = ({ children }) => {
  const formManager = useFormManager();
  const parentFormManager = useContext(FormManagerContext);

  const contextValue = useMemo(
    () => parentFormManager ?? formManager,
    [parentFormManager, formManager],
  );

  return <FormManagerContext.Provider value={contextValue}>{children}</FormManagerContext.Provider>;
};

export default FormManagerProvider;
