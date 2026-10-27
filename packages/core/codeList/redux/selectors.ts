import { createSelector } from 'reselect';
import { CodeListReduxState } from './types';

export const selectAllLists = (state: CodeListReduxState) => state.CodeList.lists;

export const selectLoading = (code: string) =>
  createSelector(selectAllLists, (lists) => !lists[code]);
export const selectList = (code: string) =>
  createSelector(selectAllLists, (lists) => {
    if (lists[code]) {
      return lists[code];
    }

    const dynamicKey = Object.keys(lists).find((key) => key.startsWith(`${code}|`));

    if (dynamicKey) {
      return lists[dynamicKey];
    }

    return [];
  });
export const selectLists = (codes: Array<string>) =>
  createSelector(selectAllLists, (lists) => {
    const codeLists = {};
    codes.forEach((code) => (codeLists[code] = lists[code]));
    return codeLists;
  });
