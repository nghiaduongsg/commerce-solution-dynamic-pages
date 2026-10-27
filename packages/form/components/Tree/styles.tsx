const getStyles = (theme) => {
  return {
    nodeContainer: {
      display: 'flex',
      alignItems: 'center',
      padding: '2 2',
      borderRadius: 1,
      cursor: 'pointer',
    },
    box: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      p: 1,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      boxShadow: 1,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    fieldLabel: {
      fontSize: '0.7rem',
    },
    selectedItem: {
      flexGrow: 1,
      fontWeight: 'bold',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0.5,
      alignItems: 'center',
      minHeight: '32px',
    },
    chip: {
      fontSize: '0.75rem',
      height: '22px',
      backgroundColor: 'primary.50',
      color: 'primary.700',
      border: '1px solid',
      borderColor: 'primary.200',
      '& .MuiChip-label': {
        px: 1,
        fontWeight: 500,
      },
      '&:hover': {
        backgroundColor: 'primary.100',
      },
    },
    filtersContainer: {
      marginTop: '4px',
      marginLeft: '32px',
      padding: '8px',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      backgroundColor: '#fafafa',
    },
    loadMoreButtonError: {
      width: '100%',
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    },
    loadMoreButton: {
      width: '100%',
    },
    expiredContainer: (isExpired: boolean) => ({
      ...(isExpired && {
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        '& > *:not(.keep-active)': {
          opacity: 0.5,
        },
      }),
    }),
    expiredChipContainer: {
      display: 'flex',
      justifyContent: 'center',
      width: '100px',
    },
    expiredChip: {
      fontSize: '12px',
      width: 'fit-content',
      '& .MuiChip-label': { px: 0.75, fontWeight: 'bold' },
      pointerEvents: 'none',
    },
    missingLabel: (isMissingLabel: boolean) => ({
      ...(isMissingLabel && {
        display: 'inline-block',
        padding: '2px',
        backgroundColor: 'rgba(255, 165, 0, 0.15)',
      }),
    }),
  };
};

export default getStyles;
