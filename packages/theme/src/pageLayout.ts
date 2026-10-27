import { SystemStyleObject, Theme } from '@mui/system';

export const PAGE_LAYOUT = {
  maxWidth: 1284,
  tabletMinWidth: 641,
  desktopMinWidth: 1367,
  largeDesktopMinWidth: 1920,
  tabletPadding: 24,
  desktopPadding: 20,
  gap: 16,
  tabletColumns: 8,
  desktopColumns: 12,
} as const;

export type PageLayoutType = typeof PAGE_LAYOUT;

export const pageContainerSx: SystemStyleObject<Theme> = {
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: PAGE_LAYOUT.maxWidth,
  marginInline: 'auto',
  [`@media (min-width: ${PAGE_LAYOUT.tabletMinWidth}px)`]: {
    paddingLeft: `${PAGE_LAYOUT.tabletPadding}px`,
    paddingRight: `${PAGE_LAYOUT.tabletPadding}px`,
  },
  [`@media (min-width: ${PAGE_LAYOUT.desktopMinWidth}px)`]: {
    paddingLeft: `${PAGE_LAYOUT.desktopPadding}px`,
    paddingRight: `${PAGE_LAYOUT.desktopPadding}px`,
  },
};
