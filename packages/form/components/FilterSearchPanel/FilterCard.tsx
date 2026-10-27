import React, { useId } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { useTheme } from '@mui/material/styles';
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useFormAccordionContext } from '@pkg-form/groups/contexts/FormAccordionContext';
import {
  APPLY_SELECTED_FILTER_TO_LIST_SHORTCUT,
  CLEAR_SELECTED_FILTERS_SHORTCUT,
} from '@pkg-constants/keyboardShortcuts';

interface FilterCardProps {
  id: string;
  activeFilterCount?: number;
  isEditing?: boolean;
  onSearch?: () => void;
  onEditFilters?: () => void;
  onStartOver?: () => void;
}

const getStyles = (theme) => {
  return {
    card: (hasActiveFilters: boolean) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: { sm: '24px', md: '24px', lg: '32px' },
      width: '100%',
      background: '#FFFFFF',
      border: '1px solid #F3F4F6',
      boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.10), 0px 8px 10px -6px rgba(0,0,0,0.10)',
      transition: hasActiveFilters ? 'transform 0.2s ease-in-out' : 'unset',
      borderRadius: '24px',
      marginTop: '32px',
      gap: '24px',
      flexWrap: 'wrap',
      opacity: hasActiveFilters ? '0.8' : '1',
      ...(hasActiveFilters && {
        '&:hover': {
          borderColor: '#E5E7EB',
          boxShadow: '0px 25px 30px -5px rgba(0,0,0,0.12), 0px 10px 14px -6px rgba(0,0,0,0.12)',
          opacity: '1',
          transform: 'scale(1.015)',
        },
      }),
    }),
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flex: '1 1 auto',
      minWidth: 0,
    },
    iconBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '60px',
      height: '60px',
      flexShrink: 0,
      background: theme.palette?.primary.main,
      boxShadow: '0px 10px 15px -3px rgba(43,127,255,0.20), 0px 4px 6px -4px rgba(43,127,255,0.20)',
      borderRadius: '16px',
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    },
    title: {
      fontWeight: '700',
      fontSize: '24px',
      lineHeight: '30px',
      color: '#101828',
      whiteSpace: 'nowrap',
    },
    subtitle: {
      fontWeight: '600',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '-0.15px',
      color: '#364153',
    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
      flexWrap: 'wrap',
    },
    startOver: {
      display: 'flex',
      alignItems: 'center',
      background: 'transparent',
      border: 'none',
      '&:hover': {
        color: '#C10007',
      },
    },
    searchBtn: {
      padding: '16px 40px !important',
      width: '230px',
      height: '50px',
      textTransform: 'uppercase',
      boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.10), 0px 4px 6px -4px rgba(0,0,0,0.10)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap',
      '&:hover': {
        background: '#1249CC',
      },
      '&:focus': {
        background: '#1249CC',
      },
    },
    ghostBtn: {
      fontSize: 10,
      letterSpacing: '1.12px',
      lineHeight: '1.5',
      textTransform: 'uppercase',
      color: '#101828',
      border: '1.5px solid #D1D5DC',
      borderRadius: '16px',
      background: '#FFFFFF',
      padding: '14px 24px !important',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      whiteSpace: 'nowrap',
      backgroundColor: '#FBF9FA',
      '&:hover': {
        background: '#F6F3F4',
        borderColor: '#D1D5DB',
      },
    },
    activeChip: {
      fontWeight: 700,
      letterSpacing: '0.5px',
      borderRadius: '30px',
      backgroundColor: '#EFF6FF',
      border: '1px solid #BEDBFF',
      '& .MuiChip-label': {
        textTransform: 'uppercase',
        fontSize: '10px',
        color: '#193CB8',
        padding: '0 8px',
      },
    },
  };
};

const FilterCard = ({
  id,
  activeFilterCount = 0,
  onSearch,
  onStartOver,
  onEditFilters,
  isEditing,
}: FilterCardProps) => {
  const labelId = useId();
  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();
  const { areMostExpanded, toggleAll } = useFormAccordionContext();

  const theme = useTheme();
  const styles = getStyles(theme);

  const hasActiveFilters = activeFilterCount > 0;

  const cardTitle = translate(isEditing ? 'standardTitle' : 'minimizedTitle', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  const cardSubtitle = translate(isEditing ? 'standardSubtitle' : 'minimizedSubtitle', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  const filterToggleLabel = translate(areMostExpanded ? 'collapseAll' : 'expandAll', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  const searchBtnLabel = translate(hasActiveFilters ? 'updateFilters' : 'applyFilters', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  return (
    <Box component="section" aria-labelledby={labelId} sx={styles.card(hasActiveFilters)}>
      <Box sx={styles.leftSection}>
        <Box aria-hidden="true" sx={styles.iconBox}>
          <Filter size={28} color="#FFFFFF" />
        </Box>

        <Box sx={styles.headerContainer}>
          <Box sx={styles.titleRow}>
            <Typography id={labelId} variant="h2" component="h2" sx={styles.title}>
              {cardTitle}
            </Typography>
            {hasActiveFilters && (
              <Chip
                label={translate('activeFilters', {
                  ns: COMMON,
                  lng: selectedLanguage,
                  count: activeFilterCount,
                })}
                size="small"
                sx={styles.activeChip}
              />
            )}
          </Box>
          <Typography sx={styles.subtitle}>{cardSubtitle}</Typography>
        </Box>
      </Box>

      <Box sx={styles.rightSection}>
        {hasActiveFilters && (
          <GenericButton
            onClick={onStartOver}
            startIcon={<RotateCcw size={14} aria-hidden="true" />}
            variant="text"
            color="tertiary"
            styles={styles.startOver}
            id={`${globalThis.LIST}-filters-clear-btn`}
            label={translate('resetFilters', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
            testId={`${id}-clear-btn`}
            ariaKeyboardShortcuts={CLEAR_SELECTED_FILTERS_SHORTCUT}
          />
        )}
        {isEditing ? (
          <GenericButton
            onClick={toggleAll}
            startIcon={<RotateCcw size={14} aria-hidden="true" />}
            variant="text"
            color="tertiary"
            id={`${globalThis.LIST}-filters-toggle-all-btn`}
            testId={`${globalThis.LIST}-filters-toggle-all-btn`}
            label={filterToggleLabel}
          />
        ) : (
          <GenericButton
            onClick={onEditFilters}
            startIcon={<SlidersHorizontal size={14} />}
            styles={styles.ghostBtn}
            id={`${globalThis.LIST}-filters-edit-btn`}
            testId={`${id}-filters-edit-btn`}
            label={translate('editFilters', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
          />
        )}
        <GenericButton
          variant="contained"
          onClick={onSearch}
          startIcon={<Search size={16} />}
          styles={styles.searchBtn}
          id={`${globalThis.LIST}-filters-apply-btn`}
          testId={`${id}-apply-btn`}
          label={searchBtnLabel}
          ariaKeyboardShortcuts={APPLY_SELECTED_FILTER_TO_LIST_SHORTCUT}
        />
      </Box>
    </Box>
  );
};

export default FilterCard;
