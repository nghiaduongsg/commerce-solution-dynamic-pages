import React, { useCallback, useState } from 'react';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { GenericTablePanelProps } from './GenericTablePanel.d';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import {
  OPEN_LIST_FILTERS_SHORTCUT,
  OPEN_LIST_COLUMN_CONFIGURATION_SHORTCUT,
} from '@pkg-constants/keyboardShortcuts';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import useTable from '@pkg-list/hooks/useTable';
import useDrawer from '@pkg-common/drawer/useDrawer';
import { COLUMN_SELECTOR_PANEL, FILTERS_PANEL } from '@pkg-constants/formIds';
import { generateExcel } from '@pkg-list/utils/tableRowUtils';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import ConfirmationBox from '@pkg-common/components/ConfirmationBox/ConfirmationBox';

const getExpandIconName = (expanded) => (expanded ? 'Compress' : 'Expand');
const getLabelKey = (expanded) => (expanded ? 'minimizeTableAriaLabel' : 'expandTableAriaLabel');

const GenericTablePanel = ({
  filtering,
  tableId,
  namespace,
  baseDataTestId = tableId,
  actionButtons,
  headerContent,
  filtersType,
  columnConfigurable,
  heightAdjustable,
  parentId,
  onTableExpand,
  expanded = false,
  exportable,
}: GenericTablePanelProps) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);
  const isFilteringEnabled = filtering.enabled || false;
  const {
    tableData,
    visibleColumns,
    criteria,
    pageSize,
    page,
    sortBy,
    url: tableUrl,
  } = useTable(tableId);
  const { enqueueSnackbar } = useNotifiers();
  const { toggleDrawer: toggleFilters, open: filtersVisible } = useDrawer(
    `${parentId}_${tableId}_${FILTERS_PANEL}`,
  );
  const { toggleDrawer: toggleColumnSelector, open: columnSelectorVisible } = useDrawer(
    COLUMN_SELECTOR_PANEL + tableId,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [onConfirmDownload, setOnConfirmDownload] = useState<() => void>(() => () => {});

  const showDownloadDialog = useCallback(
    (cb) => {
      setOnConfirmDownload(() => () => {
        cb();
        setDialogOpen(false);
      });
      setDialogOpen(true);
    },
    [setDialogOpen, setOnConfirmDownload],
  );

  if (!Object.values(actionButtons || {}).filter((v) => !!v).length && !isFilteringEnabled) {
    return null;
  }

  return (
    <>
      {headerContent}
      {tableData?.length > 0 && heightAdjustable && (
        <GenericIconButton
          id={`${tableId}-expand-btn`}
          testId={`${tableId}-expand-btn`}
          icon={<AssetByType input="icons" name={getExpandIconName(expanded)} />}
          ariaLabel={translate(getLabelKey(expanded), {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
          })}
          onClick={onTableExpand}
        />
      )}
      {actionButtons}
      {columnConfigurable && (
        <GenericIconButton
          id={`${tableId}-column-select-btn`}
          testId={`${tableId}-column-select-btn`}
          icon={<AssetByType input="icons" name="ViewWeek" />}
          ariaKeyboardShortcuts={OPEN_LIST_COLUMN_CONFIGURATION_SHORTCUT}
          ariaLabel={translate('columnSelectorAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
          })}
          onClick={toggleColumnSelector}
          ariaHasPopup={'dialog'}
          ariaExpanded={columnSelectorVisible}
          ariaControls={columnSelectorVisible ? `${COLUMN_SELECTOR_PANEL}${tableId}` : undefined}
        />
      )}

      {isFilteringEnabled && filtersType !== 'TOP' && (
        <GenericIconButton
          id={`${tableId}-filter-btn`}
          testId={`${baseDataTestId}-filter-btn`}
          ariaKeyboardShortcuts={OPEN_LIST_FILTERS_SHORTCUT}
          ariaLabel={translate('filterAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
          })}
          ariaHasPopup={'dialog'}
          onClick={toggleFilters}
          icon={<AssetByType input="icons" name="Search" />}
          ariaExpanded={filtersVisible}
          ariaControls={filtersVisible ? `${parentId}_${tableId}_${FILTERS_PANEL}` : undefined}
        />
      )}
      {exportable && visibleColumns?.length > 0 && tableData?.length > 0 && (
        <GenericIconButton
          id={`${tableId}-export-to-excel-btn`}
          testId={`${baseDataTestId}-export-to-excel-btn`}
          ariaLabel={translate('export-to-excel', { ns: COMMON, lng: selectedLanguage })}
          onClick={() => {
            generateExcel(
              visibleColumns,
              tableData,
              translate,
              namespace,
              selectedLanguage,
              enqueueSnackbar,
              showDownloadDialog,
            );
          }}
          icon={<AssetByType input="icons" name="Description" props={{ className: 'primary' }} />}
        />
      )}
      <ConfirmationBox
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={translate('confirm', { ns: COMMON, lng: selectedLanguage })}
        testId="export-confirmation"
        message={translate('exportConfirmationMessage', { ns: COMMON, lng: selectedLanguage })}
        choices={[
          {
            label: translate('cancel', { ns: COMMON, lng: selectedLanguage }),
            variant: 'outlined',
            action: () => setDialogOpen(false),
          },
          {
            label: translate('confirm', { ns: COMMON, lng: selectedLanguage }),
            variant: 'contained',
            testId: 'confirm-export',
            action: onConfirmDownload,
          },
        ]}
      />
    </>
  );
};

export default GenericTablePanel;
