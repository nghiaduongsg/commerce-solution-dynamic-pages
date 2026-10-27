import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import SchemaValueLabel from '@pkg-common/components/ChangesConfirmation/SchemaValueLabel';
import { useParams } from 'react-router';
import { ChangesConfirmationProps } from './ChangesConfirmation.d';
import ValuesRenderer from '../ValuesRenderer/ValuesRenderer';
import getStyles from './styles';
import useSystem from '@pkg-setup/src/system/useSystem';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import ChangedItem, {
  ChangedSingleField,
} from '@pkg-common/components/ChangesConfirmation/ChangedItem';

const ChangesConfirmation = ({
  pageId,
  open,
  onClose,
  onConfirm,
  showMessage = true,
  showButtons = true,
  title,
  size = 'lg',
}: ChangesConfirmationProps) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const styles = getStyles(useTheme());
  const routeParams = useParams<{ idKey?: string; category: string }>();
  const { diffs, groupedDiffs } = useEntityFormData(pageId);
  const hasDiffs = Object.keys(diffs ?? {}).length > 0;

  if (!routeParams.idKey || !hasDiffs) {
    return null;
  }

  const isFieldChanged = (path: string) => {
    return !!(diffs ?? {})[path];
  };

  if (!open) {
    return null;
  }

  return (
    <SimpleDialog
      id={`${pageId}-save-changes-dialog`}
      title={translate(title || 'confirmChanges', {
        ns: COMMON,
        lng: selectedLanguage,
      })}
      open={open}
      size={size}
      keepMounted={false}
      onClose={onClose}
      buttons={
        showButtons ? (
          <>
            <GenericButton
              id={`${pageId}-save-changes-no-btn`}
              variant="outlined"
              onClick={onClose}
              label={translate('cancel', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
              ariaLabel={translate('cancel', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
            />
            <GenericButton
              id={`${pageId}-save-changes-yes-btn`}
              variant="contained"
              onClick={onConfirm}
              label={translate('confirm', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
              ariaLabel={translate('confirm', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
            />
          </>
        ) : null
      }
    >
      <Box sx={styles.dialogContent}>
        {showMessage && (
          <Typography sx={styles.dialogMessage}>
            {translate('changesHistoryMessage', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
          </Typography>
        )}
        <TableContainer component={Box} sx={styles.tableContainer}>
          <Table>
            <TableHead sx={styles.tableHead}>
              <TableRow sx={styles.tableRow}>
                <TableCell align="left">
                  {translate('value', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  })}
                </TableCell>
                <TableCell align="left">
                  {translate('currentValue', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  })}
                </TableCell>
                <TableCell align="left">
                  {translate('prevValue', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  })}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedDiffs ?? {}).map(([groupedPath, grouped]) => (
                <TableRow key={groupedPath} sx={styles.tableRow}>
                  <TableCell align="left">
                    <SchemaValueLabel fieldId={groupedPath} />
                  </TableCell>

                  <TableCell align="left">
                    <ValuesRenderer
                      source={grouped.prev}
                      renderField={(label, key, value) => (
                        <ChangedItem
                          label={label}
                          value={value}
                          changed={isFieldChanged(`${groupedPath}_${key}`)}
                          type={'prev'}
                        />
                      )}
                      renderSingleField={(value) => (
                        <ChangedSingleField
                          value={value}
                          changed={isFieldChanged(`${groupedPath}`)}
                          type={'prev'}
                        />
                      )}
                    />
                  </TableCell>

                  <TableCell align="left">
                    <ValuesRenderer
                      source={grouped.current}
                      renderField={(label, key, value) => (
                        <ChangedItem
                          label={label}
                          value={value}
                          changed={isFieldChanged(`${groupedPath}_${key}`)}
                          type={'current'}
                        />
                      )}
                      renderSingleField={(value) => (
                        <ChangedSingleField
                          value={value}
                          changed={isFieldChanged(`${groupedPath}`)}
                          type={'current'}
                        />
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </SimpleDialog>
  );
};

export default ChangesConfirmation;
