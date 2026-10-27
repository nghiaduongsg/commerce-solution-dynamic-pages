export default interface FormatTextProps {
  id: string;
  value: string | JSX.Element;
  type?: string;
  relatedCodelist?: string;
  relatedColumnValue?: string;
  defaultSymbol?: string;
  bold?: boolean;
  color?: string;
  metadata?: {
    codelist?: string;
    suffixCodelist?: string;
    value?: string;
    showCode?: boolean;
  };
}
