import { useMemo } from 'react';

import usePage from './usePage';

const usePageLayout = () => {
  const uiSchema = usePage();

  const hasButtons = useMemo(() => {
    if (uiSchema) {
      return (uiSchema?.sidePanelInfo || [])?.length > 0;
    }
    return false;
  }, [uiSchema]);

  const hasHighlightedData = useMemo(() => {
    if (uiSchema) {
      return (uiSchema['ui:cards'] || [])?.cards?.length > 0;
    }
    return false;
  }, [uiSchema]);

  const hasBackButton = useMemo(() => {
    return !!((uiSchema || {})['ui:page'] || {})['back'];
  }, [uiSchema]);

  return { hasButtons, hasHighlightedData, hasBackButton };
};

export default usePageLayout;
