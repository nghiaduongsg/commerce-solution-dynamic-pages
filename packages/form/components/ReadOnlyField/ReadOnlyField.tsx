import React, { useRef, RefObject, useMemo } from 'react';
import Content from './Content';
import { ApiValuesSchema } from '@pkg-common/types';
import { Box, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnyType } from '@pkg-common/types';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { getCorrectColorConfiguration } from '@pkg-list/utils/tableRowUtils';
import { useLocation, useParams } from 'react-router';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';
import WithInfoPieces from '@pkg-form/groups/WithInfoPieces';
import { useSelector } from 'react-redux';
import useUser from '@pkg-setup/src/user/useUser';
import { hasValue } from '@pkg-common/utils';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useSystem } from '@pkg-setup/index';

const useStyles = (theme) => {
  return {
    container: (fieldColor) => ({
      whiteSpace: 'normal',
      display: 'flex',
      wordBreak: 'break-word',
      color: theme.palette.common.black,
      ...fieldColor,
    }),
    contentContainer: {
      display: 'flex',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 200,
    },
    appActions: {
      display: 'flex',
      alignItems: 'flex-end',
      marginRight: '12px',
    },
    link: {
      display: 'flex',
      alignItems: 'flex-end',
      marginRight: '12px',
    },
  };
};

const ReadOnlyField = ({
  id,
  title,
  value,
  slim = true,
  linkRoute,
  truncate = false,
  uiSchema = {},
  showLabel = true,
  errors,
  rows = 1,
  invalid = false,
}: {
  id: string;
  title?: string;
  value: AnyType;
  slim?: boolean;
  linkRoute?: ApiValuesSchema;
  truncate?: boolean;
  uiSchema?: AnyType;
  showLabel?: boolean;
  errors?: AnyType;
  rows?: number | undefined;
  invalid?: boolean;
}) => {
  const styles = useStyles(useTheme());
  const ref = useRef<AnyType>(undefined);
  const { partyRoleId } = useUser();
  const state = useSelector((state) => state);
  const { state: locationState } = useLocation();
  const routeParams = useParams();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const subtitle = hasValue(value) ? value : '-';
  const readOnlyFieldColors = uiSchema['ui:readonly:colors'];
  const info = uiSchema['ui:information'];

  const allInfoPieces = useMemo(() => {
    if (!info) return [];
    if (Array.isArray(info)) {
      return info.map((p) => ({ ...p, namespace: p?.namespace ?? COMMON }));
    }
    return [{ ...info, namespace: info?.namespace ?? COMMON }];
  }, [info]);

  const fieldColor = getCorrectColorConfiguration(
    id,
    undefined,
    { user: partyRoleId || '', state, routeParams, routerData: locationState },
    readOnlyFieldColors || [],
  );

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, invalid);
  }, [invalid, id]);

  const readOnlyField = (
    <Box {...accessibilityErrorProps} width="100%">
      <Box sx={styles.container(fieldColor)}>
        <input ref={ref as RefObject<AnyType>} type="hidden" value={subtitle} />

        {!truncate && (
          <Content
            id={id}
            alignment="left"
            subtitle={subtitle}
            title={showLabel ? title : ''}
            isSlim={slim}
            rows={rows}
            valueColorConfiguration={fieldColor}
            info={info}
          />
        )}

        {truncate && (
          <Tooltip
            title={subtitle}
            placement="top"
            role={hasValue(subtitle) ? 'tooltip' : undefined}
          >
            <Box sx={styles.contentContainer}>
              <Content
                id={`${id}-readonly`}
                alignment="left"
                subtitle={subtitle}
                title={showLabel ? title : ''}
                isSlim={slim}
                valueColorConfiguration={fieldColor}
                info={info}
              />
            </Box>
          </Tooltip>
        )}

        {linkRoute && (
          <Box sx={styles.link}>
            <AppActions
              page={uiSchema['ui:page'] || { id: `${id}-readonly` }}
              actions={{
                buttons: [
                  {
                    title: translate('genericRedirectButton', {
                      namespace: COMMON,
                      lng: selectedLanguage,
                      label: `${title} ${subtitle}`,
                    }),
                    type: 'redirect',
                    style: 'icon',
                    values: linkRoute || {},
                    permissionKey: 'defaultItemActions',
                  },
                ],
              }}
              checkPermissions={true}
            />
          </Box>
        )}
      </Box>
      {errors}
    </Box>
  );

  if (allInfoPieces.length > 0) {
    return (
      <WithInfoPieces id={id} info={allInfoPieces}>
        {readOnlyField}
      </WithInfoPieces>
    );
  }

  return readOnlyField;
};

export default React.memo(
  ReadOnlyField,
  (prev, next) =>
    prev.value === next.value &&
    prev.title === next.title &&
    prev.linkRoute === next.linkRoute &&
    prev.errors === next.errors &&
    prev.invalid === next.invalid &&
    JSON.stringify(prev.uiSchema || {}) === JSON.stringify(next.uiSchema || {}),
);
