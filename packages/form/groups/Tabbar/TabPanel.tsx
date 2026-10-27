import React, { useRef } from 'react';

type Props = {
  children: React.ReactNode;
  index: number;
  selectedTabIndex: number;
  id: string;
};

const TabPanel = ({ children, selectedTabIndex, index, id }: Props) => {
  const renderedOnce = useRef(false);
  const isSelected = selectedTabIndex === index;

  if (isSelected && !renderedOnce.current) {
    renderedOnce.current = true;
  }

  if (!isSelected && !renderedOnce.current) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      hidden={!isSelected}
      data-testid={`scrollable-auto-tabpanel-${index}`}
      id={`scrollable-auto-tabpanel-${id}-${index}`}
    >
      {children}
    </div>
  );
};

export default TabPanel;
