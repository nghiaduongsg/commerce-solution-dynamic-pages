import { MenuState } from '@pkg-setup/src/menu/types';

export const selectMainMenuItems = (state: { Menu: MenuState }) => state.Menu.items;
