import React, { useMemo, useState } from 'react';
import { Box, TableCell, TextField, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useTable from '@pkg-list/hooks/useTable';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { getFormIdFromWidgetId } from '@pkg-common/utils';
import GenericCorrections from './GenericCorrections';
import { useTranslation } from 'react-i18next';
import { GenericNumberFormatter } from '@pkg-common/atomics/GenericNumberFormatter/GenericNumberFormatter';
import useAmount from '@pkg-common/hooks/useAmount';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import InfoTooltip from '@pkg-common/components/InfoTooltip/InfoTooltip';
import useClearButtonPress from '@pkg-common/button/useClearButtonPress';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useApiDataState } from '@pkg-core/apiData';
import { VALID_STATUS_RESOURCE_ID } from '@pkg-constants/formCommon';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';

const getLocalStyles = (theme) => {
  return {
    errorIcon: {
      color: theme.palette?.error.main,
      width: theme.spacing(2),
      paddingLeft: 2,
    },
    resize: {
      fontSize: 14,
    },
    cellButton: {
      cursor: 'pointer',
    },
    cellButtonColored: {
      cursor: 'pointer',
    },
    field: {
      background: alpha(theme.palette?.primary.main, 0.1),
      border: `1px solid ${alpha(theme.palette?.primary.main, 0.1)}`,
      borderRadius: 2,
      textAlign: 'right',
    },
    disabledField: {
      textAlign: 'right',
    },
    calculationField: {
      background: alpha('#A4A4A4', 0.5),
      textAlign: 'right',
    },
    highlight: {
      fontWeight: 500,
    },
  };
};

