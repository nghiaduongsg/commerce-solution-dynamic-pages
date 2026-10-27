import { ArrayItem } from '@pkg-form/templates/ArrayItem/ArrayItem';

export type ArrayTemplateProps = {
  title: string;
  canAdd: boolean;
  items: Array<ArrayItem>;
  onAddClick: () => void;
};
