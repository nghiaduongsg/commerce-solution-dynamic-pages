import React from 'react';

import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import { SubFormWidgetProps } from './SubFormWidget.d';

const SubFormWidget = ({ id, options }: SubFormWidgetProps) => {
  const { schema, uiSchema } = options;
  return <DynamicForm id={id} schema={schema || {}} uiSchema={uiSchema || {}} />;
};

export default React.memo(SubFormWidget, (prev, next) => {
  return prev.id === next.id && JSON.stringify(prev.options) === JSON.stringify(next.options);
});
