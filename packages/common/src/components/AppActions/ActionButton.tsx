import React, { useMemo, useEffect } from 'react';
import { useTheme, Box, Fab } from '@mui/material';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { ActionButtonProps } from './ActionButton.d';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import ActionDialogButtons from './ActionDialogButtons';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import useActionButton from './useActionButton';
import useChangesConfirmation from '@pkg-common/components/ChangesConfirmation/useChangesConfirmation';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import GroupedActionButton from '@pkg-common/components/AppActions/GroupedActionButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { isExternal } from '@pkg-common/utils/utils';
import useSystem from '@pkg-setup/src/system/useSystem';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { hasValue } from '@pkg-common/utils';
import { useTranslation } from 'react-i18next';
import { ADD_ITEM_TO_LIST_SHORTCUT } from '@pkg-constants/keyboardShortcuts';

import {
  InfoRounded,
  Edit,
  Delete,
  Compare,
  Visibility,
  Save,
  FileCopy,
  Undo,
  Check,
  Link as LinkIcon,
  AddCircle,
  Download,
} from '@mui/icons-material';
import SimpleActionButton from '@pkg-common/components/AppActions/SimpleActionButton';
import { WithLink } from '@pkg-common/components/AppActions/WithLink';

const getStyles = (theme) => {
  return {
    floatingContainer: {
      position: 'fixed',
      top: '200px',
      right: '5%',
      zIndex: 1100,
    },
    fab: {
      width: '45px',
      height: '45px',
      borderRadius: '4px',
      '&:hover, &:focus': {
        backgroundColor: theme.palette?.secondary.main,
        border: `1px ${theme.palette?.common.black} solid`,
      },
    },
  };
};

