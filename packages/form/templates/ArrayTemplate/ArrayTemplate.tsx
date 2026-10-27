import React from 'react';

import BasicTemplate from './BasicTemplate/BasicTemplate';
import TreeTemplate from './TreeTemplate/TreeTemplate';
import CardsTemplate from './CardsTemplate/CardsTemplate';
import { ArrayTemplateProps } from './ArrayTemplate.d';
import { AnyType } from '@pkg-common/types';

const defaultItemActions: AnyType = {
  type: 'button',
  buttons: [
    {
      title: 'cardMenu',
      style: 'menu',
      groups: [
        {
          type: 'EDIT',
          title: 'edit',
          icon: 'EDIT',
          style: 'simple',
        },
        {
          type: 'DUPLICATE',
          title: 'duplicate',
          icon: 'DUPLICATE',
          style: 'simple',
        },
        {
          type: 'DELETE',
          title: 'delete',
          icon: 'DELETE',
          style: 'simple',
        },
      ],
    },
  ],
};

const itemViewAction: AnyType = {
  type: 'button',
  buttons: [
    {
      type: 'VIEW',
      icon: 'VIEW',
      style: 'icon',
      title: 'view',
    },
  ],
};

const ArrayTemplate = (props: ArrayTemplateProps) => {
  const arrayType = props.uiSchema['ui:ArrayType'];
  const finalProps = { ...props, defaultItemActions, itemViewAction };

  if (arrayType === 'tree') {
    return <TreeTemplate {...finalProps} />;
  }

  if (arrayType === 'basic') {
    return <BasicTemplate {...props} />;
  }

  return <CardsTemplate {...finalProps} />;
};

export default ArrayTemplate;
