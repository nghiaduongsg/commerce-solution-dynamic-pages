import React from 'react';
import { ObjectFieldTemplateProps } from './ObjectFieldTemplate.d';
import DynamicFormGroups from '@pkg-form/groups/DynamicFormGroups';
import { COMMON } from '@pkg-constants/translationNamespaces';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useFieldServerValidations from '@pkg-form/validations/hooks/useFieldServerValidations';
import useDiffs from '@pkg-common/dataComparison/useDiffs';
import DynamicSubformItem from '@pkg-form/templates/ArrayItem/DynamicSubformItem';
import { getWidgetNameFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const { idSchema, properties, uiSchema, schema, formContext, formData } = props;
  const { disableGrouping = false, namespace, onChange } = formContext;
  const fieldId = idSchema.$id;
  const { errors: serverErrors } = useFieldServerValidations(fieldId);
  const { diffs } = useDiffs();
  const { isFieldDirty } = useFormManagerContext();
  const dirty = isFieldDirty(fieldId);

  const options = uiSchema['ui:options'];
  const { subform } = options ?? {};
  const propertyName = getWidgetNameFromWidgetId(fieldId);
  const uiSchemaOptions = {
    columns: {
      xs: 12,
      sm: 12,
      md: 6,
      lg: 7,
      xl: 8,
    },
    arrayColumns: {
      xs: 12,
      sm: 12,
      md: 6,
      lg: 7,
      xl: 8,
    },
  };
  if (subform && (subform.type === 'ELEMENTS' || subform.type === 'BANK_ELEMENTS')) {
    return (
      <DynamicSubformItem
        id={fieldId}
        subform={subform}
        disabled={false}
        namespace={namespace}
        schema={schema}
        uiSchema={{ ...uiSchema, 'ui:options': {} }}
        formContext={{
          ...(formContext as any),
          buttonPosition: 'DEFAULT',
        }}
        formData={formData}
        onChange={onChange ? (data) => onChange({ [propertyName]: data }) : undefined}
        uiSchemaOptions={uiSchemaOptions}
      />
    );
  }

  return (
    <>
      <DynamicFormGroups
        id={fieldId}
        formContext={formContext}
        namespace={namespace || COMMON}
        elements={properties}
        groups={uiSchema['ui:groups']}
        level={1}
        disableGrouping={disableGrouping}
      />
      <ValidationErrors
        id={fieldId}
        clientErrors={[]}
        serverErrors={serverErrors}
        diffs={(diffs || {})[idSchema.$id] || []}
        dirty={dirty}
      />
    </>
  );
};

export default ObjectFieldTemplate;
