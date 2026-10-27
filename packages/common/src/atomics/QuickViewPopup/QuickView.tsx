import React, { useEffect } from 'react';
import { AnyType } from '@pkg-common/types';
import { SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { jpValue } from '@pkg-common/dataResolver/utils';
import { Box, Slide } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { hasValue } from '@pkg-common/utils';
import GenericForm from '@pkg-form/components/GenericForm';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';
import { QuickViewConfiguration } from '@pkg-list-types/*';
import { useSystem } from '@pkg-setup/index';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useEntity from '@pkg-entity/hooks/useEntity';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import UiSchemaContext from '@pkg-form/UISchemaContext';

const getDefaultButtons = (tableId: string, idKey: string, url?: string) => {
  return {
    style: 'button',
    buttons: [
      {
        title: 'edit',
        type: 'redirect',
        icon: 'EDIT_LIST_ITEM',
        permissionKey: `ENTITY/${url}/{${idKey}}/PUT`,
        values: {
          url: `/page/${tableId}/${idKey}`,
          replacements: [
            {
              key: `${idKey}`,
              source: {
                code: `${tableId}`,
                jsonPath: [`${idKey}`],
              },
            },
          ],
        },
      },
      {
        type: 'redirect',
        icon: 'LINK',
        title: 'view',
        values: {
          url: `/page/${tableId}/${idKey}?readOnly=true`,
          replacements: [
            {
              key: `${idKey}`,
              source: {
                code: `${tableId}`,
                jsonPath: [`${idKey}`],
              },
            },
          ],
        },
        permissionKey: `ENTITY/${url}/{${idKey}}/GET`,
      },
    ],
  };
};

function QuickView({
  idKey,
  pageId,
  rowData,
  onClose,
  quickView,
  icon,
  url,
}: Readonly<{
  idKey: string;
  pageId: string;
  rowData?: AnyType;
  onClose: () => void;
  quickView: QuickViewConfiguration;
  icon?: string;
  url?: string;
}>) {
  const { schema, uiSchema, 'ui:buttons': buttons, title = [] } = quickView ?? {};

  const rawRecordName = jpValue(rowData, title);
  const cardTitle = rawRecordName ? String(rawRecordName) : '';
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  if (!hasValue(rowData) || !hasValue(rowData[idKey])) return null;

  const quickViewButtons = buttons?.buttons ? buttons : getDefaultButtons(pageId, idKey, url);

  return (
    <Slide in={true} style={{ zIndex: 1200 }}>
      <GenericCard
        id={`${pageId}-quick-view`}
        title={cardTitle}
        icon={icon || 'PermContactCalendarOutlined'}
        resizable
        zIndex={1200}
        actions={
          <GenericIconButton
            id={`quickView-close-btn`}
            testId={`${pageId}-quickView-close-btn`}
            ariaLabel={translate('close', { ns: COMMON, lng: selectedLanguage })}
            ariaDescription={translate('closeAriaDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            onClick={onClose}
            icon={<AssetByType input="icons" name="Close" props={{ className: 'primary' }} />}
          />
        }
        footerActions={
          <AppActions
            page={{ id: pageId, elementId: rowData[idKey], refersTo: rowData[idKey] }}
            actions={quickViewButtons as AppActionButtons}
            checkPermissions={true}
            source={rowData}
          />
        }
      >
        <Box
          sx={{
            '& [class*="MuiGrid"]': {
              maxWidth: '100% !important',
              flexBasis: '100% !important',
            },
          }}
        >
          <QuickViewContentMemo
            idKey={idKey}
            pageId={pageId}
            schema={schema}
            uiSchema={uiSchema}
            rowData={rowData}
          />
        </Box>
      </GenericCard>
    </Slide>
  );
}

export default QuickView;

const QuickViewContent = ({
  pageId,
  schema,
  uiSchema,
  rowData,
  idKey,
}: Readonly<{
  pageId: string;
  schema?: AnyType;
  uiSchema?: AnyType;
  rowData?: AnyType;
  idKey: string;
}>) => {
  const { setEntity } = useEntity(pageId);
  const hasCustomSchema = hasValue(schema) && hasValue(uiSchema);

  useEffect(() => {
    if (hasCustomSchema) {
      setEntity(rowData, { isNew: false, idKey });
    }
  }, [rowData, idKey, hasCustomSchema]);

  if (hasCustomSchema) {
    return (
      <UiSchemaContext.Provider value={uiSchema}>
        <DynamicForm
          id={pageId}
          schema={schema}
          uiSchema={{ ...uiSchema, 'ui:page': { id: pageId, idKey } }}
          data={rowData}
          disabled={true}
          locked={true}
          loading={false}
          formContext={{}}
        />
      </UiSchemaContext.Provider>
    );
  }

  return (
    <GenericForm
      pageId={pageId}
      requestParams={{
        code: pageId,
        screenTypeCL: SINGLE_RECORD_FORM,
      }}
      fallbackSchemas={{}}
      relatedId={rowData[idKey]}
      disabled={true}
      excludeSystemApis={true}
    />
  );
};

const QuickViewContentMemo = React.memo(QuickViewContent, (prev, next) => {
  return prev.rowData?.[prev.idKey] === next.rowData?.[next.idKey];
});
