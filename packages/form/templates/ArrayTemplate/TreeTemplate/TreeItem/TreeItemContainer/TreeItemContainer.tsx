import React, { ReactElement, useMemo } from 'react';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { Grid, Box, Typography, alpha, useTheme, Theme } from '@mui/material';
import { getFinalMessages, getTreeItemPadding } from '../../utils';
import Props from './TreeItemContainer.d';
import { useStyles } from './styles';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import InfoTooltip from '@pkg-common/components/InfoTooltip/InfoTooltip';
import { useTranslation } from 'react-i18next';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useSystem from '@pkg-setup/src/system/useSystem';
import ChangeIndicator from '@pkg-form/components/ChangeIndicator/ChangeIndicator';
import { resolveFilterIcon } from '@pkg-layout/src/common/utils';

const getTreeItemBackgroundColor = (depth: number, theme: Theme) => {
  const backgroundColors = {
    0: theme?.palette?.primary?.light,
    1: alpha(theme.palette?.common.black, 0.15),
    2: '#edf1f2',
    3: theme?.palette?.divider,
  };

  return backgroundColors[depth || 0];
};

// This component purpose is just to contain styling and no logic on it.
const TreeItemContainer = ({
  id,
  children,
  depth = 0,
  buttons,
  isCollapsed,
  onClickExpandCollapseIcon,
  displayExpandCollapseIcon,
  hasError = false,
  defaultActions,
  infoValue,
  entityTitle,
  changeIndicators,
  indicatorStatus,
  manuallyAdded,
  onButtonPress,
  onArrowClick = () => {},
  isFirst,
  isLast,
}: Props): ReactElement => {
  const theme = useTheme();
  const styles = useStyles();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY]);
  const finalInfoMessage: Array<string> = useMemo(() => {
    return getFinalMessages(infoValue);
  }, [infoValue]);

  const ChevronUpIcon = resolveFilterIcon('ChevronUp');
  const ChevronDownIcon = resolveFilterIcon('ChevronDown');
  const ManuallyAddedIcon = resolveFilterIcon('UserRoundPen');

  const collapsibleTranslationMsg = translate(isCollapsed ? 'expand' : 'collapse', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  const moveActivityUpMsg = translate('moveActivityUpwards', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  const moveActivityDownMsg = translate('moveActivityDownwards', {
    ns: COMMON,
    lng: selectedLanguage,
  });

  return (
    <Grid container sx={styles.container}>
      <Grid size={{ xs: 12 }}>
        <Box ml={getTreeItemPadding(depth)} role="optgroup" aria-labelledby={`${id}-title`}>
          <Box display="flex" alignItems="center">
            {displayExpandCollapseIcon ? (
              <GenericIconButton
                id={id}
                label={collapsibleTranslationMsg}
                ariaLabel={`${collapsibleTranslationMsg}_${id}`}
                onClick={onClickExpandCollapseIcon}
                ariaExpanded={!isCollapsed}
                ariaControls={`${id}-content`}
                icon={
                  <AssetByType input="icons" name={isCollapsed ? 'ArrowRight' : 'ArrowDropDown'} />
                }
              />
            ) : (
              <Box style={{ width: '31px' }} />
            )}
            <Box
              bgcolor={getTreeItemBackgroundColor(depth, theme)}
              border={`1px solid ${theme.palette.divider}`}
              tabIndex={0}
              sx={{ ...styles.boxItems, ...(hasError && styles.hasError), minWidth: 0 }}
            >
              {changeIndicators?.enabled && (
                <div style={styles?.indicatorContainer}>
                  <ChangeIndicator
                    status={indicatorStatus}
                    changeIndicators={changeIndicators}
                    sx={styles?.indicator}
                  />
                </div>
              )}
              <div
                style={{
                  ...styles?.innerContainer,
                  padding: `${changeIndicators?.enabled ? 0 : 8}px 8px 8px`,
                }}
              >
                <div style={{ flex: '1 1 auto' }}>
                  <Typography
                    id={`${id}-title`}
                    variant="body1"
                    align="left"
                    sx={styles.entityTitle}
                  >
                    <strong>{entityTitle}</strong>
                  </Typography>
                  {children}
                </div>
                <Box sx={styles?.iconsContainer}>
                  {manuallyAdded && ManuallyAddedIcon && (
                    <Box sx={styles?.manuallyAddedIconStyles}>
                      <ManuallyAddedIcon size="18px" />
                    </Box>
                  )}
                  {(buttons || finalInfoMessage?.length > 0) && (
                    <div style={styles?.infoMessageContainer}>
                      {finalInfoMessage?.length > 0 && (
                        <InfoTooltip id={`${id}-info`} message={finalInfoMessage} />
                      )}
                      {buttons && (
                        <AppActions
                          page={{ id }}
                          actions={buttons}
                          checkPermissions
                          defaultActions={defaultActions}
                          onButtonPress={onButtonPress}
                        />
                      )}
                    </div>
                  )}
                  {manuallyAdded && ChevronUpIcon && ChevronDownIcon && (
                    <Box sx={styles?.reorderIconStyles}>
                      <GenericIconButton
                        id={`${id}-move-up`}
                        label={moveActivityUpMsg}
                        ariaLabel={moveActivityUpMsg}
                        disabled={isFirst}
                        styles={{ color: 'primary.dark' }}
                        onClick={() => onArrowClick('upwards')}
                        icon={<ChevronUpIcon size="18px" />}
                      />
                      <GenericIconButton
                        id={`${id}-move-down`}
                        label={moveActivityDownMsg}
                        ariaLabel={moveActivityDownMsg}
                        disabled={isLast}
                        styles={{ color: 'primary.dark' }}
                        onClick={() => onArrowClick('downwards')}
                        icon={<ChevronDownIcon size="18px" />}
                      />
                    </Box>
                  )}
                </Box>
              </div>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default TreeItemContainer;
