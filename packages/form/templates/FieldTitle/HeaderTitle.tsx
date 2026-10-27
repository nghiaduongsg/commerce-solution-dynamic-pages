import React, { ReactElement } from 'react';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';
import { Badge, Box, Typography } from '@mui/material';
import { Error } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { InfoSchema } from '@pkg-common/types';
import WithInfoPieces from '@pkg-form/groups/WithInfoPieces';

const getStyles = (theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  error: { color: theme.palette?.error.main },
  errorMessage: {
    color: theme.palette?.error.main,
    marginLeft: theme.spacing(1),
    fontSize: theme.typography.overline.fontSize,
  },
});

const HeaderTitle = ({
  id,
  testId,
  title,
  buttons,
  badge = 0,
  children,
  errorMessage,
  information,
}: {
  id: string;
  testId: string;
  title: string | ReactElement;
  children?: ReactElement | Array<ReactElement>;
  badge?: number;
  buttons?: AppActionButtons;
  errorMessage?: string;
  information?: Array<InfoSchema>;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Box sx={styles.container}>
      <Box display="flex">
        <WithInfoPieces id={id} info={information}>
          <Typography
            variant="body1"
            component="h3"
            id={id}
            data-testid={testId}
            sx={errorMessage ? styles.error : {}}
          >
            {title}
          </Typography>
        </WithInfoPieces>

        {badge > 0 && (
          <Badge
            badgeContent={`${badge}`}
            color="primary"
            style={{ marginLeft: theme.spacing(2) }}
          />
        )}
        {errorMessage && (
          <Box ml={4} display="flex" alignItems="center">
            <Error sx={styles.error} />
            {errorMessage && <Typography sx={styles.errorMessage}>{errorMessage}</Typography>}
          </Box>
        )}
      </Box>

      <div>
        <AppActions page={{ id }} actions={buttons} checkPermissions={true} />
        {children}
      </div>
    </Box>
  );
};

export default HeaderTitle;
