import React, { useEffect } from 'react';
import { Box, Collapse } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import TableFilters from './TableFilters';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { TableFiltersContainerProps } from './TableFiltersContainer.d';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useDrawer from '@pkg-common/drawer/useDrawer';
import { FILTERS_PANEL } from '@pkg-constants/formIds';
import { FILTERS_BTN_ID } from '@pkg-constants/formCommon';
import { focusElement } from '@pkg-common/utils/utils';
import { focusTrap } from '@pkg-common/utils';

const useStyles = (theme) => {
  return {
    content: {
      padding: theme.spacing(2),
      overflowX: 'hidden',
      overflowY: 'hidden',
      backgroundColor: theme.palette.primary.light,
      borderTop: `1px solid ${theme.palette.divider}`,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    header: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.primary.light,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
  };
};

const TableFiltersCollapsibleContainer = ({
  filtering,
  parentId,
  tableId,
  mode,
}: TableFiltersContainerProps) => {
  const styles = useStyles(useTheme());

  const { selectedLanguage } = useSystem();
  const { uiSchema, schema, openFilters } = filtering ?? {};
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { closeDrawer, open, openDrawer } = useDrawer(`${parentId}_${tableId}_${FILTERS_PANEL}`);

  useEffect(() => {
    if (openFilters) {
      openDrawer();
    }
  }, [openFilters]);

  if (!open) {
    return null;
  }

  return (
    <Collapse
      in={open}
      id={`${parentId}_${tableId}_${FILTERS_PANEL}`}
      aria-expanded={open}
      role="dialog"
      aria-labelledby={`${parentId}_${tableId}_${FILTERS_PANEL}-title`}
      slotProps={{
        wrapper: {
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => focusTrap(e),
        },
      }}
    >
      <Box sx={styles.header} role="banner">
        <GenericIconButton
          id={`${tableId}-${parentId}-filter-close-btn`}
          testId={`${tableId}-${parentId}-filter-close-btn`}
          ariaLabel={translate('closeFiltersAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: tableId,
          })}
          onClick={() => {
            closeDrawer();
            focusElement(`${tableId}${FILTERS_BTN_ID}`);
          }}
          icon={<AssetByType input="icons" name="Close" />}
        />
      </Box>
      <Box sx={styles.content} role="region">
        <TableFilters
          id={tableId}
          jsonSchema={schema || {}}
          uiSchema={uiSchema || {}}
          parentId={parentId}
          onClose={() => {
            closeDrawer();
            focusElement(`${tableId}${FILTERS_BTN_ID}`);
          }}
          collapsible={true}
          mode={mode}
          type={'COLLAPSE'}
        />
      </Box>
    </Collapse>
  );
};

export default TableFiltersCollapsibleContainer;
