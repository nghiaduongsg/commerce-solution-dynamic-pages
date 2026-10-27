import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Close, Fullscreen } from '@mui/icons-material';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { useDraggableDrawer } from '@pkg-common/drawer/useDrawer';
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { PageContentProps } from './PageContent.d';
import GenericSimplePage from '@pkg-form/components/GenericSimplePage';
import { FORM_WIZARD_ID, HISTORY, HOME_ID, TODAY } from '@pkg-constants/formIds';
import PageHistoryContent from '@pkg-layout/src/common/PageHistoryContent';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useNavigationGuard from '@pkg-form/validations/hooks/useNavigationGuard';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { useLocation } from 'react-router';

const getStyles = (theme) => ({
  container: {
    width: '100%',
  },
  resizeHandler: {
    backgroundColor: theme.palette.primary.light,
    width: 2,
  },
  content: {
    padding: theme.spacing(4),
  },
  closePanelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '22px',
    color: theme.palette.primary.dark,
    backgroundColor: '#f4fbff',
    borderTopRightRadius: '9px',
    borderTopLeftRadius: '9px',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    border: `1px solid ${theme.palette.primary.light}`,
    borderBottom: 0,
  },
});

const PageContent = ({ pageId, idKey, children, sidePanel = false }: PageContentProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { selectedLanguage, clear } = useSystem();
  const { hasChanges } = useEntityFormData(pageId);
  const { pathname } = useLocation();
  const { clearDirtyFlags } = useFormManagerContext();

  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const draggablePanelRef = useRef<ImperativePanelHandle>(null);
  const { item, setItem } = useDraggableDrawer();

  const isList = useMemo(() => {
    return pathname.indexOf('/list') > 0;
  }, [pathname]);

  const shouldBlockNavigation = useMemo(() => {
    return !isList && pageId !== HOME_ID && pageId !== FORM_WIZARD_ID && hasChanges;
  }, [pageId, hasChanges, isList]);

  useEffect(() => {
    return () => {
      clear();
      clearDirtyFlags(pageId);
    };
  }, [clear, pageId, idKey]);

  useNavigationGuard({
    shouldBlock: shouldBlockNavigation,
    leaveMsg: translate('unsavedChanges', { ns: COMMON, lng: selectedLanguage }),
  });

  // Draggable panel handling
  const draggableItemPageId = useMemo(() => {
    if (!item?.uiSchema) return '';
    return item?.uiSchema['ui:page']?.id || item?.key;
  }, [item]);

  const collapseDraggablePanel = () => {
    const draggablePanel = draggablePanelRef.current;
    const panelGroup = panelGroupRef.current;
    if (draggablePanel) draggablePanel.collapse();
    if (panelGroup) panelGroup.setLayout([99, 1]);
    setItem({ id: 'test', item: null });
  };

  const expandFullDraggablePanel = () => {
    const draggablePanel = draggablePanelRef.current;
    const panelGroup = panelGroupRef.current;
    if (draggablePanel) draggablePanel.expand();
    if (panelGroup) panelGroup.setLayout([1, 99]);
  };

  useEffect(() => {
    const panelGroup = panelGroupRef.current;
    if (panelGroup) {
      panelGroup.setLayout(!!item ? [50, 50] : [99, 1]);
    }
    if (item) {
      window['FORM'] = item.uiSchema?.['ui:page']?.id ?? item.key;
    } else {
      window['FORM'] = pageId;
    }
  }, [item, pageId]);

  const selectedView = useMemo(() => {
    return item?.uiSchema?.callApis?.[0].initiateClone;
  }, [item]);

  return (
    <Box sx={{ marginTop: '50px' }}>
      {!sidePanel && children}
      {sidePanel && (
        <PanelGroup
          autoSaveId={pageId}
          direction="horizontal"
          ref={panelGroupRef}
          id={'panel-group'}
        >
          <Panel defaultSize={99} id={`${pageId}-panel`}>
            <Box
              sx={{
                ...styles.content,
                ...(item && {
                  '& .MuiFormControl-root': {
                    width: '100% !important',
                    minWidth: 0,
                  },
                }),
              }}
            >
              {children ?? null}
            </Box>
          </Panel>
          {item && (
            <PanelResizeHandle
              style={styles.resizeHandler}
              aria-controls={draggableItemPageId || item?.key}
              id={'resize-panel-handler'}
            />
          )}
          <Panel
            defaultSize={1}
            minSize={1}
            ref={draggablePanelRef}
            id={
              draggableItemPageId === pageId
                ? `${item?.key}-panel`
                : `${draggableItemPageId || 'non-visible'}-panel`
            }
          >
            {item && (
              <Box sx={styles.closePanelButton}>
                <Typography>{item?.label || item?.key}</Typography>
                <GenericIconButton
                  id="full-size-draggable-btn"
                  testId="fullSizeDraggableArea"
                  ariaLabel={translate('fullSizeDraggablePanel', {
                    ns: COMMON,
                    lng: selectedLanguage,
                    label: item?.label || item?.key,
                  })}
                  onClick={expandFullDraggablePanel}
                  size="small"
                  icon={<Fullscreen />}
                />
                <GenericIconButton
                  id="close-draggable-btn"
                  testId="closeDraggableArea"
                  ariaLabel={translate('closeDraggablePanel', {
                    ns: COMMON,
                    lng: selectedLanguage,
                    label: item?.label || item?.key,
                  })}
                  ariaExpanded={!!item}
                  onClick={collapseDraggablePanel}
                  size="small"
                  icon={<Close />}
                />
              </Box>
            )}
            {item && (
              <Box
                sx={{
                  ...styles.content,
                  backgroundColor: '#f4fbff',
                  border: `1px solid ${theme.palette.primary.light}`,

                  ...(item && {
                    '& .MuiFormControl-root': {
                      width: '100% !important',
                      minWidth: 0,
                    },
                  }),
                }}
              >
                {(item?.type === HISTORY || selectedView === TODAY) && item?.key && (
                  <PageHistoryContent id={item?.key} />
                )}

                <GenericSimplePage
                  parentPageId={pageId}
                  schema={item?.schema || {}}
                  uiSchema={item?.uiSchema || {}}
                />
              </Box>
            )}
          </Panel>
        </PanelGroup>
      )}
    </Box>
  );
};

export default PageContent;
