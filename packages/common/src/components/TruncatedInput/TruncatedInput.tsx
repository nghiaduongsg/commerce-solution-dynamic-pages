import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import { AnyType } from '@pkg-common/types';

const useStyles = () => {
  return {
    truncate: (truncate: AnyType) => ({
      maxWidth: truncate?.width ? truncate.width + 50 : '100%',
      maxHeight: truncate?.lines ? `${truncate.lines * 1.4}em` : 'auto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: truncate?.lines ?? 1,
      WebkitBoxOrient: 'vertical',
      whiteSpace: 'pre-line',
    }),
  };
};

const TruncatedInput = ({
  truncate,
  title,
  children,
}: {
  truncate: AnyType;
  title: string;
  children?: AnyType;
}) => {
  const styles = useStyles();
  if (truncate?.enabled) {
    return (
      <Tooltip title={title} placement="top" role={title ? 'tooltip' : undefined}>
        <Typography
          component="span"
          variant="inherit"
          noWrap={false}
          sx={styles.truncate(truncate)}
        >
          {children ?? title}
        </Typography>
      </Tooltip>
    );
  } else {
    return children ?? title;
  }
};

export default TruncatedInput;
