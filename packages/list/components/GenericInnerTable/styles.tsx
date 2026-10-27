import { Theme } from '@mui/material';

const getStyles = (theme: Theme): Record<string, any> => ({
  tableContainer: {
    backgroundColor: theme.palette.primary.light,
    borderRadius: '9px',
    margin: theme.spacing(4),
    width: '95%',
  },
  propertyHeader: {
    border: 'none',
    textAlign: 'left',
    height: '20px',
    px: theme.spacing(6),
  },
  cell: {
    verticalAlign: 'top',
    px: theme.spacing(2),
    minWidth: '200px',
    height: '20px',

    'last-child': {
      border: 'none',
    },
  },
  noHover: {
    '&:hover': {
      transition: 'none',
      border: 'none',
      backgroundColor: 'transparent',
    },
  },
  rowPaddings: {
    'td:first-child': {
      paddingLeft: theme.spacing(6),
    },
    'td:last-child': {
      paddingRight: theme.spacing(6),
    },
  },
  noBorder: {
    '> td': {
      border: 'none',
    },
  },
});

export default getStyles;
