import { createContext, useContext } from 'react';

interface BottomSearchPanelType {
  isBottomSearchPanelVisible: boolean;
  hideBottomSearchPanel: () => void;
  showBottomSearchPanel: () => void;
}

const BottomSearchPanelContext = createContext<BottomSearchPanelType | null>(null);

export const useBottomSearchPanelContext = () => {
  const context = useContext(BottomSearchPanelContext);
  if (!context) {
    throw new Error('useBottomSearchPanelContext must be used within BottomSearchPanelProvider');
  }
  return context;
};

export default BottomSearchPanelContext;
