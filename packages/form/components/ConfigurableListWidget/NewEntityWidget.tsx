import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useEntity from '@pkg-entity/hooks/useEntity';
import {
  getFieldValue,
  getFieldLabel,
  getRawValue,
} from '@pkg-form/components/ConfigurableListWidget/utils/formWidgetUtils';
import useTable from '@pkg-list/hooks/useTable';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AnyType } from '@pkg-common/types';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { useTranslation } from 'react-i18next';
import GenericPage from '@pkg-form/components/GenericPage';
import useSystem from '@pkg-setup/src/system/useSystem';
import AddressForm from '@pkg-layout/src/list/AddressForm';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import useClearApiData from '@pkg-core/apiData/hooks/useClearApiData';

const ADDRESSES_ID = 'Address';

const getStyles = (theme) => {
  return { container: { marginTop: theme.spacing(2) } };
};

const Forms = { [ADDRESSES_ID]: AddressForm };

const NewEntityWidget = ({
  value,
  onChange,
  title,
  entityId,
  entityIdKey,
  entityFields = [],
  schema,
  uiSchema,
  isFlat,
  loadDetails,
  editable,
  id,
}: {
  value: AnyType;
  title: string;
  onChange: (any) => void;
  entityId: string;
  entityIdKey: string;
  entityFields: Array<string>;
  schema: AnyType;
  uiSchema: AnyType;
  isFlat?: boolean;
  loadDetails?: boolean;
  editable?: boolean;
  id: string;
}) => {
  const styles = getStyles(useTheme());

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { entity, errorMessage, clearEntity } = useEntity(entityId);
  const { clearSelections } = useTable(entityId);
  const { clearMultipleApiData } = useClearApiData();

  const [viewOnly, setViewOnly] = useState(!!value?.[entityIdKey]);

  const onClear = useCallback(() => {
    clearEntity();
    onChange(isFlat ? undefined : {});
    setViewOnly(false);
  }, [isFlat, clearEntity, onChange]);

  const onEdit = useCallback(() => {
    setViewOnly(false);
  }, [clearEntity, onChange]);

  useEffect(() => {
    const hasMissingFields = !!(entityFields || []).find((field) => !entity[field]);

    if (entity && !hasMissingFields) {
      const fieldValue = getFieldValue(
        isFlat || false,
        entity,
        entityIdKey,
        entityFields,
        undefined,
      );

      if (fieldValue) {
        onChange(fieldValue);
      }
    }
  }, [entity]);

  useEffect(() => {
    if (getRawValue(isFlat, value, entityIdKey)) {
      setViewOnly(true);
    } else {
      setViewOnly(false);
    }
  }, [value, errorMessage, isFlat, entityIdKey, entity]);

  useEffect(() => {
    return () => {
      clearSelections();
      clearEntity();
      clearMultipleApiData([entityId, id]);
    };
  }, [entityId, id, clearMultipleApiData, clearEntity, clearSelections]);

  const selectionContent = value?.[entityIdKey] && (
    <>
      <Typography variant="body2">
        {getFieldLabel(value, isFlat || false, entityFields, [], entityIdKey)}
      </Typography>
      {onClear && (
        <GenericIconButton
          id={`clearSelectionButton-${title}`}
          label={translate('clearSelection', { ns: COMMON, lng: selectedLanguage })}
          ariaLabel={translate('clearSelection', { ns: COMMON, lng: selectedLanguage })}
          onClick={onClear}
          icon={<AssetByType input="icons" name="Cancel" props={{ fontSize: 'inherit' }} />}
        />
      )}
    </>
  );

  return viewOnly ? (
    <Grid
      container
      direction="column"
      alignItems="flex-start"
      justifyContent="center"
      sx={styles.container}
    >
      <FieldTitle
        title={title}
        sx={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '-4px' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {selectionContent}
        {value && editable && (
          <GenericIconButton
            id={`editSelectionButton-${title}`}
            label={translate('editSelection', { ns: COMMON, lng: selectedLanguage })}
            ariaLabel={translate('editSelection', { ns: COMMON, lng: selectedLanguage })}
            onClick={onEdit}
            icon={<AssetByType input="icons" name="Edit" props={{ fontSize: 'inherit' }} />}
          />
        )}
      </Box>
      {loadDetails && (
        <DynamicForm
          id={entityId}
          schema={schema}
          uiSchema={uiSchema}
          data={entity}
          disabled={true}
          loading={false}
        />
      )}
    </Grid>
  ) : (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>{selectionContent}</Box>
      {Forms[entityId] ? (
        React.createElement(Forms[entityId], { schema, uiSchema })
      ) : (
        <GenericPage schema={schema} uiSchema={uiSchema} />
      )}
    </>
  );
};

export default NewEntityWidget;
