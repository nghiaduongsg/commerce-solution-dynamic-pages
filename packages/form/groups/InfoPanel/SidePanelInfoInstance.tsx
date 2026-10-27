import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { useTheme } from '@mui/material/styles';

import useSystem from '@pkg-setup/src/system/useSystem';
import useDrawer, { useDraggableDrawer } from '@pkg-common/drawer/useDrawer';
import { SidePanelInfoSchema } from '@pkg-common/types';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';

const getStyles = (theme) => {
  return {
    container: {
      background: `rgba(0, 0, 0, .23)`,
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
      '&:hover, &:focus': {
        background: `rgba(0, 0, 0, .23)`,
        border: `3px ${theme.palette?.common.white} solid`,
      },
    },
    selected: {
      background: theme.palette.secondary.main,
      color: theme.palette.common.white,
      border: `3px ${theme.palette.common.white} solid`,
    },
  };
};

const SidePanelInfoInstance = ({
  drawerId,
  onOpen,
  item,
}: {
  drawerId: string;
  onOpen: (_) => void;
  item: SidePanelInfoSchema;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { selectedLanguage } = useSystem();

  const { open, openUniqueDrawer } = useDrawer(drawerId);
  const { id, setItem: setDraggableItem } = useDraggableDrawer();

  const { check: visible } = useCheckFrom(item?.key, item?.visibilityFrom, true);

  const namespace = useMemo(() => {
    return item?.uiSchema['ui:labels']?.namespace || COMMON;
  }, [item]);

  const { t: translate } = useTranslation([namespace, ACCESSIBILITY]);

  const onClick = useCallback(() => {
    if (onOpen) {
      onOpen({ ...item, label: translate(item?.key, { ns: namespace, lng: selectedLanguage }) });
    }
    if (!open) {
      openUniqueDrawer();
    }
  }, [item, openUniqueDrawer, open, namespace, selectedLanguage]);

  useEffect(() => {
    if (!visible && id === item?.key) {
      setDraggableItem({ id: null, item: null });
    }
  }, [visible, id]);

  if (visible && !item?.isIcon) {
    return (
      <GenericButton
        id={`${item?.key}-button`}
        onClick={onClick}
        variant={id === item?.key ? 'contained' : 'text'}
        color={'secondary'}
        styles={id === item?.key ? { borderRadius: '9px' } : {}}
        ariaLabel={translate(item?.key, { ns: namespace, lng: selectedLanguage })}
        ariaHasPopup={false}
        size={'small'}
      />
    );
  }

  if (item?.isIcon) {
    return (
      <GenericIconButton
        id={`${item?.key}-info-btn`}
        testId={`${item?.key}-info-btn`}
        label={translate('info', { ns: COMMON, lng: selectedLanguage })}
        ariaLabel={translate('info', { ns: COMMON, lng: selectedLanguage })}
        ariaDescription={translate('info', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        })}
        ariaExpanded={open || false}
        onClick={onClick}
        icon={<AssetByType input="icons" name="InfoRounded" />}
      />
    );
  }

  return null;
};

export default SidePanelInfoInstance;
