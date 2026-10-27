import React, { useMemo } from 'react';
import { Stack, TableRow, TableCell, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { getStyles } from '../GenericTableStyles/styles';
import { TableMessageProps } from './TableMessage.d';
import { useSystem } from '@pkg-setup/index';

const TABLE_ERROR_CODES = {
  tooManyResults: 'ST-COM-V0045',
} as const;

type TableMessage = 'noRecords' | 'noRecordsOnInit' | 'tooManyResults' | 'loading';
type TableMessageDesc =
  | 'noRecordsDesc'
  | 'noRecordsOnInitDesc'
  | 'tooManyResultsDesc'
  | 'loadingDesc';

interface TableMessageState {
  message: TableMessage;
  messageDesc: TableMessageDesc;
  iconName?: string;
}

const getMessageState = (
  hasNoData: boolean,
  loading = false,
  error?: { errorCode?: string },
): TableMessageState => {
  if (loading) {
    return {
      message: 'loading',
      messageDesc: 'loadingDesc',
    };
  }

  // Check for "too many results" error (ST-COM-V0045)
  if (error?.errorCode === TABLE_ERROR_CODES.tooManyResults) {
    return {
      message: 'tooManyResults',
      messageDesc: 'tooManyResultsDesc',
      iconName: 'FilterList',
    };
  }

  // Check if table is not initialized or filters are required but not applied
  if (hasNoData) {
    return {
      message: 'noRecords',
      messageDesc: 'noRecordsDesc',
      iconName: 'SearchOff',
    };
  }

  // Check if no data is available (filters were applied but no results)
  return {
    message: 'noRecordsOnInit',
    messageDesc: 'noRecordsOnInitDesc',
    iconName: 'Search',
  };
};

const TableMessage: React.FC<TableMessageProps> = ({
  hasNoData,
  error,
  namespaces = [COMMON, ACCESSIBILITY],
  colSpan,
  loading,
}) => {
  const theme = useTheme();
  const classes = getStyles(theme);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespaces);

  const messageState = useMemo(() => {
    return getMessageState(hasNoData, loading, error);
  }, [hasNoData, error, loading]);
  const descId = `${messageState.messageDesc}-desc`;

  return (
    <>
      <TableRow
        sx={{ root: classes.tableBodyRow }}
        aria-label={translate('records', {
          ns: COMMON,
          lng: selectedLanguage,
        })}
        aria-describedby={descId}
        tabIndex={0}
      >
        <TableCell
          colSpan={colSpan}
          sx={classes.messageRowCell}
          align="center"
          aria-label={translate('records', {
            ns: COMMON,
            lng: selectedLanguage,
          })}
          aria-describedby={descId}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={'center'}
            sx={{
              padding: '5px',
              width: 'auto',
              height: '50px',
              backgroundColor:
                theme.palette[messageState?.message === 'tooManyResults' ? 'error' : 'primary']
                  .main,
              border: `1px solid ${theme.palette[messageState?.message === 'tooManyResults' ? 'error' : 'primary'].main}`,
              borderRadius: '9px',
              color: theme.palette.common.white,
            }}
          >
            {messageState.iconName && (
              <AssetByType
                input="icons"
                name={messageState.iconName}
                props={{
                  sx: {
                    padding: '5px',
                    width: '50px',
                    height: '50px',
                    color: 'white',
                  },
                }}
              />
            )}
            <Typography variant={'body1'}>
              {translate(messageState.message, {
                ns: COMMON,
                lng: selectedLanguage,
              })}
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>

      <span id={descId} style={{ display: 'none' }}>
        {translate(messageState.messageDesc, {
          ns: COMMON,
          lng: selectedLanguage,
        })}
      </span>
    </>
  );
};

export default TableMessage;
