import { useState, useCallback } from 'react';

const useBottomSearchPanel = () => {
  const [isBottomSearchPanelVisible, setIsBottomSearchPanelVisible] = useState(true);

  const hideBottomSearchPanel = useCallback(() => {
    setIsBottomSearchPanelVisible(false);
  }, []);

  const showBottomSearchPanel = useCallback(() => {
    setIsBottomSearchPanelVisible(true);
  }, []);

  return {
    isBottomSearchPanelVisible,
    hideBottomSearchPanel,
    showBottomSearchPanel,
  };
};

export default useBottomSearchPanel;
