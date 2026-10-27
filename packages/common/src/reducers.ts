import buttonPressReducer, { slice as ButtonPress } from './button/reducers';
import dataDiffsReducer, { slice as DataDiffs } from './dataComparison/reducers';
import draggableDrawerReducer, { slice as DraggableDrawer } from './drawer/reducersDraggable';
import drawerReducer, { slice as Drawer } from './drawer/reducers';
import loaderReducer, { slice as Loader } from './loader/reducers';
import notifierReducer, { slice as Notifier } from './notifier/reducers';

export default {
  [ButtonPress]: buttonPressReducer,
  [DataDiffs]: dataDiffsReducer,
  [DraggableDrawer]: draggableDrawerReducer,
  [Drawer]: drawerReducer,
  [Loader]: loaderReducer,
  [Notifier]: notifierReducer,
};
