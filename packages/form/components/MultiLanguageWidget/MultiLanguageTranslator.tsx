import React, { ReactElement, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Tabs,
  Tab,
  FormLabel,
  FormControl,
  Box,
  InputBase,
  Theme,
  FormHelperText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getAccessibilityErrorProps, getWidgetSize } from '@pkg-form/validations/utils/widgetUtils';
import { SxProps } from '@mui/system';

export interface MultiLanguageTranslatorProps {
  id: string;
  error?: React.ReactNode;
  label?: string;
  readOnly?: boolean;
  extendedRequired?: boolean;
  inputProps?: any;
  extendedInputProps?: any;
  descriptionValues: Array<{
    code: string;
    extendedDescription?: string;
    description: string;
    label: string;
  }>;
  languageMenuOptions?: Array<{
    id: string;
    code: string;
    label: string;
    selected: boolean;
  }>;
  onDescriptionValuesChange: any;
  onLanguageSelectionChange?: any;
  required?: boolean | undefined;
  widthSize?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showExtendedDescription?: boolean;
  onBlur?: () => void;
  styledFieldLabel?: (overrideLabel?: string) => React.ReactNode;
}

const getStyles = (theme: Theme) => {
  return {
    counter: { alignSelf: 'flex-end', fontSize: theme.typography.caption, marginLeft: 2 },
    formControl: { padding: '12px 12px 6px', backgroundColor: '#eaeaea' },
    formControlExt: { padding: '0px 12px 6px', backgroundColor: '#eaeaea' },
    container: {
      width: '257px',
      maxWidth: '400px',
    },
    mainLabel: {
      textTransform: 'uppercase',
      fontSize: theme.typography.caption.fontSize,
      marginLeft: '4px',
    },
    label: {
      fontSize: theme.typography.caption,
      color: theme.palette.primary.dark,
      marginLeft: '4px',
    },
    card: {
      boxShadow: 'none',
      marginTop: theme.spacing(0.5),
      borderRadius: '4px',
      border: `1px solid #e5dede`,
      '&:hover': {
        border: `1px solid ${theme.palette.text.secondary}`,
      },
    },
    innerCard: {
      boxShadow: 'none',
      borderTop: `1px solid #e5dede`,
      height: '100%',
    },
    autosizeTextarea: {
      resize: 'vertical',
      minWidth: '100%',
    },
    cardFocused: {
      border: `2px solid ${theme.palette?.primary.main}`,
    },
    cardError: {
      border: `1px solid ${theme.palette?.error.main}`,
    },
    inputBase: {
      minWidth: 24,
      color: 'black',
      alignItems: 'flex-start',
      border: `1px solid lightGray`,
      borderRadius: 1,
      backgroundColor: theme.palette.common.white,
    },
    cardContentTabs: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0),
      justifyContent: 'space-between',
      flexDirection: 'column',
      borderBottom: '1px solid #D2D2D2',
      paddingBottom: '0 !important',
      '& .MuiIconButton-root': {
        color: theme.palette.common.black,
      },
      '& .MuiTabs-root': {
        backgroundColor: 'transparent',
      },
      '& .MuiTab-root': {
        minWidth: 0,
        '@media (min-width: 0px)': {
          minWidth: 0,
        },
      },
    },
    cardContentTabsError: {
      borderBottom: `1px solid ${theme.palette?.error.main}`,
    },
    indicatorError: {
      backgroundColor: theme.palette?.error.main,
    },
  };
};

//TODO: maybe move this component outside in the future if requested
const LimitCounter = ({ stylesObj, currentLength, maxLength }: Record<any, any>): ReactElement => (
  <Box sx={stylesObj}>
    {currentLength ?? 0} / {maxLength}
  </Box>
);

