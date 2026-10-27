/* eslint-disable react/display-name */
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import FormManagerContext from '@pkg-form/FormManagerContext';
import { withTheme } from '@rjsf/core';
import WarningDialog from '@pkg-form/components/WarningDialog/WarningDialog';
import useDynamicFormValidations from '@pkg-form/validations/hooks/useDynamicFormValidations';
import AmountReadOnlyWidget from '@pkg-form/components/AmountWidget/AmountReadOnlyWidget';
import AmountWidget from '@pkg-form/components/AmountWidget/AmountWidget';
import CheckReadOnlyWidget from '@pkg-form/components/CheckWidget/CheckReadOnlyWidget';
import CheckWidget from '@pkg-form/components/CheckWidget/CheckWidget';
import DateAvailabilityIndicatorWidget from '../DateAvailabilityIndicatorWidget/DateAvailabilityIndicatorWidget';
import DateWidget from '@pkg-form/components/DateWidget/DateWidget';
import DateRangeWidget from '@pkg-form/components/DateRangerWidget/DateRangeWidget';
import EntityReadOnlyWidget from '@pkg-form/components/ConfigurableListWidget/EntityReadOnlyWidget';
import ConfigurableListWidget from '@pkg-form/components/ConfigurableListWidget/ConfigurableListWidget';
import MultiLanguageWidget from '@pkg-form/components/MultiLanguageWidget/MultiLanguageWidget';
import SelectCodeListReadOnlyWidget from '@pkg-form/components/SelectCodeListWidget/SelectCodeListReadOnlyWidget';
import SelectCodeListWidget from '@pkg-form/components/SelectCodeListWidget/SelectCodeListWidget';
import TextReadOnlyWidget from '@pkg-form/components/TextWidget/TextReadOnlyWidget';
import ThemeModeWidget from '@pkg-form/components/ThemeModeWidget/ThemeModeWidget';
import TextWidget from '@pkg-form/components/TextWidget/TextWidget';
import SuggestionListWidget from '@pkg-form/components/SuggestionListWidget/SuggestionListWidget';
import LiabilityScopeWidget from '@pkg-form/components/LiabilityScopeWidget/LiabilityScopeWidget';
import ToggleGroupWidget from '@pkg-form/components/ToggleGroupWidget/ToggleGroupWidget';
import FileWidget from '@pkg-form/components/FileWidget/FileWidget';
import YearWidget from '@pkg-form/components/YearWidget/YearWidget';
import YearReadOnlyWidget from '@pkg-form/components/YearWidget/YearReadOnlyWidget';
import DateReadOnlyWidget from '@pkg-form/components/DateWidget/DateReadOnlyWidget';
import RadioWidget from '@pkg-form/components/RadioWidget/RadioWidget';
import SubFormWidget from '@pkg-form/components/SubFormWidget/SubFormWidget';
import AutoCalculatedAmountWidget from '@pkg-form/components/AutoCalculatedAmountWidget/AutoCalculatedAmountWidget';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import HistoryTextField from '@pkg-form/components/HistoryTextField/HistoryTextField';
import MultiLanguageReadOnlyWidget from '@pkg-form/components/MultiLanguageWidget/MultiLanguageReadOnlyWidget';
import DynamicSchemaWidget from '@pkg-form/components/DynamicSchemaWidget/DynamicSchemaWidget';
import DynamicSchemaTableListWidget from '@pkg-form/components/DynamicSchemaTableListWidget/DynamicSchemaTableListWidget';
import LiabilityCaseScopeWidget from '@pkg-form/components/LiabilityCaseScopeWidget/LiabilityCaseScopeWidget';
import { AnyType } from '@pkg-common/types';
import useDiffsComparison from '@pkg-common/dataComparison/useFieldDiffs';
import GroupObjectWidget from '@pkg-form/components/GroupObjectField/GroupObjectWidget';
import ArrayHandler from '@pkg-form/components/ArrayHandler/ArrayHandler';
import ArrayInlineEditingHandler from '@pkg-form/components/ArrayInlineEditingHandler/ArrayInlineEditingHandler';
import SuggestionListReadOnlyWidget from '@pkg-form/components/SuggestionListWidget/SuggestionListReadOnlyWidget';
import DropDownWidget from '@pkg-form/components/SelectCodeListWidget/DropDownWidget';
import TreeHandler from '@pkg-form/components/ArrayHandler/TreeHandler';
import { getFormIdFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import DropDownReadOnlyWidget from '@pkg-form/components/SelectCodeListWidget/DropDownReadOnlyWidget';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import AttachmentsField from '../FileWidget/AttachmentsField';
import CodelistTree from '@pkg-form/components/Tree/CodelistTree/CodelistTree';
import FormTypeVirtualTree from '@pkg-form/components/Tree/FormTypeVirtualTree/FormTypeTreeVirtualised';
import FileReadWidget from '@pkg-form/components/FileWidget/FileReadWidget';
import DssValidationReportWidget from '@pkg-form/components/FileWidget/DssValidationReportWidget';
import IFrameWidget from '@pkg-form/components/IFrameWidget/IFrameWidget';
import CodelistTreeReadOnly from '../Tree/CodelistTree/CodelistTreeReadOnly';
import { hasValue } from '@pkg-common/utils';
import useCheckFromArray from '@pkg-common/dataResolver/useCheckFromArray';
import ArrayHandlerV2 from '@pkg-form/components/ArrayHandler/ArrayHandlerV2';
import GenericDynamicTree from '@pkg-form/components/Tree/GenericDynamicTree/GenericDynamicTree';
import PreSaveAttachmentsField from '../FileWidget/PreSaveAttachmentsField';
import DateRangeReadOnlyWidget from '../DateRangerWidget/DateRangeReadOnlyWidget';

const convertFieldToWidgetProps = (
  props,
  extraOptions: AnyType = {},
  extraSchemaProperties = {},
) => {
  const { uiSchema, idSchema, schema, id: widgetId, formData, value: widgetValue, name } = props;
  const options = (uiSchema || {})['ui:options'];
  const id = widgetId || idSchema?.$id;
  const value = formData || widgetValue;
  const widgetName = (uiSchema || {})['ui:widget'] ?? '';
  const fieldName = (uiSchema || {})['ui:field'] ?? '';
  const widgetButtons = (uiSchema || {})['ui:buttons'];
  const { key, helpText, visibilityFrom, placeholder } = options?.translation || {};
  const {
    key: chameleonKey,
    helpText: chameleonHelpText,
    visibilityFrom: chameleonVisibilityFrom,
    placeholder: chameleonPlaceholder,
  } = extraOptions?.translation || {};

  return {
    ...props,
    schema: { ...schema, ...extraSchemaProperties },
    options: {
      ...options,
      ...extraOptions,
      translation: {
        key: chameleonKey ?? key ?? name,
        helpText: chameleonHelpText ?? helpText,
        visibilityFrom: chameleonVisibilityFrom ?? visibilityFrom,
        placeholder: chameleonPlaceholder ?? placeholder,
      },
      buttons: widgetButtons,
      // FileObjectField should be completely replaced by fileUploader
      obsolete: fieldName === 'FileObjectField',
    },
    id,
    value,
    label: name,
    componentName: widgetName || fieldName,
    buttons: widgetButtons,
  };
};

const getWidgetProps = (props) => {
  const { uiSchema } = props;
  const widgetName = (uiSchema || {})['ui:widget'] ?? '';
  const widgetButtons = (uiSchema || {})['ui:buttons'];

  return {
    ...props,
    componentName: widgetName,
    buttons: widgetButtons,
  };
};

const TransformChameleonToWidget = ({ options, name, props, check }) => {
  if (!hasValue(options) || !check) {
    return null;
  }

  switch (name) {
    case 'NumberWidget':
    case 'PercentageWidget': {
      return {
        Component: customWidgets['TextWidget'],
        props: convertFieldToWidgetProps(props, options, { type: 'number' }),
      };
    }
    case 'IntegerWidget': {
      return {
        Component: customWidgets['TextWidget'],
        props: convertFieldToWidgetProps(props, options, { type: 'integer' }),
      };
    }

    default: {
      const WidgetComponent = customWidgets[name];
      if (!WidgetComponent) {
        console.warn(`Widget ${name} not found in customWidgets`);
        return null;
      }
      return {
        Component: WidgetComponent,
        props: convertFieldToWidgetProps(props, options),
      };
    }
  }
};

const customFields = {
  Chameleon: (props) => {
    const { uiSchema, idSchema } = props;
    const id = idSchema?.$id;

    // Extract all widgets configurations
    const widgetConfigs = Object.entries(uiSchema || {})
      .filter(([key]) => key.startsWith('ui:options:'))
      .map(([optionKey, widgetOptions]: [optionKey: string, widgetOptions: any]) => {
        const widgetName = optionKey.replace('ui:options:', '').replace(/\[\d+\]$/, '');
        return { widgetName, widgetOptions };
      });

    /* Ensure all hooks are called upfront, before any conditional logic, to comply with the Rules of Hooks
     such as call them in the same order on every render. */
    const hookResults = useCheckFromArray(id, widgetConfigs);

    // Try to find a valid widget configuration
    for (const { config, hookResult } of hookResults) {
      const transformed = TransformChameleonToWidget({
        options: config.widgetOptions,
        name: config.widgetName,
        props,
        check: hookResult.check, // Pass the hook result
      });

      if (transformed !== null) {
        const { Component, props: componentProps } = transformed;
        return <Component {...componentProps} />;
      }
    }

    const DefaultWidget = customWidgets.TextWidget;
    return <DefaultWidget {...convertFieldToWidgetProps(props)} />;
  },
  FormTypeTree: (props) => {
    return (
      <WidgetRenderer
        {...convertFieldToWidgetProps(props)}
        widget={FormTypeVirtualTree}
        readOnlyWidget={FormTypeVirtualTree}
      />
    );
  },
  CustomArrayField: (props) => {
    return (
      <WidgetRenderer
        {...convertFieldToWidgetProps(props)}
        widget={SelectCodeListWidget}
        readOnlyWidget={SelectCodeListReadOnlyWidget}
      />
    );
  },
  CustomObjectField: (props) => (
    <WidgetRenderer
      {...convertFieldToWidgetProps(props)}
      widget={ConfigurableListWidget}
      readOnlyWidget={EntityReadOnlyWidget}
    />
  ),
  CustomAmountField: (props) => {
    return (
      <WidgetRenderer
        {...convertFieldToWidgetProps(props)}
        widget={AmountWidget}
        readOnlyWidget={AmountReadOnlyWidget}
      />
    );
  },
  FileObjectField: (props) => (
    <WidgetRenderer
      {...convertFieldToWidgetProps(props)}
      widget={FileWidget}
      readOnlyWidget={FileWidget}
    />
  ),
  FileUploader: (props) => (
    <WidgetRenderer
      {...convertFieldToWidgetProps(props)}
      widget={FileWidget}
      readOnlyWidget={FileWidget}
    />
  ),
  HistoryTextField: (props) => (
    <WidgetRenderer {...convertFieldToWidgetProps(props)} widget={HistoryTextField} />
  ),
  ArrayHandler: (props) => {
    const widgetProps = convertFieldToWidgetProps(props);
    const useV2 = !widgetProps.options?.quickAdd && !widgetProps.options?.groupBy;
    return <WidgetRenderer {...widgetProps} widget={useV2 ? ArrayHandlerV2 : ArrayHandler} />;
  },
  TreeHandler: (props) => (
    <WidgetRenderer {...convertFieldToWidgetProps(props)} widget={TreeHandler} />
  ),
  ArrayInlineEditingHandler: (props) => (
    <WidgetRenderer
      {...convertFieldToWidgetProps(props)}
      widget={ArrayInlineEditingHandler}
      readOnlyWidget={ArrayInlineEditingHandler}
    />
  ),
  GroupObjectField: (props) => (
    <WidgetRenderer {...convertFieldToWidgetProps(props)} widget={GroupObjectWidget} />
  ),
  Attachments: (props) => (
    <WidgetRenderer {...convertFieldToWidgetProps(props)} widget={AttachmentsField} />
  ),
  PreSaveAttachments: (props) => (
    <WidgetRenderer {...convertFieldToWidgetProps(props)} widget={PreSaveAttachmentsField} />
  ),
};

const customWidgets = {
  CodeListTree: (props) => {
    return (
      <WidgetRenderer
        {...getWidgetProps(props)}
        widget={CodelistTree}
        readOnlyWidget={CodelistTreeReadOnly}
      />
    );
  },
  GenericDynamicTree: (props) => {
    return (
      <WidgetRenderer
        {...getWidgetProps(props)}
        widget={GenericDynamicTree}
        readOnlyWidget={GenericDynamicTree}
      />
    );
  },
  DateAvailabilityIndicatorWidget: (props) => {
    return (
      <WidgetRenderer
        {...getWidgetProps(props)}
        widget={DateAvailabilityIndicatorWidget}
        readOnlyWidget={DateAvailabilityIndicatorWidget}
      />
    );
  },
  SelectCodeListWidget: (props) => {
    return (
      <WidgetRenderer
        {...getWidgetProps(props)}
        widget={SelectCodeListWidget}
        readOnlyWidget={SelectCodeListReadOnlyWidget}
      />
    );
  },
  DropDownWidget: (props) => {
    return (
      <WidgetRenderer
        {...getWidgetProps(props)}
        widget={DropDownWidget}
        readOnlyWidget={DropDownReadOnlyWidget}
      />
    );
  },
  MultiLanguageWidget: (props) => {
    const { uiSchema } = props || {};
    const readOnlyMode = (uiSchema || {})['ui:readonly:mode'];

    return readOnlyMode === 'SELECTED_LANGUAGE' ? (
      <WidgetRenderer
        {...getWidgetProps(props)}
        widget={MultiLanguageWidget}
        readOnlyWidget={MultiLanguageReadOnlyWidget}
      />
    ) : (
      <WidgetRenderer
        {...getWidgetProps(props)}
        widget={MultiLanguageWidget}
        readOnlyWidget={MultiLanguageWidget}
      />
    );
  },
  ConfigurableListWidget: (props) => {
    const { selectEnabled } = props?.options?.dependency ?? {};
    const ConfigurableListReadOnlyWidget = selectEnabled
      ? EntityReadOnlyWidget
      : ConfigurableListWidget;
    return (
      <WidgetRenderer
        {...props}
        widget={ConfigurableListWidget}
        readOnlyWidget={ConfigurableListReadOnlyWidget}
      />
    );
  },
  YearWidget: (props) => (
    <WidgetRenderer {...props} widget={YearWidget} readOnlyWidget={YearReadOnlyWidget} />
  ),
  AmountWidget: (props) => (
    <WidgetRenderer {...props} widget={AmountWidget} readOnlyWidget={AmountReadOnlyWidget} />
  ),
  AutoCalculatedAmountWidget: (props) => (
    <WidgetRenderer
      {...props}
      widget={AutoCalculatedAmountWidget}
      readOnlyWidget={AutoCalculatedAmountWidget}
    />
  ),
  RadioWidget: (props) => <WidgetRenderer {...props} widget={RadioWidget} />,
  ToggleGroupWidget: (props) => (
    <WidgetRenderer {...props} widget={ToggleGroupWidget} readOnlyWidget={TextReadOnlyWidget} />
  ),
  LiabilityScopeWidget: (props) => <WidgetRenderer {...props} widget={LiabilityScopeWidget} />,
  LiabilityCaseScopeWidget: (props) => (
    <WidgetRenderer {...props} widget={LiabilityCaseScopeWidget} />
  ),
  SubFormWidget: (props) => <WidgetRenderer {...props} widget={SubFormWidget} />,
  ThemeModeWidget: (props) => <WidgetRenderer {...props} widget={ThemeModeWidget} />,
  TextWidget: (props) => (
    <WidgetRenderer {...props} widget={TextWidget} readOnlyWidget={TextReadOnlyWidget} />
  ),
  PasswordWidget: (props) => <WidgetRenderer {...props} widget={TextWidget} />,
  SuggestionListWidget: (props) => (
    <WidgetRenderer
      {...props}
      widget={SuggestionListWidget}
      readOnlyWidget={SuggestionListReadOnlyWidget}
    />
  ),
  CheckboxWidget: (props) => (
    <WidgetRenderer {...props} widget={CheckWidget} readOnlyWidget={CheckReadOnlyWidget} />
  ),
  DateWidget: (props) => (
    <WidgetRenderer {...props} widget={DateWidget} readOnlyWidget={DateReadOnlyWidget} />
  ),
  DateRangeWidget: (props) => (
    <WidgetRenderer {...props} widget={DateRangeWidget} readOnlyWidget={DateRangeReadOnlyWidget} />
  ),
  DynamicSchemaWidget: (props) => <WidgetRenderer {...props} widget={DynamicSchemaWidget} />,
  DynamicSchemaTableListWidget: (props) => (
    <WidgetRenderer {...props} widget={DynamicSchemaTableListWidget} />
  ),
  FileReadWidget: (props) => <WidgetRenderer {...props} widget={FileReadWidget} />,
  DssValidationReportWidget: (props) => (
    <WidgetRenderer {...props} widget={DssValidationReportWidget} />
  ),
  IFrameWidget: (props) => <WidgetRenderer {...props} widget={IFrameWidget} />,
};

const FormTheme = {
  widgets: customWidgets,
  fields: customFields,
};

const MULTI_LANGUAGE_WIDGET = 'MultiLanguageWidget';

const skipOwnerCL = (id, componentName, entityParentId) => {
  if (componentName === MULTI_LANGUAGE_WIDGET) {
    return true;
  }
  if (
    entityParentId === 'EntitySchema' ||
    entityParentId === 'Codelist' ||
    entityParentId === 'CodelistItem' ||
    entityParentId === 'IssCodelist' ||
    entityParentId === 'IssCodelistItem' ||
    entityParentId === 'SecurableObject'
  ) {
    return true;
  }

  if (entityParentId === 'TranslationsManagement' && id.indexOf('overrideDescription')) {
    return true;
  }

  return !!(
    entityParentId === 'Query' &&
    (id.indexOf('overrideQueryText') ||
      id.indexOf('overrideCountQueryText') ||
      id.indexOf('overrideControlCountQueryText'))
  );
};

function WidgetRenderer({ widget: Widget, readOnlyWidget: ReadOnlyWidget, ...props }) {
  const { id, readonly, disabled, options, onChange, componentName, formContext, label } = props;

  const { formId } = formContext || {};

  const {
    visibleInCard = true,
    preventRender = false,
    warnOnChange,
    disabledFrom,
    visibleInTreeReadMode = true,
    treeItemIsInReadMode,
  } = options || {};

  const { key, helpText, visibilityFrom, placeholder } = options?.translation ?? {};
  options.translation = { key: key ?? label, helpText, visibilityFrom, placeholder };
  const entityParentId = getFormIdFromWidgetId(id);
  const { formData: data } = useEntityFormData(entityParentId);

  const disabledFromOwner = useMemo(() => {
    if (formId?.includes('filters')) {
      return false;
    }
    return data.ownerCL === 'BASE';
  }, [formId, data]);

  const { prevailGlobal } = disabledFrom || {};

  const readonlyTree = Boolean(treeItemIsInReadMode);

  const { check: disabledFromValue } = useCheckFrom(id, disabledFrom);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { errors, errorTypes } = useDynamicFormValidations(
    id,
    componentName === MULTI_LANGUAGE_WIDGET || componentName === 'FormTypeTree',
    false,
  );

  const { diffs } = useDiffsComparison(id);

  const onChangeRef = useRef(onChange);

  const isRootDisabled = disabled || disabledFromValue;

  const hideServerErrors = Boolean(formContext?.hideServerErrors);

  const widgetProps = {
    ...props,
    id,
    diffs,
    serverErrors: hideServerErrors ? [] : errors,
    serverErrorTypes: hideServerErrors ? {} : errorTypes,
    disabled:
      skipOwnerCL(id, componentName, entityParentId) || prevailGlobal
        ? isRootDisabled
        : isRootDisabled || disabledFromOwner,
    onChange: onChangeRef.current,
  };

  const readMode =
    skipOwnerCL(id, componentName, entityParentId) || prevailGlobal
      ? isRootDisabled
      : isRootDisabled || disabledFromOwner || readonly || readonlyTree;

  const formManager = useContext(FormManagerContext);

  useEffect(() => {
    formManager?.registerReadOnlyField(id, readMode);
    return () => {
      formManager?.registerReadOnlyField(id, false);
    };
  }, [readMode, id, formManager]);

  const visibleInReadMode = visibleInCard || visibleInTreeReadMode;

  if (readMode && !visibleInReadMode) {
    return preventRender ? null : (
      <div style={{ display: 'none', height: 0 }}>
        <Widget {...widgetProps} />
      </div>
    );
  }

  if (readMode && visibleInReadMode && ReadOnlyWidget) {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ marginTop: 4, marginBottom: 4 }}>
          <ReadOnlyWidget {...widgetProps} />
        </div>
      </div>
    );
  }

  if (!readMode && warnOnChange?.enabled) {
    return <WarningDialog widget={Widget} widgetProps={widgetProps} />;
  }
  return <Widget {...widgetProps} />;
}

const Form = withTheme(FormTheme) as AnyType;

export default Form;
