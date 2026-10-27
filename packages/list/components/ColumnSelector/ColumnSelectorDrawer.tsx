import React from 'react';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import IstCheckboxesList from '@pkg-common/atomics/IstCheckboxesList/IstCheckboxesList';
import AppDrawer from '@pkg-common/drawer/AppDrawer';
import { COLUMN_SELECTOR_PANEL } from '@pkg-constants/formIds';
import { ColumnSelectorProps } from './ColumnSelector.d';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { focusElement } from '@pkg-common/utils/utils';
import { COLUMN_SELECTOR_BTN_ID } from '@pkg-constants/formCommon';

const ColumnSelectorDrawer = ({
  tableId,
  tableName,
  parentId,
  onColumnVisibilityChange,
  selectedColumnValues,
  columnOptions,
}: ColumnSelectorProps) => {
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { selectedLanguage } = useSystem();

  return (
    <AppDrawer
      id={`${COLUMN_SELECTOR_PANEL}${tableId}`}
      drawerId={`${COLUMN_SELECTOR_PANEL}${tableId}`}
      closeButtonId={`${tableId}-column-selector-close-btn`}
      closeButtonAriaLabel={'closeColumnConfiguratorAriaLabel'}
      title={translate('columnSelector', { ns: COMMON, lng: selectedLanguage, tableName })}
      variant={'temporary'}
      role="dialog"
      onClose={() => focusElement(`${tableId}${COLUMN_SELECTOR_BTN_ID}`)}
    >
      <IstCheckboxesList
        value={selectedColumnValues}
        multiple={true}
        id={`${tableId}-${parentId}-column-selector`}
        data-testid={`${tableId}-${parentId}-column-selector`}
        options={columnOptions}
        onChange={onColumnVisibilityChange}
      />
    </AppDrawer>
  );
};

export default ColumnSelectorDrawer;
