import React, { useState, useMemo, forwardRef } from 'react';
import { Box, Card, CardActions, CardContent, CardHeader, Collapse, useTheme } from '@mui/material';
import { useStyles } from './styles';
import { GenericCardProps } from './GenericCard.d';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getCorrectColorConfiguration } from '@pkg-list/utils/tableRowUtils';
import { useLocation, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useSelector } from 'react-redux';
import { useUser } from '@pkg-setup/index';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';
import useExpandAll from '@pkg-common/hooks/useExpandAll';
import ChangeIndicator from '@pkg-form/components/ChangeIndicator/ChangeIndicator';
import WithInfoPieces from '@pkg-form/groups/WithInfoPieces';

const GenericCardInner = forwardRef<HTMLDivElement, GenericCardProps>(
  (
    {
      id,
      testId,
      title,
      showTitle = true,
      icon,
      actions,
      footerActions,
      children,
      state = 'DEFAULT',
      selectable = false,
      collapsible = false,
      resizable = false,
      expanded: initialExpanded = false,
      onClick = () => 0,
      styleOverrides = {},
      cardColors,
      onFocus = () => null,
      wrapsTable = false,
      information,
      changeIndicators,
      indicatorStatus,
      onExpanded,
    },
    ref,
  ) => {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { partyRoleId, userId } = useUser();
    const storeState = useSelector((state) => state);
    const { state: locationState } = useLocation();
    const routeParams = useParams();

    const { selectedLanguage, application } = useSystem();
    const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

    const [expanded, setExpanded] = useState(initialExpanded);
    useExpandAll(setExpanded);

    const user = useMemo(() => {
      return application === 'ISS' ? userId : partyRoleId;
    }, [partyRoleId, userId]);

    const cardColor = getCorrectColorConfiguration(
      id,
      undefined,
      { user, state: storeState, routeParams, routerData: locationState },
      cardColors ?? [],
    );
    const onToggleCollapse = () => {
      setExpanded((prev) => !prev);
      if (onExpanded) {
        onExpanded();
      }
    };

    const accessibilityErrorProps = useMemo(() => {
      const hasError = state === 'INVALID';
      return getAccessibilityErrorProps(id, hasError);
    }, [state, id]);

    const cardStyles = useMemo(() => {
      if (cardColor?.border) {
        return { ...styleOverrides, border: `3px ${cardColor?.color} solid` };
      } else if (cardColor) {
        return { ...styleOverrides, borderLeft: `8px ${cardColor?.color} solid` };
      } else {
        return styleOverrides;
      }
    }, [cardColor, styleOverrides]);

    const cardType = collapsible ? 'collapsible' : 'general';

    return (
      // @ts-ignore
      <Card
        ref={ref}
        id={id}
        className={'MuiCardGroup'}
        data-testid={`${cardType}-card-${testId ?? id}`}
        aria-labelledby={showTitle ? `${id}-card-title` : undefined}
        aria-label={showTitle ? undefined : title}
        role={'region'}
        onFocus={(e: { stopPropagation: Function }) => {
          e.stopPropagation();
          onFocus();
        }}
        sx={{
          ...(state === 'INVALID' && styles.cardInvalid),
          ...(resizable && { display: 'flex', flexDirection: 'column' }),
          ...styleOverrides?.card,
        }}
        style={cardStyles as React.CSSProperties}
        onClick={selectable ? () => onClick() : undefined}
        tabIndex={0}
        onKeyDown={(e: { key?: string; preventDefault: Function }) => {
          if (!selectable) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        {...(accessibilityErrorProps ?? {})}
      >
        {(showTitle || actions || collapsible) && (
          <CardHeader
            id={collapsible ? `collapsible-card-header-${id}` : `general-card-header-${id}`}
            className={'cardHeaderDragHandler'}
            sx={
              resizable
                ? { cursor: 'hand', ...styleOverrides?.cardHeader }
                : styleOverrides?.cardHeader
            }
            avatar={
              icon ? (
                <AssetByType
                  input="icons"
                  name={icon}
                  props={{
                    sx: { color: theme.palette.primary.main, ...styleOverrides?.cardHeaderIcon },
                  }}
                />
              ) : undefined
            }
            title={
              <div
                style={{
                  ...styles.cardHeaderText,
                  ...styleOverrides?.cardHeaderText,
                }}
              >
                <WithInfoPieces id={id} info={information}>
                  <div style={{ display: 'flex', alignItems: 'center' }} id={`${id}-card-title`}>
                    {showTitle && title}
                    <ChangeIndicator status={indicatorStatus} changeIndicators={changeIndicators} />
                  </div>
                </WithInfoPieces>

                {(actions || collapsible) && (
                  <Box sx={styles.cardActions} style={styleOverrides?.cardActions ?? {}}>
                    {actions}
                    {collapsible && (
                      <GenericIconButton
                        id={`collapsible-card-header-button-${id}`}
                        testId={`collapsible-card-header-button-${id}`}
                        ariaLabel={translate(expanded ? 'collapse' : 'expand', {
                          ns: COMMON,
                          lng: selectedLanguage,
                        })}
                        ariaExpanded={expanded}
                        ariaControls={expanded ? `collapsible-card-details-${id}` : undefined}
                        onClick={onToggleCollapse}
                        applyDebounce={false}
                        icon={
                          <AssetByType
                            input="icons"
                            name={expanded ? 'KeyboardArrowDown' : 'KeyboardArrowUp'}
                          />
                        }
                      />
                    )}
                  </Box>
                )}
              </div>
            }
            style={expanded ? { backgroundColor: theme.palette.primary.light } : {}}
          />
        )}
        {collapsible && !resizable && (
          <Collapse in={expanded} unmountOnExit id={`collapsible-card-details-${id}`}>
            <CardContent sx={styleOverrides?.cardContent ?? {}}>{children}</CardContent>
          </Collapse>
        )}
        {!collapsible && !resizable && (
          <CardContent
            sx={styleOverrides?.cardContent ?? {}}
            tabIndex={wrapsTable ? -1 : 0}
            aria-label={wrapsTable ? undefined : `contents of ${title}`}
          >
            {children}
          </CardContent>
        )}
        {resizable && (
          <CardContent
            sx={{ ...styles.cardContentResizable, ...(styleOverrides?.cardContent ?? {}) }}
          >
            {children}
          </CardContent>
        )}
        {footerActions && (
          <CardActions sx={{ ...styles.cardFooter, ...(styleOverrides?.cardFooter ?? {}) }}>
            {footerActions}
          </CardActions>
        )}
      </Card>
    );
  },
);

GenericCardInner.displayName = 'GenericCardInner';

export default GenericCardInner;
