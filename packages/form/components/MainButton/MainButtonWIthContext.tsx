import React, { useMemo, useState } from 'react';
import { Box, SpeedDialIcon, SpeedDial, SpeedDialAction, useTheme } from '@mui/material';
import ActionDialogButtons from '@pkg-common/components/AppActions/ActionDialogButtons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { Save } from '@mui/icons-material';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import { GenericTable } from '@pkg-list/components';
import { TableColumnConfiguration } from '@pkg-list/src/types';
import useTable from '@pkg-list/hooks/useTable';

interface MainButtonWIthContextProps {
  id: string;
  entityId: string;
  entityType: string;
  onSubmit: (options?: { contextToken?: string }) => void;
  validateForm: () => boolean;
  styles?: { floatingContainer?: any };
  disabled?: boolean;
}

type Context = {
  contextId: string;
  label: string | null;
  user: {
    id: string;
    identificationLabel: string;
  };
};

const contextConfiguration = (id: string, entityId: string, entityType: string) => {
  const allColumns: TableColumnConfiguration[] = [
    {
      type: 'string',
      name: 'user',
      accessors: ['user', 'identificationLabel'],
      sortBy: 'user',
      align: 'left',
      visible: true,
      truncate: { enabled: false, width: 100, lines: 2 },
    },
    {
      type: 'string',
      name: 'label',
      accessors: ['label'],
      sortBy: 'label',
      align: 'left',
      visible: true,
      truncate: { enabled: true, width: 100, lines: 2 },
    },
    {
      type: 'string',
      name: 'contextId',
      accessors: ['contextId'],
      sortBy: 'contextId',
      align: 'left',
      visible: true,
      truncate: { enabled: true, width: 100, lines: 2 },
    },
    {
      type: 'string',
      name: 'createdDttm',
      accessors: ['createdDttm'],
      sortBy: 'createdDttm',
      align: 'left',
      visible: true,
      truncate: { enabled: true, width: 100, lines: 2 },
    },
  ];

  return {
    'ui:page': {
      url: 'context-store/contexts',
      idKey: 'contextId',
      id: id,
    },
    'ui:labels': {
      namespace: 'case',
    },
    tableId: id,
    title: 'Contexts',
    url: 'context-store/contexts',
    tooltip: '',
    rowId: 'contextId',
    permissionLoadKey: 'ENTITY/context-store/contexts/GET',
    apiValues: {
      url: `context-store/contexts?entityId=${entityId}&entityType=${entityType}&labels=description`,
    },
    selections: {
      enabled: true,
      multiple: false,
    },
    columns: allColumns,
    filterEntities: false,
    openFilters: false,
    pagination: {
      enabled: true,
      pageSizes: [5, 10, 15],
      defaultPageSize: 10,
    },
  };
};

export const MainButtonWIthContext: React.FC<MainButtonWIthContextProps> = ({
  id,
  styles = {},
  onSubmit,
  entityId,
  entityType,
  disabled,
  validateForm,
}) => {
  const theme = useTheme();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);
  const { selectedLanguage, apiUrl } = useSystem();
  const { enqueueSnackbar } = useNotifiers();

  const [openContextModal, setOpenContextModal] = useState(false);
  const { selectedRows } = useTable(id);

  const onSubmitWithContext = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const response = await axios.get(`${apiUrl}/context-store/contexts`, {
        params: {
          entityId,
          entityType,
          labels: ['description'],
          page: 0,
          size: 100,
        },
      });

      const contextsData: Context[] = response.data?.content ?? [];

      if (!contextsData.length) {
        enqueueSnackbar({
          key: Date.now().toString(),
          message: translate('noContextsAvailable', { ns: COMMON, lng: selectedLanguage }),
          severity: 'error',
        });
        return;
      }

      setOpenContextModal(true);
    } catch {
      enqueueSnackbar({
        key: Date.now().toString(),
        message: translate('failedToFetchContexts', { ns: COMMON, lng: selectedLanguage }),
        severity: 'error',
      });
    }
  };

  const onSubmitWithContextConfirm = async () => {
    try {
      const selectedContext = Object.keys(selectedRows).find((key) => selectedRows[key]);

      if (!selectedContext) return;

      const response = await axios.post(`${apiUrl}/sign-context`, {
        contextId: selectedContext,
      });

      const contextToken = response.data?.contextToken;

      await onSubmit({ contextToken });

      setOpenContextModal(false);
    } catch {
      enqueueSnackbar({
        key: Date.now().toString(),
        message: translate('errorSignContext', { ns: COMMON, lng: selectedLanguage }),
        severity: 'error',
        namespace: COMMON,
      });
    }
  };

  const actions = [
    {
      id,
      key: 'simple',
      icon: <Save />,
      label: translate('submit', { ns: COMMON, lng: selectedLanguage }),
      onClick: onSubmit,
    },
    {
      key: 'context',
      icon: <HistoryIcon />,
      label: translate('submitWithContext', { ns: COMMON, lng: selectedLanguage }),
      onClick: onSubmitWithContext,
    },
  ];

  const tableConfiguration = useMemo(
    () => contextConfiguration(id, entityId, entityType),
    [id, entityId, entityType],
  );

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box sx={styles.floatingContainer}>
        <SpeedDial
          ariaLabel={translate('submitOptions', { ns: COMMON, lng: selectedLanguage })}
          FabProps={{ 'data-testid': 'submit-actions-fab' } as any}
          icon={<SpeedDialIcon icon={<SaveIcon />} openIcon={<CloseIcon />} />}
          direction="left"
          color="secondary"
          aria-disabled={disabled}
          data-testid="submit-actions"
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          sx={{
            '& .MuiSpeedDial-actions': {
              width: open ? 'auto' : '0px',
              pointerEvents: open ? 'auto' : 'none',
            },
          }}
        >
          {actions.map(({ id, key, icon, label, onClick }) => (
            <SpeedDialAction
              key={key}
              icon={icon}
              aria-label={label}
              onClick={onClick}
              data-testid={`submit-action-${key}`}
              disabled={disabled}
              slotProps={{
                tooltip: { title: label },
                fab: {
                  id: id ? id : undefined,
                  sx: {
                    bgcolor: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.dark,
                      '& .MuiSvgIcon-root': {
                        color: theme.palette.primary.dark,
                      },
                    },
                  },
                },
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      <SimpleDialog
        id={id}
        open={openContextModal}
        title={translate('selectContextId', { ns: COMMON, lng: selectedLanguage })}
        onClose={() => setOpenContextModal(false)}
        buttons={
          <ActionDialogButtons
            id={`${id}`}
            onSubmit={onSubmitWithContextConfirm}
            onCancel={() => setOpenContextModal(false)}
          />
        }
        fullWidth={true}
        size="lg"
        isSimple={true}
      >
        <GenericTable
          parentId={id}
          configuration={tableConfiguration}
          headerContent={<></>}
          filterSchema={{}}
          filterUiSchema={{}}
        />
      </SimpleDialog>
    </>
  );
};
