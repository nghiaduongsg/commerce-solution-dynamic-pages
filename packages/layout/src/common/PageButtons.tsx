import React from 'react';
import SidePanelInfo from '@pkg-form/groups/InfoPanel/SidePanelInfo';
import usePage from '@pkg-layout/src/common/hooks/usePage';

const PageButtons = () => {
  const uiSchema = usePage();

  const buttons = uiSchema?.sidePanelInfo || [];

  return <SidePanelInfo drawerId="info-panel" sidePanelInfo={buttons} draggable />;
};

export default PageButtons;
