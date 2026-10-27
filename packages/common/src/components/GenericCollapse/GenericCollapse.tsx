import React, { useState } from 'react';
import { Collapse, Typography } from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { AnyType } from '@pkg-common/types';

const GenericCollapse = ({
  title,
  children,
  titleStyles = {},
}: {
  title: string;
  titleStyles?: AnyType;
  children: JSX.Element | Array<JSX.Element>;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <div
        style={{ display: 'flex', justifyContent: 'space-between' }}
        onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
        onKeyDown={(e: { key?: string; preventDefault: Function }) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCollapsed((isCollapsed) => !isCollapsed);
          }
        }}
      >
        <Typography color={'primary'} style={titleStyles}>
          {title}
        </Typography>
        <AssetByType input="icons" name={collapsed ? 'KeyboardArrowDown' : 'KeyboardArrowUp'} />
      </div>
      <Collapse in={collapsed}>{children}</Collapse>
    </>
  );
};

export default GenericCollapse;
