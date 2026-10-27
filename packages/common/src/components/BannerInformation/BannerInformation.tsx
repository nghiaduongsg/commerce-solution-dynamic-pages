import React, { useState, useMemo } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import BannerInformationDetails from './BannerInformationDetails';
import { AnyType } from '@pkg-common/types';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useFormField from '@pkg-entity/hooks/useFormField';
import { hasValue } from '@pkg-common/utils';
import { SxProps } from '@mui/system';

const getStyles = (theme) => {
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    infoIcon: {
      color: theme.palette?.secondary.main,
    },
    icon: {
      color: theme.palette?.secondary.main,
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    label: {
      color: theme.palette?.secondary?.light,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'flex-start',
    },
  };
};

export default function BannerInformation({
  id,
  uiSchema,
  sx = {},
}: {
  id: string;
  uiSchema: AnyType;
  sx?: SxProps;
}) {
  const theme = useTheme();
  const classes = getStyles(theme);
  const [open, setOpen] = useState(false);
  const { visibilityFrom } = uiSchema || {};
  const { check: visible } = useCheckFrom(id, visibilityFrom, true);
  const { value } = useFormField(`${id}_${uiSchema['ui:page']?.labelKey}`);

  const hasInfo = useMemo(() => {
    return !!uiSchema?.mainInfoUISchema;
  }, [uiSchema]);

  const headerActions = useMemo(() => {
    return uiSchema['ui:headerButtons'] || {};
  }, [uiSchema]);

  const icon = useMemo(() => {
    if (uiSchema['ui:page']?.labelKey) {
      return uiSchema['ui:page']?.labelKey === 'identificationLabel' ? (
        <AssetByType
          input="icons"
          name="AssignmentInd"
          props={{
            ['data-testid']: 'assignment-icon', // removed in MUI v7
            id: `assignment-icon-${value}`,
            style: { cursor: hasInfo ? 'pointer' : 'default', ...classes.icon },
            onClick: () => setOpen((isOpen) => !isOpen),
          }}
        />
      ) : (
        <AssetByType
          input="icons"
          name={uiSchema['ui:page']?.labelIcon || 'LabelImportant'}
          props={{
            style: classes.icon,
          }}
        />
      );
    }
    if (uiSchema?.mainInfoUISchema) {
      return (
        <AssetByType
          input="icons"
          name="InfoOutlined"
          props={{
            style: classes.infoIcon,
            onClick: () => setOpen((isOpen) => !isOpen),
          }}
        />
      );
    }
    return null;
  }, [uiSchema]);

  if (!visible) {
    return null;
  }

  return (
    <Box sx={classes.container}>
      {headerActions && (
        <AppActions
          page={uiSchema['ui:page'] || id}
          actions={headerActions}
          checkPermissions={true}
        />
      )}
      {hasValue(value) && (
        <div
          style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}
          id={`banner-information-${value}`}
          data-testid={'banner-information-labelKey'}
        >
          {icon}
          <Typography
            sx={{ ...classes.label, ...sx }}
            data-testid={`content-${id}-identificationLabel-readonly-subtitle`}
            component={'h2'}
          >
            {value}
          </Typography>
        </div>
      )}
      {open && hasInfo && (
        <>
          <Divider orientation="vertical" flexItem style={{ margin: '14px 8px' }} />
          <BannerInformationDetails
            open={open}
            onClose={() => setOpen(false)}
            schema={uiSchema?.mainInfoSchema}
            uiSchema={uiSchema?.mainInfoUISchema}
            namespace={uiSchema['ui:labels'].namespace}
          />
        </>
      )}
    </Box>
  );
}
