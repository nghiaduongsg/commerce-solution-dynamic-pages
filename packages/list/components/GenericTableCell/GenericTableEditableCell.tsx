import React, { useMemo, useEffect, useState } from 'react';
import { Box, TableCell, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useTable from '@pkg-list/hooks/useTable';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { GenericTableEditableCellProps } from './GenericTableEditableCell.d';
import { getAllTextValidationErrors } from '@pkg-form/validations/utils/textValidationUtils';
import useSystem from '@pkg-setup/src/system/useSystem';

const TextFieldAny = TextField as any;

const getStyles = (theme) => ({
  errorIcon: {
    color: theme.palette?.error.main,
    width: theme.spacing(2),
    paddingLeft: 2,
  },
  currencySymbol: {
    fontSize: 12,
  },
  currencyContainer: {
    cursor: 'pointer',
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: theme.palette?.divider,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    boxShadow: '1px 3px 20px 3px #dddddd',
    '&:hover': {
      backgroundColor: theme.palette?.primary.main,
      color: theme.palette?.common.white,
    },
  },
});

const GenericTableEditableCell = ({
  tableId,
  rowId,
  columnIndex = 0,
  disabled,
  defaultSymbol,
  columnName,
}: GenericTableEditableCellProps) => {
  const styles = getStyles(useTheme());

  const { primaryCurrency } = useSystem();

  const { allExtraData, setExtraTableData } = useTable(tableId);
  const [isValid, setIsValid] = useState(true);

  const extraValue = useMemo(() => {
    if (!allExtraData) {
      return '';
    }

    if (!allExtraData[columnIndex]) {
      return '';
    }

    return allExtraData[columnIndex][rowId];
  }, [allExtraData, columnIndex, rowId]);

  const [isPercentage, setIsPercentage] = useState(extraValue?.isPercentage);

  const errors = getAllTextValidationErrors(
    isPercentage ? { minValue: 0, maxValue: 100 } : { minValue: 0 },
    extraValue?.value,
  );

  useEffect(() => {
    setIsValid(errors.length === 0);
  }, [isPercentage, extraValue?.value]);

  const symbol = <Box sx={styles.currencySymbol}>{primaryCurrency?.code}</Box>;

  return (
    <TableCell width={50} role="cell">
      <TextFieldAny
        type="number"
        id={rowId}
        onBlur={(e) => {
          const value = e.target.value;
          try {
            const num = Number.parseFloat(value);
            setExtraTableData({ [rowId]: { value: num, isPercentage } }, columnIndex);
          } catch {
            setIsValid(false);
          }
        }}
        placeholder={isNaN(extraValue?.value) ? null : extraValue?.value}
        disabled={disabled}
        fullWidth
        error={!isValid}
        role="textbox"
        slotProps={({
          htmlInput: {
            min: 0,
            max: isPercentage && 100,
            ['data-testid']: rowId,
            role: 'textbox',
            'aria-label': columnName,
            'aria-disabled': disabled,
            'aria-required': false,
            'aria-invalid': !isValid,
          },
          input: {
            tabIndex: -1,
            sx: {
              fontSize: '16px',
            },
            endAdornment: (
              <>
                <Box
                  sx={styles.currencyContainer}
                  data-testid={`${rowId}-symbol`}
                  onClick={() => {
                    setIsPercentage((prev) => !prev);
                    setExtraTableData(
                      { [rowId]: { value: extraValue?.value, isPercentage: !isPercentage } },
                      columnIndex,
                    );
                  }}
                >
                  {isPercentage ? defaultSymbol : symbol}
                </Box>
                {!isValid && (
                  <AssetByType input="icons" name="ErrorOutline" props={{ sx: styles.errorIcon }} />
                )}
              </>
            ),
          },
        } as any)}
      />
    </TableCell>
  );
};

export default GenericTableEditableCell;
