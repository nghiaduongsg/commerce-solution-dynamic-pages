import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';

import { TablePaginationActionsProps } from './TablePaginationActions.d';
import useTable from '@pkg-list/hooks/useTable';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';

const useStyles = () => {
  return {
    container: {
      flexShrink: 0,
      marginLeft: useTheme().spacing(3),
    },
  };
};

export default function TablePaginationActions({
  onChangePage,
  tableId,
  parentId,
}: TablePaginationActionsProps) {
  const classes = useStyles();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { page, hasNextPage, totalPages, loading } = useTable(tableId);

  const handleFirstPageButtonClick = () => {
    onChangePage(null, 0);
  };

  const handleBackButtonClick = () => {
    onChangePage(null, page - 1);
  };

  const handleNextButtonClick = () => {
    onChangePage(null, page + 1);
  };

  const handleLastPageButtonClick = () => {
    onChangePage(null, Math.max(0, totalPages - 1));
  };

  const elementId = useMemo(() => {
    if (parentId) {
      return `${tableId}-${parentId}`;
    }
    return tableId;
  }, [tableId, parentId]);

  return (
    <Box sx={classes.container}>
      <GenericIconButton
        id={`${tableId}-first-page-btn`}
        testId={`${elementId}-first-page-btn`}
        ariaLabel={translate('goToFirstPage', { ns: COMMON, lng: selectedLanguage })}
        onClick={handleFirstPageButtonClick}
        disabled={page === 0 || loading}
        icon={
          useTheme().direction === 'rtl' ? (
            <AssetByType input="icons" name="LastPage" props={{ id: `${tableId}-last-page-btn` }} />
          ) : (
            <AssetByType input="icons" name="FirstPage" />
          )
        }
      />

      <GenericIconButton
        id={`${tableId}-previous-page-btn`}
        testId={`${elementId}-previous-page-btn`}
        ariaLabel={translate('goToPreviousPage', {
          ns: COMMON,
          lng: selectedLanguage,
          page: page - 1,
        })}
        onClick={handleBackButtonClick}
        disabled={page === 0 || loading}
        icon={
          useTheme().direction === 'rtl' ? (
            <AssetByType input="icons" name="KeyboardArrowRight" />
          ) : (
            <AssetByType input="icons" name="KeyboardArrowLeft" />
          )
        }
      />
      <GenericIconButton
        id={`${tableId}-next-page-btn`}
        testId={`${elementId}-next-page-btn`}
        ariaLabel={translate('goToNextPage', { ns: COMMON, lng: selectedLanguage, page: page + 1 })}
        onClick={handleNextButtonClick}
        disabled={!hasNextPage || loading}
        icon={
          useTheme().direction === 'rtl' ? (
            <AssetByType input="icons" name="KeyboardArrowLeft" />
          ) : (
            <AssetByType input="icons" name="KeyboardArrowRight" />
          )
        }
      />

      <GenericIconButton
        id={`${tableId}-last-page-btn`}
        testId={`${elementId}-last-page-btn`}
        ariaLabel={translate('goToLastPage', { ns: COMMON, lng: selectedLanguage })}
        onClick={handleLastPageButtonClick}
        disabled={!hasNextPage || totalPages < 0 || loading}
        icon={
          useTheme().direction === 'rtl' ? (
            <AssetByType input="icons" name="FirstPage" />
          ) : (
            <AssetByType input="icons" name="LastPage" />
          )
        }
      />
    </Box>
  );
}
