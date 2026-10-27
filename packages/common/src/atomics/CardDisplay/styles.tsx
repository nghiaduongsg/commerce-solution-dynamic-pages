import { Theme } from '@mui/material';

type CardDisplayTypeKeys = 'card' | 'cardContent' | 'title' | 'value';
export default function useStyles(theme: Theme): Record<CardDisplayTypeKeys, object> {
  return {
    card: {
      pointerEvents: 'none',
      color: theme.palette.common.white,
      backgroundColor: '#00008b',
      height: 'auto',
      minHeight: 'auto',
      paddingBottom: 0,
      marginRight: 5,
      boxShadow: 'rgb(0,0,0,0.7) 5px 10px 50px ,rgb(0,0,0,0.7) -5px 0px 250px',
    },
    cardContent: {
      padding: theme?.spacing(1),
    },
    title: {
      color: theme?.palette?.common.white,
    },
    value: {
      height: 'auto',
      overflow: 'hidden',
      lineClamp: 2,
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      boxOrient: 'vertical',
      color: theme?.palette?.common.white,
    },
  };
}
