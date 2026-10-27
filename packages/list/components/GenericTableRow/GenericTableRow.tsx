import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { Box, Chip, TableRow, TableCell, Tooltip, Collapse } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import { GenericTableRowProps } from './GenericTableRow.d';
import GenericTableCell from '../GenericTableCell/GenericTableCell';
import useTable from '@pkg-list/hooks/useTable';
import GenericTableToggleCell from '../GenericTableToggleCell/GenericTableToggleCell';
import HistoryFieldsTableActions from '../HistoryFieldsTableActions/HistoryFieldsTableActions';
import {
  getCellContent,
  getCorrectColorConfiguration,
  getRelatedColumnValue,
} from '@pkg-list/utils/tableRowUtils';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useSystem from '@pkg-setup/src/system/useSystem';
import useUser from '@pkg-setup/src/user/useUser';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import InfoTooltip from '@pkg-common/components/InfoTooltip/InfoTooltip';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import { useTranslation } from 'react-i18next';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import {
  ErrorOutline,
  ErrorOutlineRounded,
  CheckBox,
  CheckBoxOutlineBlank,
} from '@mui/icons-material';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import { getStatusBadgeStyles, getStatusColors } from '../GenericTableCell/statusBadgeStyles';
import { useTheme } from '@mui/material/styles';
import ChangeIndicator from '@pkg-form/components/ChangeIndicator/ChangeIndicator';
import GenericInnerTable from '@pkg-list/components/GenericInnerTable/GenericInnerTable';
import { jpValueFirstLevel } from '@pkg-common/utils/utils';
import useNotifiers from '@pkg-common/notifier/useNotifiers';

const getRowBorderStyle = (colorConfiguration: AnyType) => {
  if (!colorConfiguration) return {};
  if (colorConfiguration.border) {
    return { border: `3px ${colorConfiguration?.color} solid` };
  }
  return { borderLeft: `6px ${colorConfiguration?.color} solid` };
};

const computeViewButton = (
  defaultDisabledActions: AnyType,
  omitLinePreviewWhenDisabled: boolean | undefined,
) => {
  if (defaultDisabledActions !== undefined) {
    return defaultDisabledActions;
  }
  if (omitLinePreviewWhenDisabled) {
    return undefined;
  }
  return {
    type: 'button',
    buttons: [
      {
        type: 'VIEW',
        icon: 'VIEW',
        style: 'icon',
        title: 'view',
      },
    ],
  };
};

const shouldShowActionsCell = (
  rowButtons: AnyType,
  defaultDisabledActions: AnyType,
  colorConfiguration: AnyType,
  changeIndicators: AnyType,
  rowStatus: string,
  isRowValid: boolean,
) => {
  if (rowButtons || defaultDisabledActions || colorConfiguration?.icon || !isRowValid) {
    return true;
  }
  return Boolean(changeIndicators?.enabled && (rowStatus === 'ADDED' || rowStatus === 'EDITED'));
};

