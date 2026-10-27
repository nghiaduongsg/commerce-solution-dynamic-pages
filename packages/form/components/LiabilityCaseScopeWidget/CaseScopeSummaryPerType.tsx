import React, { useMemo } from 'react';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import GenericCollapse from '@pkg-common/components/GenericCollapse/GenericCollapse';
import { CaseScopeSummaryItemType } from './CaseScopeSummary.d';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTheme } from '@mui/material/styles';

const getStyles = (theme) => {
  return {
    section: { marginBottom: theme.spacing(2) },
  };
};

const CaseScopeSummaryPerType = ({
  selection,
  namespace,
}: {
  selection: CaseScopeSummaryItemType;
  namespace: string;
}) => {
  const styles = getStyles(useTheme());
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace]);

  const list = useMemo(() => {
    return (
      selection?.list?.filter((item) => item.included || item.percentage || item.maxAmount) || []
    );
  }, [selection]);

  const periods = useMemo(() => {
    return selection?.periods || [];
  }, [selection]);

  if (!list?.length && !periods.length) {
    return null;
  }

  return (
    <Box sx={styles.section}>
      <GenericCollapse
        title={`${selection?.description || selection?.code}: ${selection?.percentage || '-'}%`}
        titleStyles={{ marginLeft: 16 }}
      >
        <>
          {list?.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">
                      {translate('billSegments', { ns: namespace, lng: selectedLanguage })}
                    </TableCell>
                    <TableCell align="right">
                      {translate('percentage', { ns: namespace, lng: selectedLanguage })}
                    </TableCell>
                    <TableCell align="right">
                      {translate('maxAmount', { ns: namespace, lng: selectedLanguage })}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="left">
                        <Typography className={styles.text}>
                          {item?.billSegment?.identificationLabel || item?.billSegment?.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item?.percentage || '-'} %</TableCell>
                      <TableCell align="right">{item?.maxAmount || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {periods.length > 0 && (
            <TableContainer component={Paper} style={{ marginTop: list?.length > 0 ? 24 : 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">
                      {translate('startDate', { ns: namespace, lng: selectedLanguage })}
                    </TableCell>
                    <TableCell align="left">
                      {translate('endDate', { ns: namespace, lng: selectedLanguage })}
                    </TableCell>
                    <TableCell align="right">
                      {translate('percentage', { ns: namespace, lng: selectedLanguage })}
                    </TableCell>
                    <TableCell align="right">
                      {translate('maxAmount', { ns: namespace, lng: selectedLanguage })}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="left">
                        <Typography className={styles.text}>{item?.startDate}</Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Typography className={styles.text}>{item?.endDate}</Typography>
                      </TableCell>
                      <TableCell align="right">{item?.percentage} %</TableCell>
                      <TableCell align="right">{item?.maxAmount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </GenericCollapse>
    </Box>
  );
};

export default CaseScopeSummaryPerType;
