import React from 'react';
import { Backdrop, Box } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import './LogoBounce.css';
import IstLoader from '@pkg-common/atomics/IstLoader/IstLoader';

export const useStyles = () => {
  return {
    root: {
      zIndex: 2000,
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
};

const LoadingBackdrop: React.FC<AnyType> = ({ open }: { open: boolean }) => {
  const styles = useStyles();
  return (
    <Backdrop sx={styles?.root} open={open}>
      <Box sx={styles.container}>
        <IstLoader busy={open} />
      </Box>
    </Backdrop>
  );
};

export default LoadingBackdrop;