const GenericTableRow = ({
  tableId,
  row,
  selections,
  actionDetails,
  configuration,
  parentId,
  namespaces = [COMMON, ACCESSIBILITY],
  rowButtons,
  rowContent,
  mode = 'DEFAULT',
  changeIndicators,
}: GenericTableRowProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const badgeStyles = getStatusBadgeStyles(theme);
  const { selectedLanguage } = useSystem();
  const { partyRoleId } = useUser();
  const [open, setOpen] = useState<boolean>(false);

  const { __INDEX__ } = row;

  const { t: translate } = useTranslation(namespaces);
  const {
    onLinePress = true,
    enabled: selectable,
    multiple: isMultiSelect,
    styles: selectionStyles = {},
    selectableBy,
    maxLimit,
  } = selections;

  const colors = useMemo(() => {
    if (!configuration) {
      return;
    }
    return configuration['ui:row:colors'];
  }, [configuration]);

  const { isDisabled, omitLinePreviewWhenDisabled, defaultDisabledActions } = configuration || {};

  const viewButton = computeViewButton(defaultDisabledActions, omitLinePreviewWhenDisabled);

  const colorConfiguration = getCorrectColorConfiguration(
    tableId,
    row,
    { user: partyRoleId, state: {}, routeParams: {}, routerData: {} },
    colors || [],
  );
  const {
    visibleColumns,
    innerVisibleColumns,
    rowIdKey,
    selectedRows,
    selectedRowsNumber,
    toggleTableRow,
    validationsId = tableId,
    includedBillSegmentsWithoutValue = [],
    allExtraData,
  } = useTable(tableId);

  const validationIndex = useMemo(() => {
    const newArr = includedBillSegmentsWithoutValue?.filter((num) => num < __INDEX__);
    const newIndex = __INDEX__ - newArr.length;
    if (
      includedBillSegmentsWithoutValue?.find((num) => num === __INDEX__) ||
      (includedBillSegmentsWithoutValue?.includes(0) && __INDEX__ === 0)
    )
      return -1; // specific case for index 0
    return includedBillSegmentsWithoutValue?.length ? `${newIndex}_` : __INDEX__; // newIndex_ with underscore because we have beginsWith code and in specific cases we have duplicate errors eg 1 with 11-19
  }, [includedBillSegmentsWithoutValue, __INDEX__]);

  const getCellContentCallback = useCallback(
    (rowData: AnyType, column: AnyType) => {
      const value =
        getCellContent(
          rowData,
          column,
          selectedLanguage,
          translate,
          namespaces,
          (rowData?.__STATUS__ === 'EDITED' || rowData?.__STATUS__ === 'ADDED') &&
            column?.fallbackAccessors,
        ) ?? column.defaultValue;

      if (value === 'true' && (column?.type === 'boolean' || column?.subType === 'boolean')) {
        return <CheckBox sx={{ color: 'green' }} data-testid="CheckBoxIcon" />;
      } else if (
        value === 'false' &&
        (column?.type === 'boolean' || column?.subType === 'boolean')
      ) {
        return <CheckBoxOutlineBlank color="primary" data-testid="CheckBoxOutlineBlank" />;
      } else {
        return value;
      }
    },
    [selectedLanguage, translate, namespaces],
  );

  const rowId = useMemo(() => {
    return jpValueFirstLevel(row, rowIdKey);
  }, [row, rowIdKey]);

  const elementId = useMemo(() => {
    if (parentId) {
      return `${rowId}-${parentId}`;
    } else {
      return rowId;
    }
  }, [rowId, parentId]);

  const isSelected = useMemo(() => {
    return selectedRows[rowId];
  }, [selectedRows, rowId]);

  const isUnprocessed = useMemo(() => {
    return allExtraData?.[0]?.unprocessedRowIds?.includes(rowId) ?? false;
  }, [allExtraData, rowId]);

  const isSubmitError = useMemo(() => {
    return allExtraData?.[0]?.submitErrorRowIds?.includes(rowId) ?? false;
  }, [allExtraData, rowId]);

  const isUnprocessedHighlighted = isUnprocessed && !!isSelected;

  const isRowEditable = useMemo(() => {
    if (!selectableBy) {
      return true;
    }

    return row?.[selectableBy] === 'true';
  }, [selectableBy, row]);

  const namespace = useMemo(() => {
    if (!configuration) {
      return '';
    }
    return configuration['ui:labels']?.namespace || '';
  }, [configuration]);

  const { status: localRowStatus, localRowIndex, __INDEX__: index } = row || {};

  const testId = open ? 'Collapse' : 'Expand';

  const { serverErrors: rowServerErrors, isFormValidServerSide: isRowValid } = useFormValidity(
    `${validationsId}_${validationIndex}`,
  );

  // This is for tables that have the following configuration local: { enabled: true, validationsField: ''}
  // See. relationships in party roles
  const { entityId, local } = configuration;
  const { validationsField } = local || {};
  const { serverErrors } = useFormValidity(
    `${entityId}_${validationsField}_${localRowStatus ? localRowIndex : index}`,
  );
  const { enqueueSnackbar } = useNotifiers();

  const handleRowClick = () => {
    globalThis.ROW = elementId;

    if (configuration?.quickView?.enabled) {
      const DOUBLE_CLICK_THRESHOLD = 300;

      if ((globalThis as any)._quickViewClickTimer) {
        clearTimeout((globalThis as any)._quickViewClickTimer);
        (globalThis as any)._quickViewClickTimer = null;
        return;
      }

      (globalThis as any)._quickViewClickTimer = setTimeout(() => {
        (globalThis as any)._quickViewClickTimer = null;
        globalThis.dispatchEvent(new CustomEvent('table-row-click', { detail: { tableId, row } }));
      }, DOUBLE_CLICK_THRESHOLD);
    }

    if (!onLinePress || !selectable || (selectable && !isRowEditable)) return;

    if (maxLimit && !isSelected && selectedRowsNumber >= maxLimit) {
      enqueueSnackbar({
        key: Date?.now(),
        message: translate('maxSelectionExceeded', {
          ns: COMMON,
          lng: selectedLanguage,
          max: maxLimit,
          count: selectedRowsNumber,
        }),
        severity: 'error',
      });
      return;
    }

    toggleTableRow?.(rowId, isMultiSelect);
  };

  const toggleIconName = open ? 'KeyboardArrowUp' : 'KeyboardArrowDown';
  const actionsConfig = isDisabled ? viewButton : rowButtons;
  const rowMode = mode === 'LOCAL' && localRowStatus ? mode : 'DEFAULT';

  const showActionsCell = shouldShowActionsCell(
    rowButtons,
    defaultDisabledActions,
    colorConfiguration,
    changeIndicators,
    row.__STATUS__,
    isRowValid,
  );

  return (
    <>
      <TableRow
        role="row"
        aria-rowindex={index + 1}
        sx={{
          selected:
            isSubmitError || isUnprocessedHighlighted
              ? styles.tableBodyRowUnprocessed
              : styles.tableBodyRowSelected,
          root: styles.tableBodyRow,
        }}
        style={{
          ...(isSelected ? selectionStyles : {}),
          ...getRowBorderStyle(colorConfiguration),
        }}
        id={elementId}
        selected={isSelected || globalThis.ROW === elementId}
        component="tr"
        onClick={handleRowClick}
        onDoubleClick={(e) => e.preventDefault()}
        tabIndex={0}
      >
        {selectable &&
          (isRowEditable ? (
            <GenericTableToggleCell
              rowId={rowId}
              tableId={tableId}
              isMultiSelect={isMultiSelect}
              maxLimit={maxLimit}
            />
          ) : (
            <TableCell role="cell" component="td" scope="row" sx={styles.tableBodyRowCell} />
          ))}
        {(innerVisibleColumns || []).length > 0 && (
          <TableCell
            width={5}
            component="td"
            scope="row"
            align="right"
            role="cell"
            sx={styles.tableBodyRowCell}
          >
            <GenericIconButton
              id={`${testId}-btn`}
              testId={`${testId}-btn`}
              label={translate(`${testId}`, { ns: COMMON })}
              ariaLabel={translate(`${testId}AriaLabel`, { ns: ACCESSIBILITY })}
              ariaDescription={translate(`${testId}AriaDescription`, {
                ns: ACCESSIBILITY,
                rowIndex: localRowIndex,
              })}
              ariaHasPopup={true}
              ariaExpanded={open}
              onClick={() => setOpen(!open)}
              icon={<AssetByType input="icons" name={toggleIconName} />}
            />
          </TableCell>
        )}
        {visibleColumns?.map((column: AnyType, index: AnyType) => (
          <GenericTableCell
            key={`${rowId}-${column.name}`}
            rowId={rowId}
            row={row}
            tableId={tableId}
            config={{ ...column, index, bold: row.isBold }}
            value={getCellContentCallback(row, column)}
            relatedColumnValue={getRelatedColumnValue(row, column)}
            cellAriaDescription={translate('tableCellAriaDescription', {
              ns: ACCESSIBILITY,
              rowIndex: index,
              columnName: column.name,
            })}
            namespaces={namespaces}
          />
        ))}
        {rowContent && (
          <TableCell
            width={30}
            component="td"
            scope="row"
            align="right"
            role="cell"
            sx={styles.tableBodyRowCell}
          >
            {rowContent({ row })}
          </TableCell>
        )}
        {showActionsCell && (
          <TableCell
            width={20}
            component="td"
            scope="row"
            align="right"
            role="cell"
            sx={{ ...styles.tableBodyRowCell, ...styles.tableStickyCell }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
              }}
            >
              <ChangeIndicator status={row.__STATUS__} changeIndicators={changeIndicators} />

              {colorConfiguration?.icon && (
                <AssetByType
                  input="icons"
                  name={colorConfiguration?.icon || 'Help'}
                  props={{
                    style: {
                      color: colorConfiguration?.color,
                      ...(colorConfiguration?.iconStyles || {}),
                    },
                  }}
                />
              )}
              {!isRowValid && (
                <Tooltip
                  role="tooltip"
                  title={
                    <Box sx={badgeStyles.errorTooltipContent}>
                      {(rowServerErrors || []).map((msg: string) => (
                        <Box key={msg} sx={badgeStyles.errorTooltipItem}>
                          <Box sx={badgeStyles.errorTooltipBullet} />
                          <Box sx={badgeStyles.errorTooltipMessage}>{msg}</Box>
                        </Box>
                      ))}
                    </Box>
                  }
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: badgeStyles.errorTooltipPaper,
                    },
                  }}
                >
                  <Chip
                    icon={<ErrorOutlineRounded sx={badgeStyles.chipIcon} />}
                    size="small"
                    sx={badgeStyles.chip(getStatusColors(theme, 'ERROR'))}
                  />
                </Tooltip>
              )}
              <AppActions
                page={{ id: tableId, elementId }}
                actions={actionsConfig}
                checkPermissions={true}
                source={row}
                mode={rowMode}
                namespace={namespace}
              />
            </div>
          </TableCell>
        )}
        {mode === 'LOCAL' &&
          (localRowStatus ? (
            <RowSign
              rowStatus={localRowStatus}
              serverErrors={serverErrors}
              cellStyles={styles.tableBodyRowCell}
            />
          ) : (
            <TableCell component="td" scope="row" align="right" sx={styles.tableBodyRowCell} />
          ))}
        {configuration?.actions && (
          <TableCell
            width={30}
            component="td"
            scope="row"
            align="right"
            role="cell"
            sx={styles.tableBodyRowCell}
          >
            <HistoryFieldsTableActions
              tableId={tableId}
              rowIdKey={rowIdKey}
              rowData={row}
              configuration={configuration}
              actionDetails={actionDetails}
              parentId={parentId}
            />
          </TableCell>
        )}
      </TableRow>
      {(innerVisibleColumns || []).length > 0 && (
        <TableRow tabIndex={0} role="row" sx={styles.noHover}>
          <TableCell
            style={
              {
                padding: '0px',
                height: '0px',
                WebkitHeight: '0px',
                MozHeight: '0px',
                msHeight: '0px',
              } as CSSProperties
            }
            role="cell"
            colSpan={visibleColumns?.length + 1 + (configuration?.actions ? 1 : 0)} // one for expand-collapse + one for actions
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <GenericInnerTable
                getCellContentCallback={getCellContentCallback}
                namespaces={namespaces}
                row={row}
                tableId={tableId}
              />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default GenericTableRow;

const RowSign = ({ rowStatus, serverErrors, cellStyles }) => {
  let icon;

  if (rowStatus === 'ADD') {
    icon = <AssetByType input="icons" name="DoneAll" props={{ style: { color: 'green' } }} />;
  } else if (rowStatus === 'DELETE') {
    icon = (
      <AssetByType input="icons" name="DeleteForeverSharp" props={{ style: { color: 'red' } }} />
    );
  } else if ('undefined' !== typeof rowStatus) {
    icon = <AssetByType input="icons" name="EditSharp" props={{ style: { color: 'blue' } }} />;
  }

  return (
    <TableCell width={15} sx={cellStyles}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {icon && (
          <Tooltip
            title={`The data has been ${rowStatus} locally. To insert it into the database, please press the submit button.`}
            placement="top"
            sx={cellStyles}
            role="tooltip"
          >
            {icon}
          </Tooltip>
        )}
        {serverErrors?.length > 0 && (
          <InfoTooltip
            id={`error-container`}
            message={serverErrors}
            icon={<ErrorOutline style={{ color: 'red' }} />}
          />
        )}
      </div>
    </TableCell>
  );
};
