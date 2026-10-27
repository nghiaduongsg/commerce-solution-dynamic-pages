export type IstCheckboxesListProps = {
  options: Array<{ code: string; label: string }>;
  disabledOptions?: Array<string>;
  id: string;
  value: Array<string>;
  multiple: boolean;
  label?: string;
  onChange?: (value: Array<string>) => void;
  errors?: null | JSX.Element;
};
