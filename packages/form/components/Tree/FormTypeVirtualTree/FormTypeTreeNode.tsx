import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useSystem } from '@pkg-setup/index';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';

import useFormField from '@pkg-entity/hooks/useFormField';
import FormTypeTreeDialog from '@pkg-form/components/Tree/FormTypeVirtualTree/FormTypeTreeDialog';
import ChangeIndicator from '@pkg-form/components/ChangeIndicator/ChangeIndicator';
import { useSelector } from 'react-redux';
import { selectParentFormServerErrors } from '@pkg-form/validations/redux/selectors';
import { equalityCheck } from '@pkg-common/utils/utils';
import InfoTooltip from '@pkg-common/components/InfoTooltip/InfoTooltip';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';

const CodelistTreeNode = ({
  id,
  item,
  level,
  nodeProperties,
  childrenProperty,
  schema,
  uiSchema,
  formContext,
  namespace,
  disabled,
  parent,
  omitAddNew,
  omitDelete,
  onNodeChange,
  selected,
  onNodeSelect,
}) => {
  const theme = useTheme();

  const { __INDEX__: index } = item ?? {};

  const { selectedLanguage, apiUrl } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [action, setAction] = useState<'ADD' | 'EDIT' | 'DELETE' | 'VIEW' | null>(null);

  const { setEntityFormData } = useEntityFormData(TRANSITION_FORM);

  const { removeItem } = useFormField(id, undefined, false);
  const { value } = useFormField(`${id}_${index}`, undefined, false);
  const hasChildren = value?.[childrenProperty]?.length > 0;
  const serverErrors = useSelector(selectParentFormServerErrors(`${id}_${index}`), equalityCheck);

  return (
    <>
      <Box
        tabIndex={0}
        sx={{
          backgroundColor: selected ? theme.palette.primary.light : 'transparent',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          border: `0.5px solid ${theme.palette.primary.light}`,
          borderRadius: 1,
          cursor: 'pointer',
          height: '100%',
          '&:hover': {
            border: `0.5px solid ${theme.palette.primary.dark}`,
            cursor: 'pointer',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            cursor: hasChildren ? 'pointer' : 'none',
            marginLeft: 2,
            overflow: 'hidden',
          }}
          onClick={hasChildren ? onNodeSelect : () => 0}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TruncatedInput
                truncate={{ enabled: true, rows: 1, width: '100%' }}
                title={item?.[nodeProperties?.[0]?.name]}
              />
            </Typography>
            <ChangeIndicator status={item?.__STATUS__} changeIndicators={{ enabled: true }} />
          </Box>

          <Typography variant="caption" fontWeight="normal">
            <TruncatedInput
              truncate={{ enabled: true, rows: 1, width: '100%' }}
              title={nodeProperties
                ?.filter((p, ind) => ind > 0 && !!item?.[p?.name])
                .map((p) => `${item?.[p?.name]} `)}
            />
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {serverErrors?.length > 0 && (
            <InfoTooltip
              id={`${id}_${index}-error-container`}
              dataTestId={`${id}-${index}-ErrorOutlineIcon`}
              message={serverErrors || []}
              icon={
                <AssetByType
                  input="icons"
                  name="ErrorOutline"
                  props={{ style: { color: 'red' } }}
                />
              }
            />
          )}
          {disabled && (
            <GenericIconButton
              id={`${id}-${index}-view-btn`}
              testId={`${id}-${index}-view-btn`}
              ariaLabel={translate('editIconAriaDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                field: translate(id, {
                  ns: namespace,
                  lng: selectedLanguage,
                }),
              })}
              ariaHasPopup={showDialog ? 'dialog' : undefined}
              ariaControls={showDialog ? id : undefined}
              onClick={() => {
                setAction('VIEW');
                setEntityFormData({ ...item, parent });
                setShowDialog(true);
              }}
              icon={<AssetByType input="icons" name="View" />}
              applyDebounce={false}
              size={'small'}
            />
          )}
          {!disabled && (
            <GenericIconButton
              id={`${id}-edit-btn`}
              testId={`${id}-edit-btn`}
              ariaLabel={translate('editIconAriaDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                field: translate(id, {
                  ns: namespace,
                  lng: selectedLanguage,
                }),
              })}
              ariaHasPopup={showDialog ? 'dialog' : undefined}
              ariaControls={showDialog ? id : undefined}
              onClick={() => {
                setAction('EDIT');
                setEntityFormData({ ...item, parent });
                setShowDialog(true);
              }}
              icon={<AssetByType input="icons" name="Edit" />}
              applyDebounce={false}
              size={'small'}
            />
          )}
          {!omitAddNew && childrenProperty && !disabled && (
            <GenericIconButton
              id={`${id}-add-btn`}
              testId={`${id}-add-btn`}
              ariaLabel={translate('addIconAriaDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                field: translate(id, {
                  ns: namespace,
                  lng: selectedLanguage,
                }),
              })}
              ariaHasPopup={showDialog ? 'dialog' : undefined}
              ariaControls={showDialog ? id : undefined}
              onClick={() => {
                setAction('ADD');

                // console.log({ ...item, parent });
                setEntityFormData({ parent: item });
                setShowDialog(true);
              }}
              icon={<AssetByType input="icons" name="AddCircle" />}
              applyDebounce={false}
              size={'small'}
            />
          )}
          {!omitDelete && !disabled && (
            <GenericIconButton
              id={`${id}-delete-btn`}
              testId={`${id}-delete-btn`}
              ariaLabel={translate('deleteIconAriaDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                field: translate(id, {
                  ns: namespace,
                  lng: selectedLanguage,
                }),
              })}
              ariaHasPopup={showDialog ? 'dialog' : undefined}
              ariaControls={showDialog ? id : undefined}
              onClick={() => {
                removeItem(index);
                onNodeChange(null, index);
              }}
              icon={<AssetByType input="icons" name="Delete" />}
              applyDebounce={false}
              size={'small'}
            />
          )}
        </Box>
      </Box>

      <FormTypeTreeDialog
        id={id}
        level={level}
        disabled={disabled}
        namespace={namespace}
        action={action}
        index={index}
        schema={schema}
        uiSchema={uiSchema}
        childrenProperty={childrenProperty}
        open={showDialog}
        onClose={() => setShowDialog(false)}
        formContext={formContext}
      />
    </>
  );
};

export default CodelistTreeNode;
