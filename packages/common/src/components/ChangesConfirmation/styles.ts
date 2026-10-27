const getStyles = (theme) => {
  return {
    dialogContent: {
      color: 'black',
      padding: 2,
    },
    dialogMessage: {
      marginBottom: 2,
    },
    tableContainer: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #DCEAFF',
    },
    tableHead: {
      backgroundColor: 'white',
    },
    tableRow: {
      backgroundColor: 'white',
      '&:hover': {
        backgroundColor: 'white',
        border: 'none',
      },
    },
    fieldRow: (changed: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      py: 0.75,
      gap: 2,
      backgroundColor: changed ? theme.palette.action.hover : '#FFFFFF',
      borderRadius: 1,
      px: changed ? 1 : 0,

      // '&:hover': {
      //   backgroundColor: 'white',
      // },
    }),
    fieldRowLabel: {
      color: theme.palette.text.secondary,
      minWidth: '35%',
      flexShrink: 0,
      fontWeight: 500,
      fontSize: '0.8rem',
      letterSpacing: '0.03em',
    },
  };
};

export default getStyles;