const MultiLanguageTranslator: React.FC<MultiLanguageTranslatorProps> = ({
  id,
  error,
  label: mainLabel,
  descriptionValues,
  onDescriptionValuesChange,
  inputProps,
  extendedInputProps,
  languageMenuOptions = [],
  readOnly = false,
  required,
  extendedRequired = false,
  widthSize,
  fullWidth,
  showExtendedDescription = true,
  onBlur,
  styledFieldLabel,
}) => {
  const styles = getStyles(useTheme());
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isFocused] = useState(false);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const hasError = Boolean(error);

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, hasError);
  }, [hasError, id]);

  const sortedLanguageMenuOptions = useMemo(() => {
    return [
      ...languageMenuOptions.filter((option) => option.code === selectedLanguage),
      ...languageMenuOptions
        .filter((option) => option.code !== selectedLanguage)
        .sort((a, b) => a.label.localeCompare(b.label, selectedLanguage)),
    ];
  }, [selectedLanguage, languageMenuOptions]);

  const memoizedWidgetSize = useMemo(() => {
    return getWidgetSize(widthSize, fullWidth);
  }, [widthSize, fullWidth]);

  const translatableNameLabel = translate('namesLabel', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  const translatableExtDescLabel = translate('descriptionsLabel', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  return (
    <FormControl
      title={showExtendedDescription ? translatableNameLabel?.toUpperCase() : mainLabel}
      sx={{ marginY: 4, ...memoizedWidgetSize }}
      error={hasError}
    >
      {mainLabel && !showExtendedDescription && (
        <FormLabel sx={styles.mainLabel as SxProps} id={`${id}-input-label`}>
          {styledFieldLabel?.()}
        </FormLabel>
      )}
      <Card
        elevation={0}
        sx={{
          ...styles.card,
          ...(error && styles.cardError),
          ...(isFocused && !error && styles.cardFocused),
        }}
      >
        <CardContent sx={{ ...styles.cardContentTabs, ...(error && styles.cardContentTabsError) }}>
          <Tabs
            onChange={(_, tabIndex) => setActiveTabIndex(tabIndex)}
            value={activeTabIndex}
            textColor="primary"
            indicatorColor="secondary"
            sx={{ indicator: hasError ? styles.indicatorError : '' }}
            role="tablist"
            aria-labelledby={`${id}-input-label`}
            tabIndex={0}
          >
            {sortedLanguageMenuOptions.map(({ code, label }) => (
              <Tab
                key={code}
                label={label}
                id={`${code}-tab-title`}
                role="tab"
                aria-label={translate('languageTab', {
                  ns: COMMON,
                  label,
                  lng: selectedLanguage,
                })}
                tabIndex={0}
              />
            ))}
          </Tabs>
          {sortedLanguageMenuOptions.map(({ code, id: itemId }, index) => {
            const tabIsActive = index === activeTabIndex;
            const value = (descriptionValues || '').find(
              (v): boolean => v.code === code,
            )?.description;
            const secondaryValue = (descriptionValues || '').find(
              (v): boolean => v.code === code,
            )?.extendedDescription;

            return (
              <Box
                key={index}
                role="tabpanel"
                hidden={!tabIsActive}
                sx={{ width: '100%' }}
                data-testid={`scrollable-auto-tabpanel-${index}`}
                id={`scrollable-auto-tabpanel-${id}-${index}`}
              >
                <FormControl fullWidth sx={styles.formControl}>
                  {showExtendedDescription && (
                    <FormLabel sx={styles.label as SxProps} id={`${id}-code-label`}>
                      {styledFieldLabel?.(translatableNameLabel)}
                    </FormLabel>
                  )}
                  <InputBase
                    sx={styles.inputBase}
                    tabIndex={-1}
                    slotProps={{
                      input: {
                        ...inputProps,
                        'aria-label': translatableNameLabel,
                        'aria-required': required || false,
                        'aria-disabled': readOnly,
                        ...accessibilityErrorProps,
                        style: {
                          ...(!showExtendedDescription ? styles.autosizeTextarea : {}),
                          ...inputProps?.style,
                        },
                      },
                    }}
                    id={`${code}-description-input`}
                    fullWidth
                    multiline
                    minRows={1}
                    value={value}
                    disabled={readOnly}
                    required={required || false}
                    onChange={(event) =>
                      onDescriptionValuesChange({
                        id: itemId,
                        code,
                        description: event.target.value,
                      })
                    }
                    onBlur={onBlur}
                  />
                  {inputProps?.maxLength && (
                    <LimitCounter
                      stylesObj={styles.counter}
                      currentLength={value?.length}
                      maxLength={inputProps?.maxLength}
                    />
                  )}
                </FormControl>
                {showExtendedDescription && (
                  <FormControl
                    fullWidth
                    title={translatableExtDescLabel?.toUpperCase()}
                    sx={styles.formControlExt}
                  >
                    <FormLabel sx={styles.label as SxProps} id={`${id}-extended-label`}>
                      {styledFieldLabel?.(translatableExtDescLabel)}
                    </FormLabel>
                    <Box sx={styles.innerCard}>
                      <InputBase
                        multiline
                        fullWidth
                        minRows={2}
                        maxRows={12}
                        id={`${id}-extended-description-input`}
                        value={secondaryValue}
                        sx={styles.inputBase}
                        slotProps={{
                          input: {
                            ...extendedInputProps,
                            'aria-label': translatableExtDescLabel,
                            'aria-required': required || false,
                            'aria-disabled': readOnly,
                            ...accessibilityErrorProps,
                            style: {
                              ...styles.autosizeTextarea,
                              ...extendedInputProps?.style,
                            },
                          },
                        }}
                        disabled={readOnly}
                        required={extendedRequired}
                        onChange={(event) =>
                          onDescriptionValuesChange({
                            id: itemId,
                            code,
                            extendedDescription: event.target.value,
                          })
                        }
                        onBlur={onBlur}
                      />
                    </Box>
                    {extendedInputProps?.maxLength && (
                      <LimitCounter
                        stylesObj={styles.counter}
                        currentLength={secondaryValue?.length}
                        maxLength={extendedInputProps?.maxLength}
                      />
                    )}
                  </FormControl>
                )}
              </Box>
            );
          })}
        </CardContent>
      </Card>
      {hasError && (
        <FormHelperText error sx={{ mt: 2 }}>
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default MultiLanguageTranslator;
