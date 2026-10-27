import React, { isValidElement, ReactNode } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

interface ShortcutsTooltipProps {
  label?: string;
  shortcuts?: string;
  children: TooltipProps['children'] | ReactNode;
}

const ShortcutsTooltip = ({ label, shortcuts, children }: ShortcutsTooltipProps) => {
  const wrappedChildren = isValidElement(children) ? children : <span>{children}</span>;
  const safeLabel = (label || '').trim();
  const title = shortcuts ? `${safeLabel} (${shortcuts})` : safeLabel;

  return (
    <Tooltip describeChild title={title} role="tooltip" placement="bottom" sx={{ width: '100%' }}>
      {wrappedChildren}
    </Tooltip>
  );
};

export default ShortcutsTooltip;
