import { alpha } from '@mui/material';

const getStyles = (theme) => {
  return {
    card: {
      boxShadow: 'none',
      backgroundColor: alpha(theme.palette?.primary.dark, 0.03),
      border: `2px dashed ${alpha(theme.palette?.primary.dark, 0.56)}`,
      '&:hover': {
        backgroundColor: alpha(theme.palette?.primary.dark, 0.08),
        border: `2px dashed ${theme.palette?.primary.dark}`,
      },
    },
    cardActions: {
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(2),
    },
  };
};

export default getStyles;
