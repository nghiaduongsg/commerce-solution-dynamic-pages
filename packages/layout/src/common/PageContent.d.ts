export type PageContentProps = {
  children?: Array<React.ReactElement | null | false> | React.ReactElement | null;
  pageId: string;
  sidePanel?: boolean;
  idKey?: string;
};
