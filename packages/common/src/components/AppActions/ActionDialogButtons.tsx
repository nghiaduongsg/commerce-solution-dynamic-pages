import React, { useCallback, useMemo } from 'react';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import GenericButton from '../GenericButton/GenericButton';
import { ActionDialogButtonsProps } from './ActionDialogButtons.d';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import AppActions from './AppActions';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useLatestButtonAction from '@pkg-common/button/useLatestButtonAction';
import { hasValue } from '@pkg-common/utils';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useDebouncedAction from '@pkg-common/hooks/useDebouncedAction';
import { getDebounceDelay } from '@pkg-form/validations/utils/widgetUtils';
import { AppActionButtons } from '@pkg-common/button/types';

export default function ActionDialogButtons({
  id,
  mainActionLabel,
  onCancel,
  onSubmit = () => {},
  buttons,
  onSuccessCallback,
  shouldSetFormDirty = true,
  disabled = false,
}: Readonly<ActionDialogButtonsProps>) {
  const { replaceMainButton = true } = buttons || {};

  const finalId = useMemo(() => {
    if (id?.indexOf(TRANSITION_FORM) >= 0) {
      return TRANSITION_FORM;
    } else {
      return id;
    }
  }, [id]);

  const { selectedLanguage } = useSystem();
  const { isFormValid, clearParentFieldErrors } = useValidationsContext();
  const { isFormDirty, forceDirty, clearDirtyFlags } = useFormManagerContext();

  const valid = isFormValid(finalId);
  const dirty = isFormDirty(finalId);

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { formData } = useEntityFormData(finalId);
  const { latestButtonAction, clearLatestButtonAction } = useLatestButtonAction();

  const onSaveClick = useCallback(() => {
    if (shouldSetFormDirty && valid && dirty) {
      onSubmit?.(formData);
    } else if (shouldSetFormDirty) {
      forceDirty(finalId);
    } else {
      onSubmit?.(formData);
    }
  }, [formData, valid, dirty, onSubmit, finalId, shouldSetFormDirty]);

  const showMainButton = useMemo(() => {
    if (buttons && replaceMainButton) {
      return false;
    }
    return !buttons;
  }, [replaceMainButton, buttons]);

  const onCancelPressed = useCallback(() => {
    if (onCancel) {
      onCancel();
      clearParentFieldErrors(finalId);
      clearDirtyFlags(finalId);
      if (hasValue(latestButtonAction)) {
        clearLatestButtonAction();
      }
    }
  }, [onCancel, latestButtonAction, clearLatestButtonAction]);

  const onMainButtonPressed = useCallback(() => {
    onSaveClick();
    if (hasValue(latestButtonAction)) {
      clearLatestButtonAction();
    }
  }, [onSaveClick, latestButtonAction, clearLatestButtonAction]);

  const onCancelDebounced = useDebouncedAction(onCancelPressed, getDebounceDelay(false) + 50);
  const onMainDebounced = useDebouncedAction(onMainButtonPressed, getDebounceDelay(false) + 50);

  return (
    <>
      {onCancel && (
        <GenericButton
          id={`${id}-cancel-btn`}
          variant="outlined"
          onClick={onCancelDebounced}
          label={translate('cancel', { ns: COMMON, lng: selectedLanguage })}
          ariaLabel={translate('cancel', { ns: ACCESSIBILITY, lng: selectedLanguage })}
        />
      )}
      {showMainButton && (
        <GenericButton
          id={`${id}-save-btn`}
          variant="contained"
          disabled={disabled || (shouldSetFormDirty ? !valid || !dirty : !valid)}
          onClick={onMainDebounced}
          label={translate(mainActionLabel ?? 'save', { ns: COMMON, lng: selectedLanguage })}
          ariaLabel={translate(mainActionLabel ?? 'save', { ns: COMMON, lng: selectedLanguage })}
        />
      )}
      {buttons && (
        <AppActions
          page={{ id }}
          disabled={disabled || (shouldSetFormDirty ? !valid || !dirty : !valid)}
          actions={buttons as AppActionButtons}
          checkPermissions
          onSuccessCallback={onSuccessCallback}
        />
      )}
    </>
  );
}
