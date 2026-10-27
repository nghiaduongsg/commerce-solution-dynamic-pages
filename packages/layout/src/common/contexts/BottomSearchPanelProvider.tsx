import React, { useContext, useMemo } from 'react';
import BottomSearchPanelContext from '@pkg-layout/src/common/contexts/BottomSearchPanelContext';
import useBottomSearchPanel from '@pkg-layout/src/common/hooks/useBottomSearchPanel';

interface BottomSearchPanelProviderProps {
  children?: React.ReactNode;
}

const BottomSearchPanelProvider: React.FC<BottomSearchPanelProviderProps> = ({ children }) => {
  const bottomSearchPanel = useBottomSearchPanel();
  const parentBottomSearchPanel = useContext(BottomSearchPanelContext);

  const contextValue = useMemo(
    () => parentBottomSearchPanel ?? bottomSearchPanel,
    [parentBottomSearchPanel, bottomSearchPanel],
  );

  return (
    <BottomSearchPanelContext.Provider value={contextValue}>
      {children}
    </BottomSearchPanelContext.Provider>
  );
};

export default BottomSearchPanelProvider;
