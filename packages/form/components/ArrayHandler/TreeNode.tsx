import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import useTable from '@pkg-list/hooks/useTable';
import { ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import InfoTooltip from '@pkg-common/components/InfoTooltip/InfoTooltip';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import { useTranslation } from 'react-i18next';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import TreeNodeContent from '@pkg-form/components/ArrayHandler/TreeNodeContent';
import { useTheme } from '@mui/material/styles';
import TreeHandler from '@pkg-form/components/ArrayHandler/TreeHandler';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import hash from 'object-hash';
import { setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import ChangeIndicator from '@pkg-form/components/ChangeIndicator/ChangeIndicator';
import { getCorrectColorConfiguration } from '@pkg-list/utils/tableRowUtils';
import useUser from '@pkg-setup/src/user/useUser';

const viewButton = {
  type: 'button',
  buttons: [
    {
      type: 'view',
      icon: 'VIEW',
      style: 'icon',
      title: 'view',
    },
  ],
};

const TreeNode = ({ row, configuration, props, childrenProperties }) => {
  const theme = useTheme();

  const { partyRoleId } = useUser();

  const { tableId, isDisabled } = configuration;
  const { options, uiSchema, schema } = props || {};
  const { level, childrenProperty, expanded, changeIndicators } = options || {};
  const { __INDEX__ } = row;

  const colors = useMemo(() => {
    if (!configuration) {
      return;
    }
    return configuration['ui:row:colors'];
  }, [configuration]);

  const colorConfiguration = getCorrectColorConfiguration(
    tableId,
    row,
    { user: partyRoleId, state: {}, routeParams: {}, routerData: {} },
    colors || [],
  );

  const { selectedLanguage } = useSystem();
  const { rowIdKey, validationsId } = useTable(tableId);

  const [open, setOpen] = useState<boolean>(expanded);

  const namespace = useMemo(() => {
    if (!configuration) {
      return '';
    }
    return configuration['ui:labels']?.namespace || '';
  }, [configuration]);

  const rowButtons = useMemo(() => {
    if (!configuration) {
      return;
    }
    return configuration['ui:row:buttons'];
  }, [configuration]);

  const { t: translate } = useTranslation([namespace]);

  const title = useMemo(() => {
    return configuration?.title;
  }, [configuration]);

  const finalColumns = useMemo(() => {
    return configuration?.columns;
  }, [configuration]);

  const rowId = useMemo(() => {
    return row[rowIdKey];
  }, [row, rowIdKey]);

  const testId = useMemo(() => {
    return open ? `${tableId}_${__INDEX__}_Collapse` : `${tableId}_${__INDEX__}_Expand`;
  }, [open, tableId]);

  const accessibilityLabel = useMemo(() => {
    return open ? 'collapseNodeAriaLabel' : 'expandNodeAriaLabel';
  }, [open]);

  const { serverErrors: rowServerErrors, isFormValidServerSide: isRowValid } = useFormValidity(
    `${validationsId}_${__INDEX__ || 0}`,
  );

  const itemStatus = row?.__STATUS__;

  const rowStyle = useMemo(() => {
    const rowStyles = {
      borderRadius: theme.spacing(2),
      outline: `1px solid rgba(0, 0, 0, 0.175)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginLeft: `${20 * (level - 1)}px`,
      marginBottom: theme.spacing(4),
      padding: theme.spacing(2),
    };
    if (level === 2) {
      rowStyles['backgroundColor'] = '#edf1f2';
    } else if (level === 3) {
      rowStyles['backgroundColor'] = theme.palette.divider;
    }
    return rowStyles;
  }, [level]);

  const finalSchema = useMemo(() => {
    if (!schema) {
      return undefined;
    }
    const { childrenProperty } = options || {};
    if (!childrenProperty) {
      return undefined;
    }

    return {
      ...schema?.items?.properties[childrenProperty],
    };
  }, [schema, options]);

  const finalUiSchema = useMemo(() => {
    const { childrenProperty } = options || {};
    if (!uiSchema || !childrenProperty || !uiSchema?.items) {
      return undefined;
    }

    return {
      ...uiSchema?.items[childrenProperty],
      'ui:labels': { namespace },
      'ui:page': { id: `${tableId}_${row?.__INDEX__}_${options?.childrenProperty}` },
      'ui:options': {
        ...uiSchema?.items[childrenProperty]['ui:options'],
        changeIndicators,
      },
    };
  }, [uiSchema, options, namespace, row, changeIndicators]);

  const showExpandSign = useMemo(() => {
    if (row[childrenProperty]?.length > 0) {
      return true;
    }

    return Boolean(finalUiSchema?.['ui:options']?.valueFrom);
  }, [row, childrenProperty, finalUiSchema]);

  useEffect(() => {
    setAnnouncement(
      `${tableId}-alert-help-text`,
      translate(open ? 'expanded' : 'collapsed', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
      }),
    );
  }, [open]);

  return (
    <>
      <Box
        tabIndex={0}
        sx={{
          ...rowStyle,
          ...(row?.__HIDDEN__ ? { visibility: 'hidden' } : {}),
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
          ...(colorConfiguration
            ? colorConfiguration.border
              ? { border: `3px ${colorConfiguration?.color} solid` }
              : { borderLeft: `6px ${colorConfiguration?.color} solid` }
            : {}),
        }}
        id={`${tableId}_${row[rowIdKey]}`}
        role={'treeitem'}
      >
        <ChangeIndicator
          status={itemStatus}
          changeIndicators={changeIndicators}
          sx={{
            alignSelf: 'flex-start',
            position: 'absolute',
            margin: 0,
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {showExpandSign && (
            <GenericIconButton
              id={`${testId}-btn`}
              testId={`${testId}-btn`}
              ariaLabel={translate(accessibilityLabel, {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                table: title ? translate(title, { ns: namespace, lng: selectedLanguage }) : '',
              })}
              ariaExpanded={open}
              onClick={() => setOpen((open) => !open)}
              icon={
                <AssetByType input="icons" name={open ? 'KeyboardArrowUp' : 'KeyboardArrowDown'} />
              }
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', flex: 1 }}>
          {title && (
            <FieldTitle
              title={translate(title, { ns: namespace, lng: selectedLanguage })}
              isBold={true}
              sx={
                !showExpandSign || !changeIndicators?.enabled
                  ? { marginLeft: theme.spacing(5) }
                  : {}
              }
            />
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: title ? '8px' : 0 }}>
            {finalColumns?.map((column: AnyType, index: AnyType) => (
              <TreeNodeContent
                key={`${rowId}-${column.name}`}
                row={row}
                tableId={tableId}
                config={{ ...column, index, bold: row.isBold }}
                relatedColumnValue={row[column.relatedColumn]}
                namespace={namespace}
                isLeaf={!showExpandSign}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ alignSelf: 'flex-start' }}>
          {rowButtons && (
            <AppActions
              key={hash(row)}
              page={{ id: tableId, elementId: __INDEX__ }}
              actions={isDisabled ? viewButton : rowButtons}
              checkPermissions={true}
              source={row}
            />
          )}

          {!isRowValid && (
            <InfoTooltip
              id={`${validationsId}_${__INDEX__ || 0}-error-container`}
              dataTestId={`${validationsId}-${__INDEX__}-ErrorOutlineIcon`}
              message={rowServerErrors || []}
              icon={
                <AssetByType
                  input="icons"
                  name="ErrorOutline"
                  props={{ style: { color: 'red' } }}
                />
              }
            />
          )}
        </Box>
      </Box>
      {(open || expanded) && finalUiSchema && finalSchema && (
        <TreeHandler
          {...props}
          id={`${tableId}_${row?.__INDEX__ || 0}_${props?.options?.childrenProperty}`}
          value={row[props?.options?.childrenProperty] || []}
          schema={finalSchema}
          uiSchema={finalUiSchema}
          options={{
            ...(finalUiSchema['ui:options'] || {}),
            expanded: open,
            childrenProperties,
            changeIndicators,
          }}
        />
      )}
    </>
  );
};

export default TreeNode;
