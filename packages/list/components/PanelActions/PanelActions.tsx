import React, { useCallback } from 'react';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import Wrapper from '@pkg-common/components/Wrapper';
import { Menu } from '@pkg-common/components/Menu/Menu';
import useTable from '@pkg-list/hooks/useTable';
import useEntity from '@pkg-entity/hooks/useEntity';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { ADD_ITEM_TO_LIST_SHORTCUT } from '@pkg-constants/keyboardShortcuts';

function PanelActions({
  actions,
  actionDetails,
  tableId = '',
  entityUrl = '',
  baseDataTestId = tableId,
  actionDetailsList,
  actionDetailsCodeList,
  actionDetailsUrl,
  buttons,
  namespace,
}) {
  const navigate = useNavigate();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);

  const { toggleTableFormModal, actionsType, setTableIsNewForm } = useTable(tableId);
  const { clearEntity } = useEntity(tableId);
  const { clearEntityFormData } = useEntityFormData(tableId);

  const onAddClicked = useCallback(() => {
    if (actionsType === 'modal') {
      clearEntity();
      setTableIsNewForm(true);
      toggleTableFormModal(true);
      clearEntityFormData();
    } else {
      navigate(`${entityUrl}`);
    }
  }, [actionsType, clearEntity, entityUrl, navigate, setTableIsNewForm, toggleTableFormModal]);

  const addButton = actions?.createEntity;

  const hasMultipleActions =
    actionDetails?.createEntity?.routes && actionDetails?.createEntity?.routes.length > 0;

  return !actionDetailsCodeList ? (
    <Wrapper
      condition={hasMultipleActions}
      wrapper={(children: JSX.Element[]) => (
        <Menu
          id={tableId}
          label={translate('addButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
          })}
          styles={{ display: 'inline-block' }}
        >
          {children}
        </Menu>
      )}
    >
      <AppActions page={{ id: tableId }} actions={buttons} checkPermissions={true} />
      {!buttons &&
        addButton &&
        hasMultipleActions &&
        actionDetails.createEntity.routes.map((route: string, idx: string) => (
          <Link
            to={`${entityUrl}/${route ?? ''}`}
            key={idx}
            id={`${tableId}-add-btn`}
            data-testid={`${baseDataTestId}-add-btn`}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#000',
            }}
            aria-label={translate('addButtonAriaLabel', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
              table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
            })}
          >
            <AssetByType input="icons" name="AddCircle" />
            <span style={{ marginLeft: '1rem' }}>{route}</span>
          </Link>
        ))}
      {!hasMultipleActions && !buttons && addButton && (
        <GenericIconButton
          id={`${tableId}-add-btn`}
          testId={`${baseDataTestId}-add-btn`}
          ariaLabel={translate('addButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
          })}
          onClick={onAddClicked}
          ariaKeyboardShortcuts={ADD_ITEM_TO_LIST_SHORTCUT}
          icon={<AssetByType input="icons" name="AddCircle" />}
          ariaHasPopup={actionsType === 'modal'}
        />
      )}
    </Wrapper>
  ) : (
    <Wrapper
      condition={actionDetailsCodeList}
      wrapper={(children) => (
        <Menu
          id={tableId}
          label={translate('addButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
          })}
          styles={{ display: 'inline-block' }}
        >
          {children}
        </Menu>
      )}
    >
      <AppActions page={{ id: tableId }} actions={buttons} checkPermissions={true} />
      {actionDetailsList?.map((el, idx) => (
        <Link
          to={`${actionDetailsUrl}?subType=${el['code'] ?? ''}`}
          key={idx}
          id={`${tableId}-add-btn`}
          data-testid={`${baseDataTestId}-add-btn`}
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#000',
          }}
          aria-label={translate('addButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
          })}
        >
          <AssetByType input="icons" name="AddCircle" />
          <span style={{ marginLeft: '1rem' }}>{el['label']}</span>
        </Link>
      ))}
    </Wrapper>
  );
}

export default PanelActions;
