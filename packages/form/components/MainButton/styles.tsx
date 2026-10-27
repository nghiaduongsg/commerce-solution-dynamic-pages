const getStyles = (theme) => {
  return {
    container: {
      marginTop: theme.spacing(3),
    },
    floatingContainer: {
      position: 'fixed',
      top: '170px',
      right: '5%',
      zIndex: 1100,
    },
  };
};

export default getStyles;
