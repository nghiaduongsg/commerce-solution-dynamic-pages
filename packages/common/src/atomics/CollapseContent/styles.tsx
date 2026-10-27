export const getStyles = (theme) => {
  return {
    buttonBase: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '&:focus': {
        color: theme.palette.primary.main,
      },
    },
    title: {},
    errorIcon: {
      color: theme.palette?.error.main,
    },
    errorMessage: {
      color: theme.palette?.error.main,
      paddingLeft: theme.spacing(0.5),
      fontSize: theme.typography.overline.fontSize,
    },
    divider: {
      marginTop: theme.spacing(1),
      width: '100%',
    },
    collapse: {
      width: '100%',
    },
  };
};
