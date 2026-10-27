import type { ApiValuesSchema, AnyType } from '@pkg-common/types';

export type GenericTreeOptions = {
  apiValues: ApiValuesSchema;
  displayProps: string[];
  parentParam?: string;
  pageParam?: string;
  sizeParam?: string;
  pageSize?: number;
  idProp?: string;
  hasChildrenProp?: string;
  truncate?: { enabled: boolean };
  assumeChildrenWhenMissingHasChildren?: boolean;
};

export type GenericTreeNodeProps = {
  widgetId: string;
  options: GenericTreeOptions;
  node: AnyType;
  level: number;
};

export type GenericTreeNodeContentProps = {
  options: GenericTreeOptions;
  node: AnyType;
  level: number;
  open: boolean;
  onToggle: () => void;
};
