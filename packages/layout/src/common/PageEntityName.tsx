import React, { useMemo } from 'react';

import usePage from '@pkg-layout/src/common/hooks/usePage';
import { Box, Tooltip, Typography } from '@mui/material';
import { hasValue } from '@pkg-common/utils';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { useSystem } from '@pkg-setup/index';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { COMMON } from '@pkg-constants/translationNamespaces';

const PageEntityName = ({ sx = {} }: { sx: SxProps }) => {
  const theme = useTheme();
  const uiSchema = usePage();
  const location = useLocation();
  const { selectedLanguage } = useSystem();

  const id = useMemo(() => {
    return uiSchema?.['ui:page']?.id;
  }, [uiSchema]);

  const { visibilityFrom } = uiSchema || {};
  const { check: visible } = useCheckFrom(id, visibilityFrom, true);
  const { value } = useFormField(`${id}_${uiSchema['ui:page']?.labelKey}`);

  const icon = useMemo(() => {
    if (uiSchema['ui:page']?.labelKey) {
      return uiSchema['ui:page']?.labelKey === 'identificationLabel'
        ? 'AssignmentInd'
        : uiSchema['ui:page']?.labelIcon ?? 'LabelImportant';
    }
    return null;
  }, [uiSchema['ui:page']]);

  const isList = useMemo(() => {
    return location.pathname.indexOf('/list') > 0;
  }, [location]);

  const isReadOnly = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return uiSchema['ui:disabled'] === true || query.get('readOnly') === 'true';
  }, [location.search, uiSchema]);

  const { t: translate } = useTranslation(COMMON);

  const modeLabel = useMemo(() => {
    if (isList) return '';
    if (isReadOnly) {
      return translate('view', { ns: COMMON, lng: selectedLanguage });
    }
    return translate('edit', { ns: COMMON, lng: selectedLanguage });
  }, [isList, isReadOnly, translate, selectedLanguage]);

  if (!hasValue(value) || !visible) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
      }}
      id={`banner-information-${value}`}
      data-testid={'banner-information-labelKey'}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        {icon && (
          <AssetByType
            input="icons"
            name={isReadOnly ? 'Visibility' : icon}
            props={{
              ['data-testid']: 'assignment-icon', // removed in MUI v7
              id: `assignment-icon-${value}`,
              style: {
                color: theme.palette.secondary.main,
                marginRight: 4,
                height: '30px',
                width: '30px',
              },
            }}
          />
        )}
        <Tooltip
          title={`${modeLabel} ${value}`}
          placement="top"
          role={value ? 'tooltip' : undefined}
        >
          <Typography
            data-testid={`content-${id}-identificationLabel-readonly-subtitle`}
            component={'h3'}
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              width: '500px',
              ...sx,
            }}
          >
            <Typography
              variant="h3"
              component="span"
              sx={{ marginRight: 1 }}
              data-testid={`content-${id}-mode`}
            >
              {`${modeLabel} `}
            </Typography>
            {value}
          </Typography>
        </Tooltip>
      </Box>
    </div>
  );
};

export default PageEntityName;
