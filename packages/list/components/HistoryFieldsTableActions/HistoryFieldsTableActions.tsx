import React, { useState, useCallback } from 'react';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useEntity from '@pkg-entity/hooks/useEntity';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import ConfirmationBox from '@pkg-common/components/ConfirmationBox/ConfirmationBox';
import useTable from '@pkg-list/hooks/useTable';
import { resolveRouteInfo } from '@pkg-list/utils/tableRowUtils';
import PopoverMenu from '@pkg-common/atomics/PopoverMenu/PopoverMenu';
import { FORM_DEFINITION_ID } from '@pkg-constants/formIds';
import { REPORTED_FORM_DATA_KEY } from '@pkg-constants/formCommon';
import { HistoryFieldsTableActionsProps } from './HistoryFieldsTableActions.d';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';

const HistoryFieldsTableActions = ({
  tableId,
  rowIdKey,
  rowData,
  actionDetails,
  configuration,
  parentId,
}: HistoryFieldsTableActionsProps): React.ReactNode => {
  const navigate = useNavigate();

  const fieldPath: string | undefined = configuration?.queryParams?.fieldPath as string;
  const saveActionType = configuration?.saveActionType;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const [openHistory, setOpenHistory] = useState(false);
  const [openConfirmationBox, setOpenConfirmationBox] = useState(false);
  //TODO: Remove this Form specific line of code
  const { formData } = useEntityFormData(FORM_DEFINITION_ID);

  const { entityUrl, actionsType, toggleTableFormModal, setTableIsNewForm, deleteTableRow } =
    useTable(tableId);

  const { updateEntity: isUpdateEnabled, deleteEntity: isDeleteEnabled } =
    configuration.actions || {};

  const { redirectLink } = rowData;

  const { deleteEntity } = useEntity(tableId);

  const { setEntityFormData } = useEntityFormData(tableId);

  const onEditOrReadRow = useCallback(
    (data) => {
      setTableIsNewForm(false);
      toggleTableFormModal(true);
      setEntityFormData(data);
    },
    [setEntityFormData, setTableIsNewForm, toggleTableFormModal],
  );

  const onActionClick = useCallback(
    (action: 'edit' | 'read' | 'redirect' | 'duplicate'): void => {
      if (actionsType === 'modal') {
        onEditOrReadRow(rowData);
        return;
      }

      if (redirectLink) {
        navigate(`/${redirectLink}`);
        return;
      }

      const { routePath = '', routeState } = resolveRouteInfo({
        entityId: rowData[rowIdKey],
        row: rowData,
        entityUrl,
        action,
        actionDetails,
      });

      navigate(routePath ?? '', { state: { ...routeState } });
    },
    [actionDetails, actionsType, entityUrl, onEditOrReadRow, rowData, rowIdKey, redirectLink],
  );

  const rowActions: Array<{
    id: string;
    label: string;
    icon: JSX.Element;
    onClick: (param?: any) => void;
  }> = [];

  if (isUpdateEnabled) {
    rowActions.push({
      id: `${tableId}-${rowData[rowIdKey]}-edit-btn`,
      label: translate('edit', { ns: COMMON, lng: selectedLanguage }),
      icon: <AssetByType input="icons" name="Edit" />,
      onClick: () => onActionClick('edit'),
    });
  }

  if (isDeleteEnabled) {
    rowActions.push({
      id: `${tableId}-${rowData[rowIdKey]}-delete-btn`,
      label: translate('delete', { ns: COMMON, lng: selectedLanguage }),
      icon: <AssetByType input="icons" name="Delete" />,
      onClick: () => setOpenConfirmationBox(true),
    });
  }

  if (rowActions.length === 0) {
    return null;
  }

  const deleteLocalTableRowfunc = () => {
    if (fieldPath) {
      const [category, fieldName] = fieldPath.split('.');
      const reported = +(formData?.[REPORTED_FORM_DATA_KEY]?.[category]?.[fieldName] ?? 0);
      deleteTableRow({ rowData, reported });
    }
  };

  return (
    <>
      <PopoverMenu
        id={`history-menu-options`}
        dataTestId={`menu-three-dots-${parentId}-${tableId}-${rowData[rowIdKey]}`}
        label={translate('rowMenuButtonAriaLabel', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
          table: translate(tableId, { ns: COMMON, lng: selectedLanguage }),
        })}
        actions={rowActions}
        ariaDescription={translate('popoverMenuItemAriaDescription', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
        })}
        onOpen={() => setOpenHistory(true)}
        onClose={() => setOpenHistory(false)}
        isOpen={openHistory}
      />
      {isDeleteEnabled && (
        <ConfirmationBox
          open={openConfirmationBox}
          onClose={() => {
            setOpenConfirmationBox(false);
          }}
          title={translate('confirmationDeleteTitle', { ns: COMMON, lng: selectedLanguage })}
          message={translate('confirmationDeleteMessage', { ns: COMMON, lng: selectedLanguage })}
          choices={[
            { label: translate('cancel', { ns: COMMON, lng: selectedLanguage }) },
            {
              label: translate('delete', { ns: COMMON, lng: selectedLanguage }),
              action: () =>
                saveActionType === 'SAVE_LOCALLY'
                  ? deleteLocalTableRowfunc()
                  : deleteEntity && deleteEntity(rowData[rowIdKey]),
            },
          ]}
        />
      )}
    </>
  );
};

export default HistoryFieldsTableActions;
