import React, { useMemo } from 'react';
import { Button, Box, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useTable from '@pkg-list/hooks/useTable';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';

const useStyles = (theme) => {
  return {
    sortButtonActive: {
      color: theme.palette.primary.dark,
    },
    sortButtonInactive: {
      color: theme.palette.action.disabled,
    },
    sortButtonIcons: {
      display: 'flex',
      justifyContent: 'space-around',
      flexDirection: 'column',
      alignItems: 'center',
      '& .MuiSvgIcon-root': {
        height: theme.spacing(4),
        width: theme.spacing(5),
      },
      '&:hover,&:focus,&:active': {
        backgroundColor: theme.palette.primary.light,
      },
    },
  };
};

const getSort = (sortBy, queryParam) => {
  if (sortBy.includes(queryParam)) {
    if (sortBy.includes(':asc')) {
      return `${queryParam}:desc`;
    } else if (sortBy.includes(':desc')) {
      return queryParam;
    } else {
      return `${queryParam}:asc`;
    }
  }
  return `${queryParam}:asc`;
};

const sortingButtons = (activeAsc, activeDesc, styles) => {
  return (
    <>
      <AssetByType
        input="icons"
        name="ArrowDropUp"
        props={{
          fontSize: 'small',
          sx: activeAsc ? styles.sortButtonActive : styles.sortButtonInactive,
        }}
      />
      <AssetByType
        input="icons"
        name="ArrowDropDown"
        props={{
          fontSize: 'small',
          sx: activeDesc ? styles.sortButtonActive : styles.sortButtonInactive,
        }}
      />
    </>
  );
};

const appendSortTiebreaker = (sort: string, sortTieBreaker?: string) => {
  const tiebreakerField = sortTieBreaker?.split(':')[0];
  const shouldSkip = !tiebreakerField || !sort.includes(':') || sort.includes(tiebreakerField);
  return shouldSkip ? sort : `${sort},${sortTieBreaker}`;
};

const SortButton = ({
  tableId,
  queryParam,
  align,
  dataType,
  sortingLocally = false,
  sortTieBreaker,
  columnName,
}: {
  tableId: string;
  queryParam: string;
  align: string;
  dataType?: string;
  sortingLocally?: boolean;
  sortTieBreaker?: string;
  columnName: string;
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const { sortBy, setSortBy } = useTable(tableId);
  const { sortLocallyBy, setSortLocallyBy } = useTable(tableId);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const userSort = sortBy?.split(',')[0] ?? '';
  const userSortLocally = sortLocallyBy?.split(',')[0] ?? '';

  const sort = getSort(userSort, queryParam);
  const sortLocally = getSort(userSortLocally, queryParam);
  const isActiveAsc = userSort.includes(':asc') && userSort.includes(queryParam);
  const isActiveLocallyAsc =
    userSortLocally.includes(':asc') && userSortLocally.includes(queryParam);
  const isActiveDesc = userSort.includes(':desc') && userSort.includes(queryParam);
  const isActiveLocallyDesc =
    userSortLocally.includes(':desc') && userSortLocally.includes(queryParam);

  const handleLocalSort = () => {
    setSortLocallyBy(sortLocally, dataType);
  };

  const handleRemoteSort = () => {
    setSortBy(appendSortTiebreaker(sort, sortTieBreaker));
  };

  const sortAriaLabel = useMemo(() => {
    if (isActiveAsc || isActiveLocallyAsc) {
      return 'sortDescButtonAriaLabel';
    } else if (isActiveDesc || isActiveLocallyDesc) {
      return 'sortResetButtonAriaLabel';
    } else {
      return 'sortAscButtonAriaLabel';
    }
  }, [isActiveAsc, isActiveDesc, isActiveLocallyAsc, isActiveLocallyDesc]);

  return (
    <Box sx={{ marginLeft: theme.spacing(2) }}>
      <Button
        aria-label={translate(sortAriaLabel, {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
          column: columnName,
        })}
        key={`sort-button-${sort}`}
        data-testid={`sort_${tableId}_${queryParam}`}
        onClick={sortingLocally ? handleLocalSort : handleRemoteSort}
        sx={{
          padding: 0,
          borderWidth: 0,
          ...(align === 'right' ? { marginRight: '-18px' } : {}),
          '&:hover,&:focus,&:active': {
            backgroundColor: theme.palette.primary.light,
          },
        }}
      >
        <Box sx={styles.sortButtonIcons}>
          {sortingLocally
            ? sortingButtons(isActiveLocallyAsc, isActiveLocallyDesc, styles)
            : sortingButtons(isActiveAsc, isActiveDesc, styles)}
        </Box>
      </Button>
    </Box>
  );
};

export default SortButton;
