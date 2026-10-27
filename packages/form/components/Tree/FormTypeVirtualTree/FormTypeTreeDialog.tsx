import React, { useEffect } from 'react';
import useFormField from '@pkg-entity/hooks/useFormField';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import ActionDialogButtons from '@pkg-common/components/AppActions/ActionDialogButtons';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import useEntity from '@pkg-entity/hooks/useEntity';
import { hasValue } from '@pkg-common/utils';

const M = ({
  id,
  namespace,
  schema,
  uiSchema,
  childrenProperty,
  level,
  disabled,
  action,
  index,
  open,
  onClose,
  formContext,
}) => {
  const { selectedLanguage } = useSystem();

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);

  const { formData } = useEntityFormData(TRANSITION_FORM);
  const { clearEntity } = useEntity(TRANSITION_FORM);

  const { addItem } = useFormField(
    index === -1 ? `${id}` : `${id}_${index}_${childrenProperty}`,
    undefined,
    false,
  );
  const { setFieldValue } = useFormField(
    index === -1 ? `${id}` : `${id}_${index}`,
    undefined,
    false,
  );

  useEffect(() => {
    return () => {
      if (hasValue(formData)) {
        clearEntity();
      }
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <SimpleDialog
      id={id}
      open={open}
      title={translate('addItem', { ns: COMMON, lng: selectedLanguage })}
      fullWidth={true}
      size={'xs'}
      onClose={onClose}
      keepMounted={true}
      buttons={
        !disabled ? (
          <ActionDialogButtons
            id={TRANSITION_FORM}
            onSubmit={() => {
              onClose();

              if (action === 'ADD') {
                const finalData = { ...formData, __STATUS__: 'ADDED' };
                addItem(finalData);
              } else {
                setFieldValue({ ...formData, __STATUS__: 'EDITED' });
              }
            }}
            onCancel={onClose}
            buttons={uiSchema?.['ui:modal:buttons']}
          />
        ) : null
      }
    >
      <DynamicForm
        id={TRANSITION_FORM}
        schema={
          action === 'EDIT' || level > 0 || index === -1
            ? {
                type: 'object',
                properties: {
                  ...schema?.items?.properties,
                  [childrenProperty]: undefined,
                },
              }
            : {
                type: 'object',
                properties: {
                  ...schema?.items?.properties?.[childrenProperty]?.items?.properties,
                  [childrenProperty]: undefined,
                },
              }
        }
        uiSchema={
          action === 'EDIT' || level > 0 || index === -1
            ? {
                ...uiSchema?.items,
                [childrenProperty]: undefined,
              }
            : {
                ...uiSchema?.items?.[childrenProperty]?.items,
                [childrenProperty]: undefined,
              }
        }
        disabled={disabled}
        formContext={formContext}
      />
    </SimpleDialog>
  );
};

export default M;

// export default React.memo(M, (left, right) => left.id === right.id && left.open === right.open);
