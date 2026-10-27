import { Theme } from '@mui/material';

type ValidationErrorsStyleKeys = 'text' | 'textWarning' | 'textCompare';
export default function useStyles(theme: Theme): Record<ValidationErrorsStyleKeys, object> {
  return {
    text: {
      color: theme?.palette?.error.main,
      display: 'block',
      marginBottom: theme?.spacing(1),
    },
    textWarning: {
      color: theme?.palette.warning.main,
      display: 'block',
      marginBottom: theme?.spacing(1),
    },
    textCompare: {
      color: theme?.palette?.info.main,
      display: 'block',
      marginBottom: theme?.spacing(1),
    },
  };
}
