import { DataSourceSchema, AnyType } from '@pkg-form/types';

export type DateAvailabilityIndicatorWidgetProps = {
  showDates?: boolean;
  showWeekDays?: boolean;
  orientation?: 'vertical' | 'horizontal';
  statuses: Array<{
    status: string;
    icon: string;
    color?: string;
    iconStyles?: React.CSSProperties;
  }>;
};
