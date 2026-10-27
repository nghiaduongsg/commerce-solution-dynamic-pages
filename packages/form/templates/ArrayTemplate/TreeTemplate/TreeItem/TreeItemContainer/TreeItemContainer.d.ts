import React, { ReactNode } from 'react';
import { ChangeIndicatorsSchema, DataSourceSchema } from '@pkg-form/types';
import {
  ActionButtonType,
  ActionButtonTypes,
  AppActionButtons,
} from '@pkg-common/components/AppActions/types';

export type ContentActions = Array<{
  id: string;
  icon: React.ReactElement;
  name: string;
  onClick: () => void;
}>;

type TreeItemContainerProps = {
  id: string;
  depth: number;
  children: ReactNode;
  isCollapsed: boolean;
  displayExpandCollapseIcon: boolean;
  onClickExpandCollapseIcon: () => void;
  buttons?: AppActionButtons;
  hasError: boolean;
  infoValue?: Array<DataSourceSchema>;
  entityTitle?: string;
  defaultActions: {
    // @ts-ignore
    [_: ActionButtonTypes]: ActionButtonType;
  };
  changeIndicators?: ChangeIndicatorsSchema;
  indicatorStatus?: 'ADDED' | 'EDITED';
  manuallyAdded?: boolean;
  onButtonPress?: () => void;
  onArrowClick?: (direction: string) => void;
  isFirst: boolean;
  isLast: boolean;
};

export default TreeItemContainerProps;