const GenericTableEditableHistoryCell = ({
  tableId,
  columnIndex = 0,
  rowIndex = 0,
  cellId = '',
  row,
  columnName,
}) => {
  const theme = useTheme();
  const localStyles = getLocalStyles(theme);
  const styles = getStyles(theme);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const fieldId = `${tableId}_${cellId}`;
  const pageId = getFormIdFromWidgetId(tableId);
  const { serverErrors } = useFormValidity(fieldId);
  const { clearAllButtonPresses } = useClearButtonPress();

  const propertyName = useMemo(() => {
    const parts = tableId.split('_');
    return parts[tableId.split('_').length - 1];
  }, [tableId]);

  const fieldPath = useMemo(() => {
    return `${propertyName}.${cellId}`;
  }, [propertyName, cellId]);

  const { formData: pageData } = useEntityFormData(pageId);

  const { data } = useApiDataState(VALID_STATUS_RESOURCE_ID);

  const editAllowedCheck = data?.attributes.some(
    (att) => att.key === 'editAllowed' && att.value === 'YES',
  );
  const editAllowed = editAllowedCheck ?? true;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isValid, setIsValid] = useState(true);

  const cellValue = useMemo(() => {
    return row[cellId || ''];
  }, [row, cellId]);

  const isRowCalculated = useMemo(() => {
    return row?.calculatedByBe;
  }, [row]);

  const hasCorrections = useMemo(() => {
    return pageData?.formCorrectionFields?.indexOf(`$.${fieldPath}`) >= 0;
  }, [fieldPath, pageData]);

  const { updateTableRow, allExtraData, correctionsDisabled, disabled } = useTable(tableId);

  const handleOnBlur = (value: string) => {
    try {
      const regexPattern = new RegExp(`\\${thousandSeparator}`, 'g');
      value = value.replace(regexPattern, '');
      let valueWithoutChars = value.replace(
        new RegExp(`[^0-9${decimalSeparator}${thousandSeparator}-]`, 'g'),
        '',
      );
      const num = Number.parseFloat(valueWithoutChars.replace(decimalSeparator, '.'));
      updateTableRow({
        property: {
          value: num || 0,
          name: cellId,
        },
        rowIndex,
        columnIndex,
      });

      setIsValid(true);
    } catch (error) {
      console.error('Error:', error);
      setIsValid(false);
    }
  };

  const correctable = useMemo(() => {
    if (
      !allExtraData ||
      typeof allExtraData[columnIndex] === 'undefined' ||
      typeof allExtraData[columnIndex][rowIndex] === 'undefined'
    ) {
      return false;
    }

    return !!allExtraData[columnIndex][rowIndex];
  }, [allExtraData, columnIndex, rowIndex]);

  const hasErrors = useMemo(() => {
    return !isValid || serverErrors.length > 0;
  }, [serverErrors]);

  const iconType = disabled || !editAllowed ? 'visibilityIcon' : 'editIcon';
  const buttonLabel = disabled || !editAllowed ? 'viewHistoryAriaLabel' : 'editHistoryAriaLabel';

  const {
    symbolPosition,
    thousandSeparator,
    decimalPlaces,
    symbol,
    decimalSeparator,
    value: amount,
  } = useAmount({ id: cellId, value: cellValue });

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(fieldId, hasErrors);
  }, [isValid, fieldId]);

  return (
    <>
      <TableCell
        tabIndex={0}
        width={300}
        role="cell"
        sx={{ ...styles.tableBodyCell, ...(isRowCalculated ? styles.tableBodyCalculatedCell : {}) }}
      >
        <Box display="flex" alignItems="center" justifyContent="center">
          <TextField
            type="text"
            id={`${fieldId}`}
            disabled={disabled || isRowCalculated || !correctionsDisabled}
            fullWidth
            error={hasErrors}
            sx={
              correctable && correctionsDisabled && editAllowed
                ? localStyles.field
                : localStyles.disabledField
            }
            slotProps={{
              htmlInput: {
                ['data-testid']: `${fieldId}`,
                tabIndex: 0,
                onBlur: handleOnBlur,
                id: `${fieldId}-html-input`,
                role: 'input',
                'aria-label': columnName,
                'aria-disabled': disabled,
                'aria-required': false,
                ...accessibilityErrorProps,
              },
              input: {
                inputComponent: (props) => (
                  <GenericNumberFormatter
                    {...props}
                    ariaLabel={columnName}
                    onChange={undefined}
                    symbolPosition={symbolPosition}
                    thousandSeparator={thousandSeparator}
                    decimalPlaces={decimalPlaces}
                    symbol={symbol}
                    decimalSeparator={decimalSeparator}
                    value={amount!}
                    calculatedRow={isRowCalculated}
                    isCorrectionsDisabled={correctable && correctionsDisabled}
                  />
                ),
              },
            }}
          />
          {correctable && !correctionsDisabled && (
            <GenericIconButton
              styles={hasCorrections ? localStyles.cellButtonColored : localStyles.cellButton}
              testId={`${fieldId}_${iconType}`}
              id={`${fieldId}_${iconType}`}
              ariaLabel={translate(buttonLabel, { ns: ACCESSIBILITY, lng: selectedLanguage })}
              onClick={() => setShowDialog(true)}
              icon={
                <AssetByType
                  input="icons"
                  name={disabled || !editAllowed ? 'Visibility' : 'Edit'}
                />
              }
              ariaControls={showDialog ? `${fieldId}_dialog` : undefined}
              ariaHasPopup={'dialog'}
            />
          )}
          {hasErrors && (
            <InfoTooltip
              id={`${fieldId}-error-container`}
              dataTestId={`${fieldId}-ErrorOutlineIcon`}
              message={serverErrors || []}
              icon={
                <AssetByType
                  input="icons"
                  name="ErrorOutline"
                  props={{ id: `${fieldId}-error-icon`, style: { color: 'red' } }}
                />
              }
            />
          )}
        </Box>
      </TableCell>

      <SimpleDialog
        id={`${fieldId}_dialog`}
        open={showDialog}
        onClose={() => {
          clearAllButtonPresses();
          setShowDialog(false);
        }}
        title={translate(cellId, { ns: 'form' })}
        size="xl"
      >
        <GenericCorrections
          tableId={tableId}
          fieldId={fieldId}
          pageId={pageId}
          fieldPath={fieldPath}
          propertyName={propertyName}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          cellId={cellId}
          onClose={() => setShowDialog(false)}
          disabled={disabled || !editAllowed}
        />
      </SimpleDialog>
    </>
  );
};

export default GenericTableEditableHistoryCell;
