import type * as React from 'react';

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type IntrinsicClassElements = React.JSX.IntrinsicClassElements;
  }
}

export {};
