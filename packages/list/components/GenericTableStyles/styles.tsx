export const getStyles = (theme) => {
  return {
    tableCardBadge: {
      marginLeft: theme.spacing(5),
    },
    tableCardSubtitle: {},
    tableHeader: {},
    tableHeaderCellContainer: {
      display: 'flex',
      alignItems: 'center',
      textAlign: 'left',
      width: '100%',
      height: '100%',
    },
    tableHeaderCell: {},
    tableHeaderCellRightAlignment: {
      width: '100%',
      height: '100%',
      justifyContent: 'right',
      textAlign: 'right',
    },
    tableHeaderCellInfoIcon: {
      color: theme.palette?.info.main,
      width: theme.spacing(2),
      marginRight: theme.spacing(0.5),
    },
    tableFiltersSummaryContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      padding: theme.spacing(1),
    },
    tableSelectionSummaryContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      padding: theme.spacing(4),
    },
    tableFiltersSummaryChip: {
      margin: theme.spacing(0.5),
      maxWidth: 400,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    tableSelectionChip: {
      margin: theme.spacing(0.5),
      maxWidth: 600,
      whiteSpace: 'wrap',
      overflow: 'hidden',
    },
    tableBody: {},
    tableBodyRow: {},
    tableBodyRowCell: {
      borderWidth: 0.5,
    },
    tableCellColored: {
      backgroundColor: '#f9fdff',
    },
    tableStickyCell: {
      position: 'sticky',
      top: 0,
      right: 0,
      left: 0,
      flexDirection: 'column',
      padding: '8px !important',
      backgroundColor: '#f9fdff',
    },
    tableBodyRowSelected: {
      backgroundColor: 'rgba(15, 123, 159, 0.32) !important',
      '&:hover': {
        backgroundColor: 'rgba(15, 123, 159, 0.32) !important',
      },
    },
    tableBodyRowUnprocessed: {
      backgroundColor: 'rgba(255, 152, 0, 0.28) !important',
      '&:hover': {
        backgroundColor: 'rgba(255, 152, 0, 0.28) !important',
      },
    },
    tableBodyRowDeleted: {
      backgroundColor: '#ff000099',
      '&:hover': {
        backgroundColor: '#ff000099!important',
        color: '#fff!important',
      },
    },
    tableBodyRowAdded: {
      boxShadow: `inset 0 0 10px 2px green`,
      transition: 'box-shadow 0.3s ease-in-out',
    },
    tableBodyCell: {
      borderWidth: 0.5,
      whiteSpace: 'nowrap',
    },
    tableBodyCellBold: {
      fontWeight: 700,
    },
    tableBodyCellRoot: {
      '&:first-child': {
        fontWeight: 700,
      },
    },
    messageRowCell: {
      borderWidth: 0.5,
      fontWeight: 700,
      fontSize: '14px',
      '&:first-child': {
        fontWeight: 700,
        fontSize: '14px',
      },
    },
    tableBodyCalculatedCell: {
      borderWidth: 0.5,
      whiteSpace: 'nowrap',
      background: 'rgba(164, 164, 164, 0.5)',
    },
    tableFooterContainer: {
      width: 'fit-content',
      minWidth: '100%',
      zIndex: 1,
    },
    noHover: {
      '&:hover': {
        transition: 'none',
        border: 'none',
        backgroundColor: 'transparent',
      },
    },
  };
};
