import { AnyType, AppColors, InfoSchema } from '@pkg-common/types';
import { CSSProperties, ReactNode } from 'react';
import { ChangeIndicatorsSchema } from '@pkg-form/types';
import { SxProps } from '@mui/system';

export interface GenericCardProps {
  id: string;
  testId?: string;
  title: ReactNode;
  showTitle?: boolean;
  expanded?: boolean;
  icon?: string;
  state?: 'DEFAULT' | 'INVALID' | 'SELECTED';
  selectable?: boolean;
  collapsible?: boolean;
  resizable?: boolean;
  actions?: ReactNode;
  footerActions?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  styleOverrides?: {
    card?: CSSProperties;
    cardContent?: CSSProperties;
    cardHeaderText?: CSSProperties;
    cardHeader?: CSSProperties;
    cardHeaderIcon?: CSSProperties;
    cardActions?: CSSProperties;
    cardFooter?: CSSProperties;
    width?: string;
    height?: string;
  };
  cardColors?: Array<AppColors>;
  sticky?: boolean;
  onFocus?: () => void;
  wrapsTable?: boolean;
  information?: Array<InfoSchema>;
  changeIndicators?: ChangeIndicatorsSchema;
  indicatorStatus?: 'ADDED' | 'EDITED';
  onExpanded?: () => void;
  zIndex?: number;
}
