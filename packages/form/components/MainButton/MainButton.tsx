import React from 'react';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import { useTheme } from '@mui/material/styles';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { ApiValuesSchema } from '@pkg-common/types';
import useActionButton from '@pkg-common/components/AppActions/useActionButton';
import { useTranslation } from 'react-i18next';
import useClearServerErrors from '@pkg-form/validations/hooks/useClearServerErrors';
import getStyles from './styles';
import { MainButtonProps } from '@pkg-form/components/MainButton/types.d';
import useSystem from '@pkg-setup/src/system/useSystem';
import { usePreventDoubleClick } from '@pkg-common/hooks/usePreventDoubleClick';
import { commonCodes } from '@pkg-constants/validationCodes';
import { hasValue } from '@pkg-common/utils';
import { Box, Fab, Grid } from '@mui/material';
import { MainButtonWIthContext } from './MainButtonWIthContext';
import { SAVE_FORM_SHORTCUT } from '@pkg-constants/keyboardShortcuts';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import usePermissions from '@pkg-setup/src/user/usePermissions';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useDebouncedAction from '@pkg-common/hooks/useDebouncedAction';
import { getDebounceDelay } from '@pkg-form/validations/utils/widgetUtils';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import useChangesConfirmation from '@pkg-common/components/ChangesConfirmation/useChangesConfirmation';
import { useParams } from 'react-router';
import usePage from '@pkg-layout/src/common/hooks/usePage';

export default function MainButton({
  id,
  onSaveEntity,
  data,
  parentPageId = '',
  buttonProperties,
}: MainButtonProps) {
  const styles = getStyles(useTheme());
  const uiSchema = usePage();
  const { confirmChanges = false } = uiSchema['ui:page'] ?? {};

  const {
    style = 'FLOATING',
    label = '',
    icon = 'save',
    color = 'secondary',
    values,
    clearErrors = false,
    avoidSubmit = false,
    type,
    warnOnAction,
    enableContext = data,
    permissionKey = 'defaultItemActions',
    visibilityFrom,
  } = buttonProperties || {};

  const { disabled, disable } = usePreventDoubleClick();
  const { isFormValid } = useValidationsContext();
  const { forceDirty } = useFormManagerContext();
  const { check: visible } = useCheckFrom(id, visibilityFrom, true);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const { enqueueSnackbar } = useNotifiers();
  const { clearServerErrors } = useClearServerErrors();
  const replacementValues = useMultipleFormData(
    id,
    typeof permissionKey === 'string' ? undefined : permissionKey.replacements,
    false,
  );
  const isPermissionAllowed = usePermissions(permissionKey, replacementValues);
  const entityExists = !!data;

  const routeParams = useParams<{ idKey?: string; category: string }>();

  const { onSubmit } = useActionButton(id, {
    values: (values || {}) as ApiValuesSchema,
    onClick: onSaveEntity,
    // @ts-ignore
    avoidSubmit,
  });

  const validateForm = () => {
    if (!isFormValid(id)) {
      forceDirty(id);
      enqueueSnackbar({
        key: new Date().getTime().toString(),
        message: `${commonCodes['formErrorMessage'] ? commonCodes['formErrorMessage'] + ':' : ''} ${translate('formErrorMessage', { ns: COMMON, lng: selectedLanguage })}`,
        severity: 'error',
        namespace: COMMON,
      });
      return false;
    }
    return true;
  };

  const onSubmitDebounced = useDebouncedAction(onSubmit, getDebounceDelay(false) + 50);
  const onSaveEntityDebounced = useDebouncedAction(onSaveEntity, getDebounceDelay(false) + 50);

  const onClick = (options?: { contextToken?: string }) => {
    const contextToken = options?.contextToken;
    disable();
    if (!validateForm()) {
      return;
    }

    if (values && type !== 'redirect') {
      onSubmitDebounced();
      clearErrors && clearServerErrors();
    } else {
      onSaveEntityDebounced({ contextToken });
    }
  };

  const { handleButtonClick, confirmDialog } = useChangesConfirmation({
    pageId: id,
    enabled: !!routeParams.idKey && confirmChanges,
    onConfirm: onClick,
  });

  if (!visible) {
    return true;
  }

  if (style === 'FLOATING' && !enableContext) {
    return (
      <>
        <Box sx={styles.floatingContainer}>
          {/* @ts-ignore */}
          <Fab
            aria-label={
              icon === 'save'
                ? translate('submitButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })
                : translate('navigateNextButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })
            }
            id={`${id}-form-btn`}
            color={color}
            onClick={icon === 'save' ? handleButtonClick : onClick}
            onDoubleClick={(e) => e.preventDefault()}
            data-testid={`${id}-form-btn`}
            aria-keyshortcuts={SAVE_FORM_SHORTCUT}
            disabled={disabled || !isPermissionAllowed}
            type="submit"
          >
            <AssetByType input="icons" name={icon === 'save' ? 'Save' : 'NavigateNext'} />
          </Fab>
        </Box>
        {confirmDialog}
      </>
    );
  }

  if (style === 'FLOATING' && enableContext) {
    const normalizeEntityType = (value: string) => {
      if (value === 'FormDefinition') return 'form';
      return value.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    };

    return (
      <>
        <MainButtonWIthContext
          id={`${id}-form-btn`}
          entityId={data}
          entityType={normalizeEntityType(parentPageId || id)}
          validateForm={validateForm}
          onSubmit={handleButtonClick}
          styles={{ floatingContainer: styles.floatingContainer }}
          disabled={disabled || !isPermissionAllowed}
        />
        {confirmDialog}
      </>
    );
  }

  return (
    <>
      <Grid container justifyContent="flex-end" alignItems="center" sx={styles.container}>
        <GenericButton
          id={`${id}-form-btn`}
          testId={`${id}-form-btn`}
          disabled={!isFormValid || disabled || !isPermissionAllowed}
          variant="outlined"
          styles={{ color }}
          type="submit"
          onClick={handleButtonClick}
          ariaLabel={translate(label || entityExists ? 'update' : 'add', {
            ns: COMMON,
            lng: selectedLanguage,
          })}
          ariaHasPopup={true}
          warning={
            hasValue(warnOnAction)
              ? {
                  ...warnOnAction,
                  fieldId: id,
                  // @ts-ignore
                  translation: warnOnAction.translation || {
                    warningTitleKey: '',
                    warningMessageKey: '',
                  },
                }
              : undefined
          }
        />
      </Grid>
      {confirmDialog}
    </>
  );
}
