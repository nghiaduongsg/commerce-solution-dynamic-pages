import React from 'react';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import IstCheckboxesList from '@pkg-common/atomics/IstCheckboxesList/IstCheckboxesList';
import { ColumnSelectorProps } from './ColumnSelector.d';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Collapse, Typography, useTheme } from '@mui/material';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useDrawer from '@pkg-common/drawer/useDrawer';
import { COLUMN_SELECTOR_COLLAPSIBLE_AREA, COLUMN_SELECTOR_PANEL } from '@pkg-constants/formIds';
import { COLUMN_SELECTOR_BTN_ID } from '@pkg-constants/formCommon';
import { focusElement } from '@pkg-common/utils/utils';
import { focusTrap } from '@pkg-common/utils';

const useStyles = (theme) => {
  return {
    content: {
      padding: theme.spacing(2),
      overflowX: 'hidden',
      overflowY: 'hidden',
      backgroundColor: alpha(theme.palette.primary.light, 0.5),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    header: {
      padding: theme.spacing(2),
      backgroundColor: alpha(theme.palette.primary.light, 0.5),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  };
};

const ColumnSelectorCollapsible = ({
  tableId,
  tableName,
  parentId,
  onColumnVisibilityChange,
  selectedColumnValues,
  columnOptions,
}: ColumnSelectorProps) => {
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const styles = useStyles(useTheme());

  const { open: visible, closeDrawer } = useDrawer(COLUMN_SELECTOR_PANEL + tableId);
  const { selectedLanguage } = useSystem();

  if (!visible) {
    return null;
  }

  return (
    <Collapse
      in={visible}
      timeout="auto"
      id={`${COLUMN_SELECTOR_PANEL}${tableId}`}
      role="dialog"
      aria-labelledby={`${COLUMN_SELECTOR_COLLAPSIBLE_AREA}${tableId}-title`}
      slotProps={{
        wrapper: {
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => focusTrap(e),
        },
      }}
    >
      <Box style={styles.header}>
        <Typography
          id={`${COLUMN_SELECTOR_COLLAPSIBLE_AREA}${tableId}-title`}
          variant={'subtitle2'}
          component="h4"
        >
          {translate('columnSelector', { ns: COMMON, lng: selectedLanguage, tableName })}
        </Typography>
        <GenericIconButton
          id={`${tableId}-${parentId}-column-selector-close-btn`}
          testId={`${tableId}-${parentId}-column-selector-close-btn`}
          ariaLabel={translate('closeColumnConfiguratorAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
          onClick={() => {
            closeDrawer();
            focusElement(`${tableId}${COLUMN_SELECTOR_BTN_ID}`);
          }}
          icon={<AssetByType input="icons" name="Close" />}
        />
      </Box>
      <Box sx={styles.content} id={`${tableId}-${parentId}-column-selector`}>
        <IstCheckboxesList
          value={selectedColumnValues}
          multiple={true}
          id={`${tableId}-${parentId}-column-selector`}
          data-testid={`${tableId}-${parentId}-column-selector`}
          options={columnOptions}
          onChange={onColumnVisibilityChange}
        />
      </Box>
    </Collapse>
  );
};

export default ColumnSelectorCollapsible;
