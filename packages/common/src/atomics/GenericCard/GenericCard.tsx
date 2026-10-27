import React, { useState, forwardRef } from 'react';
import { Box } from '@mui/material';
import { GenericCardProps } from './GenericCard.d';
import { ResizableBox } from 'react-resizable';
import GenericCardInner from '@pkg-common/atomics/GenericCard/GenericCardInner';
import Draggable from 'react-draggable';
import { useTheme } from '@mui/material/styles';
import { useStyles } from '@pkg-common/atomics/GenericCard/styles';

const GenericCard = forwardRef<HTMLDivElement, GenericCardProps>((props, ref) => {
  const {
    resizable = false,
    styleOverrides = {},
    zIndex,
    showTitle,
    actions,
    footerActions,
    collapsible,
  } = props;
  const theme = useTheme();
  const styles = useStyles(theme);

  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(window.innerHeight - 200);
  const [left, _] = useState(styles.cardResizable.right + 500);

  const diff = showTitle || actions || collapsible ? 50 : 0;
  const heightDiff = footerActions ? 70 : 0;

  if (resizable) {
    return (
      <Draggable axis="both" handle={'.cardHeaderDragHandler'}>
        <Box
          sx={{
            ...styles.cardResizable,
            zIndex: zIndex ?? styles.cardResizable.zIndex,
            left,
          }}
        >
          <ResizableBox
            height={height}
            width={width}
            resizable={true}
            handle={
              <Box
                sx={{
                  zIndex: 1,
                  position: 'relative',
                  top: `-${height - diff}px`,
                  left: 0,
                  height: `calc(100% - ${diff + heightDiff}px)`,
                  width: `calc(100% - ${10}px)`,
                  '&:hover': {
                    border: `2px dashed ${theme.palette.primary.main}`,
                  },
                }}
              />
            }
            axis={'both'}
            onResize={(_, { size }) => {
              setWidth(size.width);
              setHeight(size.height);
            }}
          >
            <GenericCardInner
              ref={ref}
              {...props}
              styleOverrides={{
                width: `${width}px`,
                height: `${height}px`,
                ...styleOverrides,
              }}
            />
          </ResizableBox>
        </Box>
      </Draggable>
    );
  }

  return <GenericCardInner ref={ref} {...props} />;
});

GenericCard.displayName = 'GenericCard';

export default GenericCard;
