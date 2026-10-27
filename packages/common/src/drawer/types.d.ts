import { AnyType } from '@pkg-common/types';

export type DraggableDrawerItemType = {
  key: string;
  uiSchema: AnyType;
  schema: AnyType;
  label?: string;
  type?: string;
};

export type DraggableDrawerState = {
  id: string | null;
  item: DraggableDrawerItemType | null;
};

export type DrawerState = { [key: string]: boolean };

export type UseDrawerType = {
  open: boolean;
  openUniqueDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};
