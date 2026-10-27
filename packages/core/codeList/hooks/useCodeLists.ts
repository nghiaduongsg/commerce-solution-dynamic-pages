import { useDispatch } from 'react-redux';
import { AddCodeList, ClearCodeLists, LoadCodeList } from '../redux/reducers';
import { useCallback } from 'react';
import { CodeListItem } from '@pkg-common/types';

const useCodeLists = () => {
  const dispatch = useDispatch();

  return {
    loadCodeList: useCallback(
      (
        api,
        code,
        method = 'get',
        jsonPath,
        dataValues,
        queryParams = {},
        alwaysReload = false,
        renderWith = {
          label: ['label'],
          code: ['code'],
        },
        showCode = false,
      ) =>
        dispatch(
          LoadCodeList({
            api,
            code,
            method,
            jsonPath,
            dataValues,
            queryParams,
            alwaysReload,
            renderWith,
            showCode,
          }),
        ),
      [dispatch],
    ),
    clearCodeLists: useCallback(() => dispatch(ClearCodeLists()), [dispatch]),
    addCodeList: useCallback(
      (resourceId: string, data: Array<CodeListItem>) =>
        dispatch(AddCodeList({ resourceId, data })),
      [dispatch],
    ),
  };
};

export default useCodeLists;
