import { useTheme } from '@mui/material/styles';

export const useStyles = () => {
  return {
    container: {
      marginBottom: '16px',
    },
    hasError: {
      border: '1.5px solid red',
    },
    cardActions: {
      display: 'flex',
      cursor: 's-resize',
      position: 'absolute',
      bottom: 0,
      width: '100%',
      justifyContent: 'center',
      backgroundColor: useTheme().palette?.common.white,
      borderTop: `1px solid ${useTheme().palette?.grey[300]}`,
    },
    boxItems: {
      width: '100%',
      borderRadius: useTheme().spacing(1.5),
      height: '100%',
      paddingRight: '16px',
      paddingLeft: '16px',
    },
    menu: {
      '& .MuiListItem-button': {
        '&:hover': {
          backgroundColor: useTheme().palette?.primary.light,
        },
        '& .MuiListItemIcon-root': {
          color: useTheme().palette?.common.black,
        },
      },
    },
    fullHeight: {
      height: '100%',
      minWidth: 0,
      width: '90%',
    },
    entityTitle: {
      marginTop: '16px',
      marginBottom: '16px',
    },
    indicatorContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      paddingLeft: '4px',
      paddingTop: '8px',
    },
    indicator: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      display: 'inline-block',
    },
    infoMessageContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    innerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    manuallyAddedIconStyles: {
      display: 'flex',
      height: '18px',
      alignItems: 'center',
      color: 'primary.dark',
    },
    reorderIconStyles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      color: 'primary.dark',
    },
    iconsContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
  };
};
