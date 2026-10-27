import { alpha } from '@mui/material/styles';

type StatusColor = { backgroundColor: string; color: string };

const ERROR_COLOR: StatusColor = { backgroundColor: '#F8D7DA', color: '#721C24' };

export const isErrorStatus = (statusCode: string) =>
  statusCode === 'FAILED' || statusCode === 'REVIEW_POSTED_ERROR' || statusCode === 'ERROR';

const getStatusMainColor = (theme, statusCode: string): string => {
  switch (statusCode) {
    case 'PENDING':
      return theme.palette.warning.main;
    case 'IN_PROGRESS':
      return theme.palette.info?.main ?? theme.palette.primary.main;
    case 'COMPLETED':
    case 'PASS':
      return theme.palette.success.main;
    case 'CANCELLED':
      return theme.palette.grey[600];
    default:
      return theme.palette.warning.main;
  }
};

export const getStatusColors = (theme, statusCode: string): StatusColor => {
  if (isErrorStatus(statusCode)) {
    return ERROR_COLOR;
  }

  if (statusCode === 'CANCELLED') {
    return {
      backgroundColor: alpha(theme.palette.grey[300], 0.35),
      color: theme.palette.text.secondary,
    };
  }

  const main = getStatusMainColor(theme, statusCode);

  return {
    backgroundColor: alpha(main, 0.12),
    color: main,
  };
};

export const getStatusBadgeStyles = (theme) => {
  return {
    neutralIcon: {
      fontSize: 18,
      color: theme.palette.success.main,
      opacity: 0.7,
    },
    chip: (statusColors: StatusColor) => ({
      backgroundColor: statusColors.backgroundColor,
      color: statusColors.color,
      fontWeight: 600,
      border: 'none',
      borderRadius: '8px',
      '& > .MuiChip-label': {
        px: 0,
        mx: 0,
      },
      '& .MuiChip-icon': {
        mx: 1,
      },
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    chipIcon: {
      fontSize: 14,
    },
    errorTooltipContent: {
      maxWidth: 320,
      py: 0.5,
    },
    errorTooltipItem: {
      display: 'flex',
      gap: 0.75,
      alignItems: 'flex-start',
      py: 0.25,
    },
    errorTooltipBullet: {
      width: 5,
      height: 5,
      minWidth: 5,
      borderRadius: '50%',
      backgroundColor: theme.palette.error.main,
      mt: '0.55em',
    },
    errorTooltipMessage: {
      fontSize: '0.78rem',
      lineHeight: 1.5,
      color: theme.palette.text.primary,
    },
    errorTooltipPaper: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      padding: '10px 14px',
      border: `1px solid ${theme.palette.divider}`,
    },
  };
};
