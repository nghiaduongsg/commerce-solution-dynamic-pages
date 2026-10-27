export type CaseScopeSummaryType = {
  [_: string]: CaseScopeSummaryItemType;
};

export type CaseScopeSummaryItemType = {
  list: Array<{
    billSegment: { id: string; identificationLabel: string };
    included: boolean;
    percentage: number;
    maxAmount: number;
  }>;
  percentage: number;
  code: string;
  description: string;
  periods: Array<{ startDate: string; endDate: string; percentage: number; maxAmount: number }>;
};
