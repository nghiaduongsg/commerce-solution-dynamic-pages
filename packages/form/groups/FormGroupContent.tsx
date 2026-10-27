import React from 'react';
import FormWidgetContainer from '@pkg-form/groups/FormWidgetContainer';
import { DynamicFormGroup, FormContextSchema } from '@pkg-form/types';
import DynamicFormGroups from '@pkg-form/groups/DynamicFormGroups';
import { AnyType } from '@pkg-common/types';

const getOptions = (element) => {
  const uiSchema = element.content.props.uiSchema;
  const options = uiSchema['ui:options'] || {};
  const readonly = uiSchema['ui:readonly'] || false;
  const disabled = uiSchema['ui:disabled'] || false;

  return {
    options,
    readonly,
    disabled,
  };
};

const getColumns = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl', element) => {
  const { options, readonly, disabled } = getOptions(element);
  const arrayColumns = options?.arrayColumns || {};
  const columns = options?.columns || {};

  return (readonly && disabled) || options.treeItemIsInReadMode
    ? arrayColumns[size] || 12
    : columns[size] || 12;
};

const FormGroupContent = ({
  namespace,
  elements,
  group,
  level,
  formContext,
}: {
  namespace: string;
  elements: Array<AnyType>;
  group: DynamicFormGroup;
  level: number;
  formContext: FormContextSchema;
}) => {
  const renderWidgetElement = (code, index) => {
    const widgetElement = (elements || []).find((element) => element.name === code);

    if (widgetElement) {
      const { options, readonly, disabled } = getOptions(widgetElement);

      if (options.visibleInCard === false && disabled && readonly) {
        return (
          <div style={{ display: 'none' }} key={index}>
            {widgetElement.content}
          </div>
        );
      }

      if (options.visibleInTreeReadMode === false && options.treeItemIsInReadMode) {
        return (
          <div style={{ display: 'none' }} key={index}>
            {widgetElement.content}
          </div>
        );
      }

      return (
        <FormWidgetContainer
          namespace={namespace}
          key={widgetElement.name}
          id={widgetElement?.content?.props?.idSchema?.$id}
          xsColumns={getColumns('xs', widgetElement)}
          smColumns={getColumns('sm', widgetElement)}
          mdColumns={getColumns('md', widgetElement)}
          lgColumns={getColumns('lg', widgetElement)}
          xlColumns={getColumns('xl', widgetElement)}
        >
          {widgetElement.content}
        </FormWidgetContainer>
      );
    }

    return null;
  };

  if (group.groups && group.groups.length) {
    return (
      <DynamicFormGroups
        id={`${group.key}-level-${level}`}
        namespace={namespace}
        elements={elements}
        groups={group.groups}
        level={level + 1}
        formContext={formContext}
      />
    );
  }

  if (group.widgets && group.widgets.length) {
    return <>{(group.widgets || []).map((widget, index) => renderWidgetElement(widget, index))}</>;
  }

  return null;
};

export default FormGroupContent;
