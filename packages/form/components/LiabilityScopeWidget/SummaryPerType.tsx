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
import { useTheme } from '@mui/material/styles';

import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericCollapse from '@pkg-common/components/GenericCollapse/GenericCollapse';

const getStyles = (theme) => ({
  section: { marginTop: 16 },
  note: { fontSize: 11, color: theme.palette?.text.secondary },
  title: {
    fontSize: 12,
    color: theme.palette?.text.primary,
    fontWeight: 500,
    marginLeft: 8,
  },
  text: { fontSize: 11, color: theme.palette?.text.primary, marginLeft: 16 },
});

const SummaryPerType = ({
  selection,
  type,
}: {
  type: string;
  selection: {
    list: Array<{
      billSegment: { id: string; identificationLabel: string };
      excluded: boolean;
      included?: boolean;
      percentage: number;
      maxAmount: number;
    }>;
    percentage: number;
    periods: Array<{ startDate: string; endDate: string; percentage: number; maxAmount: number }>;
    isByPeriod: boolean;
  };
}) => {
  const styles = getStyles(useTheme());

  const list = useMemo(() => {
    return (
      selection?.list?.filter((item) => item.excluded || item.percentage || item.maxAmount) || []
    );
  }, [selection]);

  const periods = useMemo(() => {
    return selection?.periods || [];
  }, [selection]);

  if (!list?.length && !periods.length) {
    return (
      <div style={{ marginTop: 16 }}>
        <Typography color={'primary'}>{type}</Typography>
      </div>
    );
  }

  return (
    <Box sx={styles.section}>
      <GenericCollapse title={type}>
        <>
          {!selection?.isByPeriod && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Label</TableCell>
                    <TableCell align="left">Excluded</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="right">Max. Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="left">
                        <Typography sx={styles.text}>
                          {item?.billSegment?.identificationLabel || item?.billSegment?.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {item?.excluded ? (
                          <AssetByType input="icons" name="RemoveCircleOutline" />
                        ) : (
                          ''
                        )}
                      </TableCell>
                      <TableCell align="right">{item?.percentage || '-'} %</TableCell>
                      <TableCell align="right">{item?.maxAmount || '-'} </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selection?.isByPeriod && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Start Date</TableCell>
                    <TableCell align="left">End Date</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="right">Max Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="left">
                        <Typography sx={styles.text}>{item?.startDate}</Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Typography sx={styles.text}>{item?.endDate}</Typography>
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

export default SummaryPerType;
