import React, { useCallback, useContext, useState } from 'react';
import { TableCell, Button, Typography } from '@mui/material';
import { GenericTableCellProps } from './GenericTableCell.d';
import GenericTableToggleCell from '../GenericTableToggleCell/GenericTableToggleCell';
import GenericForm from '@pkg-form/components/GenericForm';
import { SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import GenericTableEditableCell from '../GenericTableCell/GenericTableEditableCell';
import FormattedCellText from '@pkg-list/components/GenericTableCell/FormattedCellText';
import { getCorrectColorConfiguration } from '@pkg-list/utils/tableRowUtils';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import GenericTableEditableHistoryCell from '@pkg-list/components/GenericTableCell/GenericTableHistoryCell/GenericTableEditableHistoryCell';
import { capitalizeFirstLetter } from '@pkg-form/components/GroupObjectField/utils';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import { UiIncludedBillSegmentContext } from '@pkg-form/components/LiabilityScopeWidget/LiabilityScopeWidget';
import LiabilityIconButton from '@pkg-form/components/LiabilityScopeWidget/LiabilityIconButton';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTheme } from '@mui/material/styles';
import useUser from '@pkg-setup/src/user/useUser';
import StatusBadgeCell from './StatusBadgeCell';

const GenericTableCell = ({
  value,
  config,
  tableId,
  relatedColumnValue,
  cellAriaDescription,
  rowId,
  namespaces,
  row,
}: GenericTableCellProps) => {
  const styles = getStyles(useTheme());
  const [openDialog, setOpenDialog] = useState(false);
  const { disabled } = useContext(UiIncludedBillSegmentContext);

  const {
    align,
    entityId,
    entityTitle,
    defaultSymbol,
    actionModalSize,
    clickable,
    newLine = false,
    type,
    bold,
    index,
    expandable,
    name,
    validations,
    colors,
  } = config || {};

  const { t: translate } = useTranslation(namespaces || [COMMON]);
  const { selectedLanguage } = useSystem();
  const { partyRoleId } = useUser();

  const cellColorConfiguration = getCorrectColorConfiguration(
    tableId,
    row,
    { user: partyRoleId || '', state: {}, routeParams: {}, routerData: {} },
    colors || [],
  );
  const formatText = (
    <FormattedCellText
      cellColor={cellColorConfiguration?.color}
      value={value}
      relatedColumnValue={relatedColumnValue}
      column={config}
    />
  );

  const onCellClick = useCallback(() => {
    setOpenDialog(true);
    localStorage.setItem('CLICKED_CELL_ID_' + entityId, JSON.stringify({ value }));
  }, [entityId, value]);

  if (type === 'check') {
    return (
      <GenericTableToggleCell
        rowId={rowId}
        tableId={tableId}
        isMultiSelect={true}
        columnIndex={index}
        disabled={disabled}
        sticky={false}
      />
    );
  }

  if (type === 'editable') {
    return (
      <GenericTableEditableHistoryCell
        tableId={tableId}
        columnIndex={index}
        rowIndex={row?.__INDEX__}
        cellId={`${rowId}${capitalizeFirstLetter(name)}`}
        row={row}
        columnName={`${translate(name || 'value', { lng: selectedLanguage })}`}
      />
    );
  }

  if (type === 'editableNumber') {
    return (
      <GenericTableEditableCell
        rowId={rowId}
        tableId={tableId}
        rowIndex={row.__INDEX__}
        columnIndex={index}
        defaultSymbol={defaultSymbol}
        validations={validations}
        columnName={`${translate(name || 'value', { lng: selectedLanguage })}`}
      />
    );
  }

  if (type === 'liabilityScopeIconButton') {
    return (
      <LiabilityIconButton
        rowId={rowId}
        namespaces={namespaces || []}
        visible={!disabled}
        tableId={tableId}
      />
    );
  }

  if (type === 'statusBadge') {
    return <StatusBadgeCell value={value} config={config} align={align} row={row} />;
  }

  return (
    <>
      {expandable && (
        <>
          <Typography
            variant="body2"
            gutterBottom
            component="div"
            sx={{
              ...styles.tableBodyCell,
              ...(bold ? { ...styles.tableBodyCellRoot, ...styles.tableBodyCellBold } : {}),
            }}
            aria-label={value}
            aria-describedby={cellAriaDescription ? 'cell-desc' : undefined}
            align={align}
          >
            {clickable ? (
              <GenericIconButton
                id="clickable-cell"
                label={`${translate(name ?? '', { lng: selectedLanguage })}: ${value}`}
                ariaLabel={`${translate(name ?? '', { lng: selectedLanguage })}: ${value}`}
                ariaDescription={`${translate('clickToOpen', { ns: COMMON, lng: selectedLanguage })} ${translate(
                  name ?? '',
                  { lng: selectedLanguage },
                )}: ${value}`}
                onClick={onCellClick}
                ariaHasPopup={true}
                icon={
                  <span>
                    <div>{`${translate(name ?? '', { lng: selectedLanguage })}:`}</div> {formatText}
                  </span>
                }
              />
            ) : (
              <span>
                <strong>{`${translate(name ?? '', { lng: selectedLanguage })}:`}</strong>{' '}
                {formatText}
              </span>
            )}
          </Typography>
          {cellAriaDescription && (
            <span id="cell-desc" style={{ display: 'none' }}>
              {cellAriaDescription}
            </span>
          )}
        </>
      )}
      {!expandable && (
        <TableCell
          component="td"
          scope="row"
          role="cell"
          align={align}
          tabIndex={0}
          sx={{
            ...styles.tableBodyCell,
            ...(newLine && { whiteSpace: 'pre-line' }),
            ...(bold ? { ...styles.tableBodyCellRoot, ...styles.tableBodyCellBold } : {}),
            ...(row?.calculatedByBe ? styles.tableBodyCalculatedCell : {}),
          }}
        >
          {clickable ? <Button onClick={onCellClick}>{formatText}</Button> : formatText}
        </TableCell>
      )}
      {openDialog && (
        <SimpleDialog
          id={entityId}
          title={entityTitle}
          size={actionModalSize}
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        >
          <GenericForm
            pageId={entityId}
            requestParams={{
              code: entityId,
              screenTypeCL: SINGLE_RECORD_FORM,
            }}
            fallbackSchemas={{}}
            relatedId={value}
          />
        </SimpleDialog>
      )}
    </>
  );
};

export default React.memo(GenericTableCell, (prev, next) => prev.value === next.value);