const ActionButton = ({
  id,
  elementId,
  action,
  onSuccessCallback,
  checkPermissions,
  parentId,
  onButtonPress,
}: ActionButtonProps) => {
  const {
    style = 'button',
    icon,
    disabled = false,
    warnOnAction = {},
    type,
    redirectSourceId,
    sx = {},
    namespace,
    openInNewTab = false,
  } = action;

  const {
    onSubmit,
    onClick,
    onCancel,
    visible,
    schema,
    uiSchema,
    modalSize,
    modalOpen,
    finalApi,
    title,
    disabledFromValue,
  } = useActionButton(id, action, onSuccessCallback, parentId, onButtonPress);

  const { handleButtonClick, confirmDialog } = useChangesConfirmation({
    pageId: id,
    enabled: !!action.confirmChanges,
    onConfirm: onClick,
  });

  const { selectedLanguage } = useSystem();
  const theme = useTheme();
  const styles = getStyles(theme);

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace ?? '']);
  const { formData } = useEntityFormData(schema?.id ?? TRANSITION_FORM);

  const hasCustomModalButtons = useMemo(() => {
    return !!uiSchema?.['ui:modal:buttons'];
  }, [uiSchema]);

  const { check: isModalDisabled } = useCheckFrom(id, uiSchema?.disabledFrom);

  const functionButton = useMemo(() => {
    if (icon === 'ADD' || title?.toLowerCase().includes('add')) {
      return {
        type: 'ADD',
        shortcut: ADD_ITEM_TO_LIST_SHORTCUT,
        buttonId: `${id}-add-btn`,
      };
    }

    return null;
  }, [icon, title, id]);

  const schemaDisabled = uiSchema?.['ui:disabled'] ?? false;
  const isDisabled = useMemo(() => {
    return schemaDisabled || isModalDisabled;
  }, [schemaDisabled, isModalDisabled]);

  const isMenu = useMemo(() => {
    return style === 'menu';
  }, [style]);

  const isButton = useMemo(() => {
    return style === 'button';
  }, [style]);

  const isSimple = useMemo(() => {
    return style === 'simple';
  }, [style]);

  const isIcon = useMemo(() => {
    return style === 'icon';
  }, [style]);

  const isRedirect = useMemo(() => {
    return action.type === 'redirect';
  }, [action]);

  const isGroup = useMemo(() => {
    return style === 'inner-menu';
  }, [style]);

  const isFloating = useMemo(() => {
    return style === 'floating';
  }, [style]);

  const defaultIcon = useMemo(() => {
    if (icon === 'DELETE' || icon === 'DELETE_LIST_ITEM') {
      return <Delete />;
    }
    if (icon === 'EDIT' || icon === 'EDIT_LIST_ITEM') {
      return <Edit />;
    }

    if (icon === 'INFO') {
      return <InfoRounded />;
    }

    if (icon === 'DUPLICATE' || icon === 'DUPLICATE_LIST_ITEM') {
      return <FileCopy />;
    }

    if (icon === 'ADD') {
      return <AddCircle />;
    }

    if (icon === 'COMPARE') {
      return <Compare />;
    }

    if (icon === 'SAVE') {
      return <Save />;
    }

    if (icon === 'VIEW') {
      return <Visibility />;
    }

    if (icon === 'APPROVE') {
      return <Check />;
    }

    if (icon === 'LINK') {
      return <LinkIcon />;
    }

    if (icon === 'UNDO') {
      return <Undo />;
    }

    if (icon === 'DOWNLOAD') {
      return <Download />;
    }

    if (isRedirect && !icon) {
      return <LinkIcon />;
    }

    return <AssetByType input="icons" name={icon ?? ''} />;
  }, [icon, isRedirect]);

  const showConfirmation = useMemo(() => {
    return hasValue(warnOnAction);
  }, [warnOnAction]);

  const formDataHasChanged = useMemo(() => {
    return Object.keys(formData ?? {}).length > 0;
  }, [formData]);

  const showForm = useMemo(() => {
    return !hasValue(warnOnAction) && (hasValue(schema) || hasValue(uiSchema));
  }, [warnOnAction, schema, uiSchema]);

  const dataTestId = useMemo(() => {
    if (action?.title) {
      return `menu-action-${id}-${title?.toUpperCase()}`;
    } else {
      return `${id}-${icon?.toLowerCase()}-btn`;
    }
  }, [icon, action, id, title]);

  useEffect(() => {
    if (
      redirectSourceId &&
      type === 'redirect' &&
      finalApi.data &&
      Object.keys(finalApi.data).length
    ) {
      localStorage.setItem(redirectSourceId, JSON.stringify(finalApi.data));
    }
  }, [type, redirectSourceId, finalApi]);

  if (!visible || disabledFromValue) {
    return null;
  }

  return (
    <>
      {(isMenu || isSimple) && (
        <SimpleActionButton
          id={id}
          elementId={elementId}
          icon={icon}
          dataTestId={dataTestId}
          disabled={disabled}
          onClick={handleButtonClick}
          sx={sx}
          warning={hasValue(warnOnAction) ? { ...warnOnAction, fieldId: id } : undefined}
          title={title}
          defaultIcon={defaultIcon}
          finalApi={finalApi}
          isRedirect={isRedirect}
          openInNewTab={isRedirect && openInNewTab}
        />
      )}
      {isFloating && (
        <Box sx={styles.floatingContainer}>
          <WithLink finalApi={finalApi} isRedirect={isRedirect}>
            <Fab
              sx={{ ...styles.fab, ...sx }}
              aria-label={title}
              id={`${id}-floating-btn`}
              color="secondary"
              onClick={(e) => {
                e?.preventDefault();
                e?.stopPropagation();
                handleButtonClick(e);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
              }}
              data-testid={`${id}-floating-btn`}
              disabled={disabled}
            >
              {icon ? defaultIcon : <AssetByType input="icons" name={icon ?? 'Save'} />}
            </Fab>
          </WithLink>
        </Box>
      )}
      {isIcon && (
        <WithLink finalApi={finalApi} isRedirect={isRedirect}>
          <GenericIconButton
            id={
              elementId
                ? `${id}-${elementId}-${icon?.toLowerCase()}-btn`
                : `${id}-${icon?.toLowerCase()}-btn`
            }
            styles={sx}
            testId={dataTestId}
            onClick={handleButtonClick}
            icon={defaultIcon}
            ariaLabel={title}
            disabled={disabled}
            ariaHasPopup={!isRedirect && (showForm || showConfirmation)}
            warning={hasValue(warnOnAction) ? { ...warnOnAction, fieldId: id } : undefined}
            applyDebounce={!isExternal(finalApi?.url)}
            openInNewTab={isRedirect && openInNewTab}
          />
        </WithLink>
      )}

      {isButton && (
        <WithLink finalApi={finalApi} isRedirect={isRedirect}>
          <GenericButton
            id={functionButton?.buttonId ?? `${title}-action-btn`}
            testId={functionButton?.buttonId ?? `${title}-action-btn`}
            ariaKeyboardShortcuts={functionButton?.shortcut ?? ''}
            onClick={handleButtonClick}
            label={translate(title, { ns: COMMON, lng: selectedLanguage })}
            disabled={disabled}
            ariaLabel={translate(title, { ns: COMMON, tableId: id, lng: selectedLanguage })}
            ariaHasPopup={showForm || showConfirmation ? 'dialog' : undefined}
            startIcon={icon ? defaultIcon : undefined}
            styles={{ marginRight: theme.spacing(1), ...sx }}
            warning={hasValue(warnOnAction) ? ({ ...warnOnAction, fieldId: id } as any) : undefined}
            openInNewTab={isRedirect && openInNewTab}
          />
        </WithLink>
      )}

      {isGroup && (
        <GroupedActionButton
          id={`${title}-link-btn`}
          action={action as any}
          checkPermissions={checkPermissions}
        />
      )}
      {showForm && modalOpen && (
        <SimpleDialog
          id={schema?.id ?? id}
          title={title}
          open={modalOpen}
          size={modalSize}
          keepMounted={false}
          onClose={onCancel}
          buttons={
            <ActionDialogButtons
              id={schema?.id ?? TRANSITION_FORM}
              mainActionLabel="confirm"
              onCancel={isDisabled ? undefined : onCancel}
              onSuccessCallback={onCancel}
              onSubmit={
                hasCustomModalButtons || isDisabled || !formDataHasChanged ? undefined : onSubmit
              }
              buttons={uiSchema['ui:modal:buttons']}
            />
          }
        >
          <DynamicForm
            id={schema?.id ?? TRANSITION_FORM}
            schema={schema}
            uiSchema={uiSchema}
            data={formData}
            formContext={{ debounceUpdates: false, mechanism: 'CUSTOM' }}
          />
        </SimpleDialog>
      )}
      {confirmDialog}
    </>
  );
};

export default ActionButton;
