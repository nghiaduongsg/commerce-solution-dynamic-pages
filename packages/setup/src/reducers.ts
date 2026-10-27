import systemReducer, { slice as System } from './system/reducers';
import menuReducer, { slice as Menu } from './menu/reducers';
import userSettingsReducer, { slice as UserSettings } from './userSettings/reducers';
import userReducer, { slice as LoggedInUser } from './user/reducers';
import partyRoleReducer, { slice as LoggedInPartyRole } from './partyRole/reducers';
import serverEventsReducer, { slice as ServerEvents } from './serverEvents/reducers';

export default {
  [System]: systemReducer,
  [Menu]: menuReducer,
  [UserSettings]: userSettingsReducer,
  [LoggedInUser]: userReducer,
  [LoggedInPartyRole]: partyRoleReducer,
  [ServerEvents]: serverEventsReducer,
};
