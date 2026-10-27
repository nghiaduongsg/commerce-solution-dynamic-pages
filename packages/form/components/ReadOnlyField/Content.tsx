import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { AppColors, InfoSchema } from '@pkg-common/types';
import { isString } from 'lodash';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';

const getStyles = (theme) => {
  return {
    titlePrimary: {
      color: theme.palette?.primary.main,
    },
    subtitle: {
      fontWeight: 400,
    },
    subtitleMedium: {
      fontWeight: 700,
    },
  };
};

export interface ContentProps {
  id: string;
  title?: string;
  subtitle?: string;
  isSlim?: boolean;
  labelColor?: 'default' | 'primary';
  alignment?: 'left' | 'right' | 'inherit' | 'center' | 'justify' | undefined;
  rows?: string | number;
  valueColorConfiguration?: AppColors;
  info?: InfoSchema;
}

const Content = ({
  id,
  title,
  subtitle,
  isSlim = false,
  alignment = 'left',
  rows = 1,
  valueColorConfiguration,
  info = {},
}: ContentProps) => {
  const styles = getStyles(useTheme());

  const { color, icon, iconStyles = {} } = valueColorConfiguration || {};

  const renderSubtitle = useMemo(() => {
    if (typeof subtitle === 'object' && !React.isValidElement(subtitle)) {
      return JSON.stringify(subtitle);
    }
    return subtitle;
  }, [subtitle]);

  const isMultiline = useMemo(() => {
    if (!isString(subtitle)) {
      return false;
    }
    return subtitle?.indexOf('\n') >= 0;
  }, [subtitle]);

  const { translatedMessage } = useAdditionalInfo(id, info);

  const subtitleStyle = {
    ...(isSlim ? styles.subtitle : styles.subtitleMedium),
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: isSlim && isMultiline ? 'pre-line' : 'normal',
    maxWidth: '100%',
    ...(valueColorConfiguration ? { color, fontWeight: 'bold' } : {}),
  };
  return (
    <Box width="100%">
      <Typography
        sx={{ wordBreak: 'normal' }}
        variant="body2"
        color={'textPrimary'}
        component="div"
        align={alignment}
        id={`content-${id}-readonly-title`}
        data-testid={`content-${id}-readonly-title`}
        title={title}
        noWrap
      >
        {title}
      </Typography>
      <Box pt={isSlim ? 0.5 : 0}>
        {rows && Number(rows) >= 5 ? (
          <Typography
            variant={'body1'}
            component="div"
            align={alignment}
            id={`content-${id}-subtitle`}
            data-testid={`content-${id}-subtitle`}
            sx={subtitleStyle}
            style={{
              overflowY: 'auto',
            }}
            color={'textSecondary'}
            aria-description={translatedMessage}
          >
            {renderSubtitle}
          </Typography>
        ) : (
          <Typography
            variant={isSlim ? 'body2' : 'body1'}
            component="div"
            align={alignment}
            id={`content-${id}-subtitle`}
            data-testid={`content-${id}-subtitle`}
            sx={subtitleStyle}
            color={'textSecondary'}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
              aria-description={translatedMessage}
            >
              {renderSubtitle}
              {icon && (
                <AssetByType
                  input="icons"
                  name={icon ?? ''}
                  props={{ style: { color, ...iconStyles } }}
                />
              )}
            </div>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Content;
