import useAllValidations from '@pkg-form/validations/hooks/useAllValidations';
import React, { useContext, useMemo } from 'react';
import ValidationsContext from '@pkg-form/validations/ValidationsContext';

interface ValidationProviderProps {
  children?: React.ReactNode;
}

const ValidationsProvider: React.FC<ValidationProviderProps> = ({ children }) => {
  const validations = useAllValidations();

  const parentValidationContext = useContext(ValidationsContext);

  const contextValue = useMemo(
    () => parentValidationContext ?? validations,
    [parentValidationContext, validations],
  );

  return <ValidationsContext.Provider value={contextValue}>{children}</ValidationsContext.Provider>;
};

export default ValidationsProvider;
