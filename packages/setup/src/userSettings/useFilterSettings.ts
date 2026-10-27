import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import {
  selectLastSavedCriteria,
  selectGroupsForTable,
  selectLastSavedGroup,
  selectLastSavedParsedCriteria,
} from './selectors';
import { SetLatestFilterGroup } from './reducers';
import { useCallback } from 'react';
import { equalityCheck } from '@pkg-common/utils/utils';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';

const useFilterSettings = (tableId: string) => {
  const dispatch = useDispatch();

  const { setUserPreferences } = useUserSettings();

  const lastSavedGroup = useSelector(selectLastSavedGroup(tableId), shallowEqual);
  const lastSavedCriteria = useSelector(selectLastSavedCriteria(tableId), equalityCheck);

  return {
    lastSavedParsedCriteria: useSelector(selectLastSavedParsedCriteria(tableId), equalityCheck),
    lastSavedCriteria,
    savedGroups: useSelector(selectGroupsForTable(tableId), equalityCheck),
    lastSavedGroup,
    setLatest: useCallback(
      (groupId: string) => dispatch(SetLatestFilterGroup({ tableId, groupId })),
      [dispatch, tableId],
    ),
    deleteFilterGroup: useCallback(() => {
      setUserPreferences(tableId, 'DELETE', lastSavedGroup);
    }, [setUserPreferences, tableId, lastSavedGroup]),
    saveFilterGroup: useCallback(
      (group: string) => {
        setUserPreferences(tableId, 'UPDATE', group);
      },
      [setUserPreferences, tableId, lastSavedCriteria],
    ),
  };
};

export default useFilterSettings;
