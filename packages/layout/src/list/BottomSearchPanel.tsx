import React, { useMemo } from 'react';
import { EastRounded } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Theme, alpha, useTheme } from '@mui/material/styles';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles, ListFilter, MousePointer2 } from 'lucide-react';

type BottomSearchPanelProps = {
  pageId: string;
  onSubmit?: () => void;
};

const getStyles = (theme: Theme) => {
  return {
    root: {
      maxWidth: '672px',
      marginX: 'auto',
      paddingX: { xs: theme.spacing(1), sm: theme.spacing(2) },
      paddingTop: { xs: theme.spacing(2), sm: theme.spacing(4) },
      textAlign: 'center',
    },
    topIcon: {
      width: '82px',
      height: '82px',
      border: '1px solid',
      borderColor: alpha(theme.palette.primary.main, 0.18),
      borderRadius: '50%',
      marginX: 'auto',
      marginBottom: theme.spacing(8),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.light, 0.25),
    },
    title: {
      marginBottom: theme.spacing(4),
      color: theme.palette.text.primary,
    },
    description: {
      marginX: 'auto',
      marginBottom: theme.spacing(10),
      color: theme.palette.text.secondary,
    },
    cardsStack: {
      marginBottom: theme.spacing(12),
      alignItems: 'stretch',
      justifyContent: 'center',
    },
    card: {
      flex: 1,
      minWidth: { xs: '100%', sm: '220px' },
      maxWidth: { xs: '100%', sm: '296px' },
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: theme.spacing(4),
      padding: theme.spacing(6.25),
      textAlign: 'left',
      boxShadow: theme.shadows[1],
    },
    cardIcon: {
      border: '1px solid',
      marginBottom: theme.spacing(4),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      marginBottom: theme.spacing(1),
      color: theme.palette.text.primary,
    },
    cardDescription: {
      color: theme.palette.text.secondary,
      display: 'block',
    },
    ctaContainer: {
      marginBottom: theme.spacing(4),
    },
    hintText: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      color: theme.palette.text.secondary,
      padding: theme.spacing(4),
    },
    hintIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '14px',
      height: '14px',
      color: theme.palette.primary.main,
    },
  };
};

const BottomSearchPanel = ({ pageId, onSubmit }: BottomSearchPanelProps) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const featureCards = useMemo(
    () => [
      {
        id: 'smart-presets',
        title: translate('smartPresetsTitle', {
          ns: COMMON,
          lng: selectedLanguage,
        }),
        description: translate('smartPresets', {
          ns: COMMON,
          lng: selectedLanguage,
        }),
        icon: <Sparkles size={'20px'} strokeWidth={2.25} />,
        iconBgColor: alpha(theme.palette.success.main, 0.1),
        iconColor: theme.palette.success.dark,
        iconBorderColor: alpha(theme.palette.success.main, 0.25),
        iconContainerSx: {
          width: '40px',
          height: '40px',
          borderRadius: '14px',
        },
      },
      {
        id: 'full-filtering',
        title: translate('fullFilteringTitle', {
          ns: COMMON,
          lng: selectedLanguage,
        }),
        description: translate('fullFiltering', {
          ns: COMMON,
          lng: selectedLanguage,
        }),
        icon: <ListFilter size={'20px'} strokeWidth={2.25} />,
        iconBgColor: alpha(theme.palette.secondary.main, 0.1),
        iconColor: theme.palette.secondary.dark,
        iconBorderColor: alpha(theme.palette.secondary.main, 0.2),
        iconContainerSx: {
          width: '40px',
          height: '40px',
          borderRadius: '14px',
        },
      },
    ],
    [selectedLanguage, theme, translate],
  );

  return (
    <Box id={`${pageId}-bottom-panel`} sx={styles.root}>
      <Box sx={styles.topIcon}>
        <Search size={'48px'} strokeWidth={1.9} />
      </Box>

      <Typography component="div" sx={styles.title} variant="h3">
        {translate('findAssetsTitle', {
          ns: COMMON,
          lng: selectedLanguage,
        })}
      </Typography>

      <Typography component="div" variant="h6" sx={styles.description}>
        {translate('findAssetsDescription', {
          ns: COMMON,
          lng: selectedLanguage,
        })}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={styles.cardsStack}>
        {featureCards.map((card) => (
          <Paper key={card.id} elevation={0} sx={styles.card}>
            <Box
              sx={{
                ...styles.cardIcon,
                ...card.iconContainerSx,
                borderColor: card.iconBorderColor,
                backgroundColor: card.iconBgColor,
                color: card.iconColor,
              }}
            >
              {card.icon}
            </Box>
            <Typography component="div" variant="h3" sx={styles.cardTitle}>
              {card.title}
            </Typography>
            <Typography component="div" variant="body1" sx={styles.cardDescription}>
              {card.description}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Box sx={styles.ctaContainer}>
        <GenericButton
          id={`${pageId}-apply-and-view-results-btn`}
          testId={`${pageId}-apply-and-view-results-btn`}
          onClick={onSubmit}
          label={translate('applyAndViewResults', {
            ns: COMMON,
            lng: selectedLanguage,
          })}
          ariaLabel={translate('applyAndViewResults', {
            ns: COMMON,
            lng: selectedLanguage,
          })}
          size="large"
          variant="contained"
          endIcon={<EastRounded />}
        />
      </Box>

      <Typography sx={styles.hintText} variant="body2" component="div">
        <Box component="span" sx={styles.hintIcon}>
          <MousePointer2 size={'14px'} strokeWidth={2.2} />
        </Box>
        {translate('selectFiltersBelow', {
          ns: COMMON,
          lng: selectedLanguage,
        })}
      </Typography>
    </Box>
  );
};

export default BottomSearchPanel;
