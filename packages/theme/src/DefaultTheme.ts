// @ts-nocheck
import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { colorSchemes } from './color-schemes';
import { deepmerge } from '@mui/utils';
import { PAGE_LAYOUT } from './pageLayout';

const getTheme = (config, palette = {}, mode = 'light') => {
  const {
    iconSize,
    iconFontSize,
    paddingVertical = 6,
    paddingHorizontal = 4,
    menuItemHeight,
  } = config;

  const borderRadius = '16px';

  const boxShadow =
    '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)';

  const baseTheme = createTheme({
    spacing: 4,
    breakpoints: {
      values: {
        xs: 0,
        sm: 660,
        md: 1024,
        lg: 1440,
        xl: 1920,
      },
    },
    palette:
      mode === 'dark'
        ? colorSchemes?.dark.palette
        : deepmerge(colorSchemes?.light.palette, palette),
    typography: {
      fontFamily: 'Lato',
      fontSize: 16,
      fontWeight: 400,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,

      display1: {
        fontFamily: 'Lato !important',
        fontSize: '2.875rem', // 46px
        lineHeight: '3.5rem', // 56px
        fontWeight: 400,
      },
      display2: {
        fontFamily: 'Lato !important',
        fontSize: '2.5rem', // 40px
        lineHeight: '3rem', // 48px
        fontWeight: 400,
      },
      display3: {
        fontFamily: 'Lato !important',
        fontSize: '2.25rem', // 36px
        lineHeight: '2.75rem', // 44px
        fontWeight: 400,
      },

      h1: {
        fontFamily: 'Lato !important',
        fontSize: '2rem', // 32px
        lineHeight: '2.5rem', // 40px
        fontWeight: 700,
      },
      h2: {
        fontFamily: 'Lato !important',
        fontSize: '1.8125rem', // 29px
        lineHeight: '2.25rem', // 36px
        fontWeight: 400,
      },
      h3: {
        fontFamily: 'Lato !important',
        fontSize: '1.5625rem', // 25px
        lineHeight: '2rem', // 32px
        fontWeight: 400,
      },
      h4: {
        fontFamily: 'Lato !important',
        fontSize: '1.4375rem', // 23px
        lineHeight: '2rem', // 32px
        fontWeight: 400,
      },
      h5: {
        fontFamily: 'Lato !important',
        fontSize: '1.25rem', // 20px
        lineHeight: '1.75rem', // 28px
        fontWeight: 400,
      },
      h6: {
        fontFamily: 'Lato !important',
        fontSize: '1.125rem', // 18px
        lineHeight: '1.75rem', // 28px
        fontWeight: 400,
      },

      body1: {
        fontFamily: 'Lato !important',
        fontSize: '1rem', // 16px
        lineHeight: '1.5rem', // 24px
        fontWeight: 400,
      },
      body2: {
        fontFamily: 'Lato !important',
        fontSize: '0.875rem', // 14px
        lineHeight: '1.5rem', // 24px
        fontWeight: 400,
      },

      caption: {
        fontFamily: 'Lato !important',
        fontSize: '0.8125rem', // 13px
        lineHeight: '1.25rem', // 20px
        fontWeight: 400,
      },

      button: {
        lineHeight: '16px',
        letterSpacing: '1.2px',
        fontSize: '0.8rem',
      },
    },
  });

  return createTheme(baseTheme, {
    fieldDistance: '15px',
    topbarHeight: '64px',
    schemes: colorSchemes,
    pageLayout: PAGE_LAYOUT,
    components: {
      // Svg Icon
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            height: iconSize,
            width: iconSize,
            fontSize: `${baseTheme.spacing(iconFontSize)}rem`,
            color: baseTheme.palette.primary.dark,
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&.MuiAccordion': {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '30px',
              margin: 0,
              padding: '12px 16px',
              borderRadius: '9px',
              boxShadow: 'rgba(0, 0, 0, 0.12) 0px 0px 16px;',
              backgroundColor: baseTheme.palette.common.white,
            },
            '&.MuiAccordion--expanded': {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '30px',
              margin: 0,
              padding: '12px 16px',
              borderRadius: '9px',
              borderBottonLeftRadius: 0,
              borderBottonRightRadius: 0,
              boxShadow: 'rgba(0, 0, 0, 0.12) 0px 0px 16px;',
              backgroundColor: baseTheme.palette.primary.light,
            },
            '&.MuiPickersDay-root': {
              '&:focus': {
                backgroundColor: 'transparent',
              },
            },
          },
        },
      },

      MuiButton: {
        variants: [
          {
            props: { variant: 'text', color: 'tertiary' },
            style: {
              color: '#4A5565',
              border: 'none',
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1.6px',
              '&.Mui-disabled': {
                pointerEvents: 'none',
              },
              '&:hover,&:focus,&:active': {
                color: baseTheme.palette.primary.main,
                background: 'transparent !important',
              },
              '& .MuiTouchRipple-ripple': {
                backgroundColor: 'transparent !important',
                opacity: '0 !important',
              },
            },
          },
        ],
        styleOverrides: {
          root: {
            boxShadow: 'none',
            minWidth: 0,
            padding: `${baseTheme.spacing(paddingVertical)} ${baseTheme.spacing(paddingHorizontal)} !important`,
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 16,
          },
          containedPrimary: {
            color: baseTheme.palette?.common.white,
            backgroundColor: baseTheme.palette?.primary.main,
            borderColor: baseTheme.palette.primary.main,
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette?.common.white,
            },

            '&.Mui-disabled': {
              pointerEvents: 'none',
              backgroundColor: baseTheme.palette.button.light,
              borderColor: baseTheme.palette.button.light,
            },
          },
          containedSecondary: {
            color: baseTheme.palette?.common.white,
            backgroundColor: baseTheme.palette?.secondary.main,
            borderColor: baseTheme.palette.secondary.main,
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette?.common.white,
            },
            '&.Mui-disabled': {
              pointerEvents: 'none',
              backgroundColor: baseTheme.palette.button.light,
              borderColor: baseTheme.palette.button.light,
            },
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.8),
            },
            '&:focus': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.7),
            },
          },
          outlinedPrimary: {
            color: baseTheme.palette?.primary.main,
            backgroundColor: baseTheme.palette?.common.white,
            borderColor: baseTheme.palette.primary.main,
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette?.primary.main,
            },
            '&.Mui-disabled': {
              borderColor: baseTheme.palette.button.light,
              backgroundColor: baseTheme.palette?.common.white,
            },
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.1),
            },
            '&:focus': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.08),
            },
          },
          outlinedSecondary: {
            color: baseTheme.palette?.secondary.main,
            backgroundColor: baseTheme.palette?.common.white,
            borderColor: baseTheme.palette.secondary.main,
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette?.secondary.main,
            },
            '&.Mui-disabled': {
              borderColor: baseTheme.palette.button.light,
              backgroundColor: baseTheme.palette?.common.white,
            },
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.1),
            },
            '&:focus': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.08),
            },
          },
          textPrimary: {
            borderRadius: '9px',
            color: baseTheme.palette?.primary.main,
            border: 'none',
            '&.Mui-disabled': {
              pointerEvents: 'none',
              color: baseTheme.palette?.secondary.light,
            },
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.1),
            },
            '&:focus': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.08),
            },
          },
          textSecondary: {
            borderRadius: '9px',
            color: baseTheme.palette?.secondary.main,
            border: 'none',
            '&.Mui-disabled': {
              pointerEvents: 'none',
              color: baseTheme.palette?.secondary.light,
            },
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.1),
            },
            '&:focus': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.08),
            },
          },
          sizeLarge: {
            // height: baseTheme.spacing(4),
            padding: `${baseTheme.spacing(4)} ${baseTheme.spacing(7)} !important`,
            fontSize: baseTheme.typography.button.fontSize,
          },
          sizeMedium: {
            // height: baseTheme.spacing(4),
            padding: `${baseTheme.spacing(3)} ${baseTheme.spacing(6)}`,
            fontSize: baseTheme.typography.button.fontSize,
          },
          sizeSmall: {
            padding: `${baseTheme.spacing(1)} ${baseTheme.spacing(3)}`,
            fontSize: baseTheme.typography.caption.fontSize,
            '& .MuiButton-label': {
              '& .MuiSvgIcon-root': {
                fontSize: baseTheme.spacing(1),
              },
            },
          },
          iconSizeSmall: {
            '& .MuiSvgIcon-root': {
              fontSize: baseTheme.spacing(1),
            },
          },
          iconSizeMedium: {
            '& .MuiSvgIcon-root': {
              fontSize: baseTheme.spacing(3),
            },
          },
          iconSizeLarge: {
            '& .MuiSvgIcon-root': {
              fontSize: baseTheme.spacing(3),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            cursor: 'pointer',
            fontSize: baseTheme.spacing(2 / 5),
            border: `0.5px solid transparent`,
            '&:hover,&:focus,&:active': {
              color: baseTheme.palette.primary.main,
              backgroundColor: baseTheme.palette.primary.light,
              border: `0.5px solid ${alpha(baseTheme.palette?.primary.main, 0.6)}`,
            },
            '&.Mui-focusVisible': {
              color: baseTheme.palette.primary.main,
              border: `0.5px solid ${alpha(baseTheme.palette?.primary.main, 0.6)}`,
            },
            '&.Mui-disabled > svg': {
              color: baseTheme.palette.divider,
              cursor: 'none',
            },
          },
        },
      },

      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: `0 5px 6px ${alpha(baseTheme.palette?.primary.dark, 0.38)}`,
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette?.common.white,
            },
          },
          primary: {
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.77),
            },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.77),
            },
          },
          secondary: {
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.77),
            },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.77),
            },
          },
        },
      },
      MuiSpeedDial: {
        styleOverrides: {
          root: {
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette?.common.white,
            },
          },
          primary: {
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.77),
            },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.77),
            },
          },
          secondary: {
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.77),
            },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.77),
            },
          },
        },
      },
      MuiSpeedDialAction: {
        styleOverrides: {
          root: {
            bgColor: alpha(baseTheme.palette?.primary.main, 0.77),
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette?.common.white,
            },
          },
          primary: {
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.77),
            },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(baseTheme.palette?.primary.main, 0.77),
            },
          },
          secondary: {
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.77),
            },
            '&.Mui-focusVisible': {
              backgroundColor: alpha(baseTheme.palette?.secondary.main, 0.77),
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: baseTheme.palette?.widgetBackground,
            boxShadow:
              '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontFamily: baseTheme.typography.fontFamily,
            color: baseTheme.palette.common.black,

            input: {
              fontSize: baseTheme.typography.body1.fontSize,
              paddingTop: 0,
              paddingBottom: 0,
              paddingRight: baseTheme.spacing(1),
              paddingLeft: baseTheme.spacing(1),
              minHeight: '24px',
            },
            textArea: {
              fontSize: baseTheme.typography.body1.fontSize,
              paddingTop: 0,
              paddingBottom: 0,
              paddingRight: baseTheme.spacing(1),
              paddingLeft: baseTheme.spacing(1),
              // minHeight: '24px',
            },
            '&.global-search-input': {
              backgroundColor: alpha(baseTheme.palette.primary.light, 0.2),
              height: '35px',
              borderRadius: '16px',
            },
            '&.MuiOutlinedInput-root': {
              backgroundColor: baseTheme.palette?.widgetBackground,
              padding: baseTheme.spacing(paddingVertical),
              paddingLeft: baseTheme.spacing(paddingHorizontal),
              '&.Mui-disabled': {
                color: baseTheme.palette.grey[600],
              },
            },
            '& .MuiPickersOutlinedInput-root': {
              backgroundColor: baseTheme.palette?.widgetBackground,
              padding: baseTheme.spacing(paddingVertical),
              paddingLeft: baseTheme.spacing(paddingHorizontal),
              '&.Mui-disabled': {
                color: baseTheme.palette.grey[600],
              },
            },
            '& .MuiInputAdornment-positionStart': {
              marginRight: baseTheme.spacing(1),
            },
          },
          adornedStart: {
            paddingLeft: baseTheme.spacing(1),
          },
          adornedEnd: {
            paddingRight: baseTheme.spacing(1),
          },
          multiline: {
            height: 'auto',
            color: baseTheme.palette.common.white,
          },
        },
      },

      MuiCollapse: {
        styleOverrides: {
          root: {
            // '&.MuiAccordion--expanded': {
            //   padding: `${baseTheme.spacing(paddingVertical)} ${baseTheme.spacing(paddingHorizontal)}`,
            //   backgroundColor: baseTheme.palette.common.white,
            //   border: `1px solid ${baseTheme.palette.primary.light}`,
            //   borderRadius: baseTheme.spacing(borderRadius),
            //   borderTopLeftRadius: 0,
            //   borderTopRightRadius: 0,
            //   boxShadow: 'rgba(0, 0, 0, 0.12) 0px 0px 16px;',
            // },
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: 'lg',
            '& .heroBanner .MuiSvgIcon-root': {
              color: baseTheme.palette.primary.main,
            },
            '& .MuiTypography-h4': {
              color: baseTheme.palette.secondary.light,
            },
          },
        },
      },
      MuiPopover: {
        defaultProps: {
          borderRadius: baseTheme.spacing(borderRadius),
          boxShadow: boxShadow,
          border: `1px solid ${baseTheme.palette.divider}`,
        },
        styleOverrides: {
          root: {
            '& .MuiPopover-paper': {
              borderRadius: baseTheme.spacing(borderRadius),
              boxShadow: boxShadow,
            },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            paddingTop: 0,
            paddingBottom: 0,
            '& .MuiListItem-button': {
              '&:hover,&:focus,&:active': {
                backgroundColor: baseTheme.palette.primary.light,
              },
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            padding: `${baseTheme.spacing(paddingVertical)} ${baseTheme.spacing(paddingVertical)}`,
            fontSize: baseTheme.typography.body1.fontSize,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            '> svg': {
              color: baseTheme.palette.primary.main,
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            padding: `${baseTheme.spacing(paddingVertical)} ${baseTheme.spacing(paddingVertical)}`,
            fontSize: baseTheme.typography.body1.fontSize,
            color: baseTheme.palette.primary.dark,
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '.MuiOutlinedInput-root .MuiAutocomplete-input': {
              padding: 0,
            },
          },
        },
      },
      // Stepper
      MuiStep: {
        styleOverrides: {
          horizontal: {
            paddingTop: baseTheme.spacing(1),
            paddingBottom: baseTheme.spacing(1),
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.common.black, 0.04),
            },
          },
          '&.Mui-completed': {
            '&:hover,&:focus,&:active': {
              backgroundColor: alpha(baseTheme.palette?.common.black, 0.04),
            },
          },
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            width: baseTheme.spacing(3.5),
            height: baseTheme.spacing(3.5),
            borderRadius: '100%',
            border: `2px solid ${baseTheme.palette?.grey[400]}`,
            '& circle': {
              fill: baseTheme.palette?.common.white,
            },
            '& text': {
              transform: 'translateY(2px)',
              fill: baseTheme.palette?.text.disabled,
              fontSize: baseTheme.typography.body1.fontSize,
            },
            '&.MuiStepIcon-active': {
              border: `2px solid ${baseTheme.palette?.success.main}`,
              '& text': {
                transform: 'translateY(2px)',
                fill: baseTheme.palette?.success.main,
              },
            },
            '&.MuiStepIcon-completed': {
              width: baseTheme.spacing(3.5),
              height: baseTheme.spacing(3.5),
              border: 'none',
              color: baseTheme.palette?.success.main,
            },
            '&.MuiStepIcon-error': {
              width: baseTheme.spacing(3.5),
              height: baseTheme.spacing(3.5),
              border: 'none',
              color: baseTheme.palette?.error.main,
            },
          },
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          label: {
            color: baseTheme.palette?.text.secondary,
            '&.MuiStepLabel-alternativeLabel': {
              marginTop: baseTheme.spacing(1),
            },
            '&.MuiStepLabel-active': {
              color: baseTheme.palette?.text.secondary,
              fontSize: baseTheme.typography.body1.fontSize,
              fontWeight: 700,
            },
            '&.MuiStepLabel-completed': {
              color: baseTheme.palette?.text.secondary,
            },
            '&.MuiStepLabel-error': {
              color: baseTheme.palette?.error.main,
            },
          },
        },
      },
      MuiStepConnector: {
        styleOverrides: {
          alternativeLabel: {
            top: baseTheme.spacing(3),
            left: `calc(-50% + 12px)`,
            right: `calc(50% + 12px)`,
          },
          lineHorizontal: {
            borderTopWidth: 2,
            borderTopColor: alpha(baseTheme.palette?.common.black, 0.12),
          },
          vertical: {
            padding: 0,
            marginLeft: 11,
          },
          lineVertical: {
            borderLeftWidth: 2,
            borderLeftColor: alpha(baseTheme.palette?.common.black, 0.12),
          },
        },
      },
      // Card
      MuiCard: {
        backgroundColor: alpha(baseTheme.palette?.common.black, 0.4),
        styleOverrides: {
          root: {
            width: '100%',
            height: '100%',
            minHeight: '40px',
            cursor: 'pointer',
            borderRadius: baseTheme.spacing(borderRadius),
            boxShadow,
            overflow: 'hidden',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            display: 'flex',
            alignItems: 'center',
            minHeight: 30,
            margin: 0,
            padding: `${baseTheme.spacing(2)} ${baseTheme.spacing(4)}`,
            borderBottom: `1px solid ${baseTheme.palette.divider}`,
            '&:hover': {
              cursor: 'default',
            },
          },
          title: {
            fontSize: baseTheme.typography.subtitle1.fontSize,
            color: baseTheme.palette.primary.dark,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(paddingHorizontal),
            margin: 0,
            minHeight: 40,
            overflow: 'auto',
            '&:hover': {
              cursor: 'default',
            },
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(paddingHorizontal),
            margin: 0,
            minHeight: 30,
            overflow: 'auto',
            '&:hover': {
              cursor: 'default',
            },
          },
        },
      },
      MuiInputLabel: {
        defaultProps: {
          shrink: true,
        },
        styleOverrides: {
          root: {
            position: 'relative',
            textTransform: 'uppercase',
            fontFamily: `${baseTheme.typography.fontFamily} !important`,
            fontSize: `${baseTheme.typography.body1.fontSize} !important`,
            fontWeight: `${baseTheme.typography.body1.fontWeight} !important`,
            lineHeight: `${baseTheme.typography.body1.lineHeight} !important`,
            color: `${baseTheme.palette.primary.dark} !important`,
            top: '13px',
            left: '-12px',
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: baseTheme.palette.button.main,
            '& + .MuiSwitch-track': {
              backgroundColor: baseTheme.palette?.grey[600],
            },
          },
          track: {
            width: baseTheme.spacing(4),
          },
          colorPrimary: {
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                backgroundColor: baseTheme.palette.primary.light,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.spacing(2.5),
            margin: '3px',
            tabIndex: 0,
            height: 'auto',
            minHeight: '32px',
          },
          label: {
            color: alpha(baseTheme.palette.primary.dark, 0.87),
            fontSize: baseTheme.typography.body2.fontSize,
            textTransform: 'capitalize',
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: {
            width: '100%',
            minHeight: baseTheme.spacing(menuItemHeight),
            borderBottom: `0.5px solid ${baseTheme.palette.divider}`,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(paddingVertical, paddingHorizontal),
            color: baseTheme.palette.primary.dark,

            '& .MuiButtonBase-root': {
              padding: 0,
              fontSize: baseTheme.typography.body2.fontSize,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: baseTheme.palette?.primary.light,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            display: 'flex',
            justifyContent: 'space-between',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.spacing(borderRadius),
            boxShadow: `0 0px 16px ${alpha(baseTheme.palette?.common.black, 0.12)}`,
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            margin: '0 auto',
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              '&.Mui-selected': {
                backgroundColor: baseTheme.palette?.primary.light,
              },
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          head: {
            '& .MuiTableCell-root': {
              '& .MuiTypography-subtitle1': {
                fontWeight: 700,
              },
            },
          },
          root: {
            '&:hover,&:focus,&:active': {
              backgroundColor: baseTheme.palette?.primary.light,
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            position: 'sticky',
            top: 0,
            width: '100%',
            backgroundColor: baseTheme.palette.common.white,
            zIndex: 1,
            '& .MuiTableRow-root': {
              backgroundColor: baseTheme.palette.common.white,
              '&:hover': {
                backgroundColor: baseTheme.palette.common.white,
              },
            },
            '&:hover': {
              backgroundColor: baseTheme.palette.common.white,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(paddingVertical),
            borderTop: `0.2px solid ${baseTheme.palette?.divider}`,
            borderBottom: `0.2px solid ${baseTheme.palette?.divider}`,
          },
          head: {
            fontSize: baseTheme.typography.body1.fontSize,
            borderTop: `0px`,
            '&:hover': {
              backgroundColor: baseTheme.palette.common.white,
            },
          },
          paddingCheckbox: {
            padding: baseTheme.spacing(paddingVertical),
          },
          alignRight: {
            paddingRight: baseTheme.spacing(4),
          },
        },
      },
      MuiTableFooter: {
        styleOverrides: {
          root: {
            backgroundColor: baseTheme.palette.common.white,
            position: 'sticky',
            zIndex: 1,
            display: 'table',
            width: '100%',
            borderSpacing: '0px',
            '&:hover': {
              backgroundColor: baseTheme.palette.common.white,
            },
            '& .MuiTableRow-root': {
              backgroundColor: baseTheme.palette.common.white,
              '& .MuiTableCell-root': {
                border: 'none',
                padding: 0,
              },
              '&:hover': {
                backgroundColor: baseTheme.palette.common.white,
              },
            },
            '& .MuiToolbar-root': {
              borderRadius: 0,
              boxShadow: 'none',
              '& .MuiTypography-root': {
                color: baseTheme.palette?.text.secondary,
                fontWeight: baseTheme.typography.fontWeightRegular,
              },
              '&:hover': {
                backgroundColor: baseTheme.palette.common.white,
              },
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: baseTheme.palette.common.white,
            },
          },
          toolbar: {
            justifyContent: 'flex-start',
            alignItems: 'center',
          },
          spacer: {
            flex: 'none',
          },
        },
      },
      MuiOutlinedInput: {
        defaultProps: {
          notched: false,
        },
        styleOverrides: {
          root: {
            color: baseTheme.palette.grey[600],
          },
        },
      },

      MuiFormControl: {
        defaultProps: {
          width: '257px',
        },
      },

      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: baseTheme.palette.primary.dark,
            textTransform: 'uppercase',
            fontSize: baseTheme.typography.caption.fontSize,
            fontWeight: 400,
            lineHeight: '1.4375em',
            letterSpacing: '0.00938em',

            '&.MuiInputLabel-root': {
              '&.Mui-disabled': {
                color: baseTheme.palette.grey[600],
              },
            },

            '.MuiFormLabel-asterisk': {
              display: 'none',
            },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: {
            whiteSpace: 'pre-line',
            paddingLeft: baseTheme.spacing(0),
            '&.Mui-focused': {
              color: baseTheme.palette?.primary.main,
              '&.Mui-error': {
                color: baseTheme.palette?.error.main,
              },
            },
          },
          contained: {
            marginLeft: 0,
            marginRight: 0,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            zIndex: 1075,
            backgroundColor: baseTheme.palette.common.white,
            boxShadow: `none`,
            '& .MuiToolbar-root': {
              borderRadius: 0,
              boxShadow: 'none',
            },
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette.primary.dark,
            },
          },
        },
      },

      // Snackbar
      MuiSnackbar: {
        styleOverrides: {
          root: {
            width: '100%',
            maxWidth: 560,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: ({ ownerState, theme }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: `${baseTheme.spacing(paddingVertical)} ${baseTheme.spacing(paddingHorizontal)}`,
            boxShadow: `0 3px 8px ${alpha(baseTheme.palette?.common.black, 0.16)}`,
            backgroundColor:
              ownerState.severity === 'warning' ? '#ffcc00' : baseTheme.palette.common.white,
          }),
          message: {
            padding: 0,
            width: '100%',
            color: baseTheme.palette?.common.black,
          },
          action: {},
        },
      },

      //Dialog
      MuiDialog: {
        styleOverrides: {
          paper: {
            boxShadow: `0 0px 16px ${alpha(baseTheme.palette?.common.black, 0.12)}`,
            '&.MuiDialog-table': {
              paddingBottom: 0,
              '& .MuiTableContainer-root': {
                borderRadius: 0,
                '& .MuiToolbar-root': {
                  borderRadius: 0,
                  paddingRight: baseTheme.spacing(1),
                },
              },
            },
          },
          // paperWidthXs: {
          //   maxWidth: baseTheme.spacing(120),
          // },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${baseTheme.spacing(paddingVertical)} ${baseTheme.spacing(paddingHorizontal)}`,
            color: baseTheme.palette.primary.dark,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(paddingHorizontal),
          },
          dividers: {
            border: `1px solid ${baseTheme.palette.divider}`,
          },
        },
      },
      MuiDialogContentText: {
        styleOverrides: {
          root: {
            padding: `${baseTheme.spacing(paddingVertical)} ${baseTheme.spacing(paddingHorizontal)}`,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(paddingHorizontal),
          },
        },
      },

      // Checkbox
      MuiCheckbox: {
        styleOverrides: {
          root: {
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette.primary.main,
            },
          },
        },
      },

      // Backdrop
      MuiBackdrop: {
        styleOverrides: {
          root: {
            '&[style*="opacity: 0"]': {
              pointerEvents: 'none',
            },
          },
        },
      },
      //ToggleButton
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            border: 'none',
            background: '#f6f3f4',
            padding: '4px',
            borderRadius: '18px !important',
          },
          grouped: {
            '&:not(:first-of-type)': {
              borderLeft: 'none',
              marginLeft: 0,
            },
            '&:not(:last-of-type)': {
              borderRight: 'none',
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            height: '35px',
            padding: '0 16px',
            border: 'none',
            borderRadius: '18px !important',
            backgroundColor: 'transparent',
            color: '#6A7282',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            transition: 'background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#364153',
            },
            '&.Mui-selected': {
              backgroundColor: baseTheme.palette.common.white,
              color: '#1447E6',
              boxShadow:
                '0px 0px 0px 1px #E5E7EB, 0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)',
              '&:hover': {
                backgroundColor: baseTheme.palette.common.white,
              },
            },
            '&.Mui-disabled': {
              color: baseTheme.palette.text.disabled,
              border: 'none',
            },
          },
        },
      },
      //MuiAccordion
      MuiAccordion: {
        styleOverrides: {
          root: {
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #F3F4F6',
            borderRadius: '16px !important',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
            '&:before': { display: 'none' },
            '&.Mui-expanded': {
              border: '1.5px solid #BFDBFE',
              boxShadow:
                '0px 4px 6px -1px rgba(21,93,252,0.08), 0px 2px 4px -2px rgba(21,93,252,0.06)',
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: '66px',
            padding: '0 20px',
            '&.Mui-expanded': { minHeight: '66px' },
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: '0 20px 20px',
          },
        },
      },
    },
  });
};

export default getTheme;
