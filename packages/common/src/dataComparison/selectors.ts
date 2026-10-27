import { createSelector } from 'reselect';
import { DataDiffsState } from './types';

export const selectDiffs = (state: { DataDiffs: DataDiffsState }) => state.DataDiffs || {};

export const selectParentDiffs = (parentField: string) =>
  createSelector(selectDiffs, (diffs) => {
    const values = Object.keys(diffs)
      .filter((key) => key.startsWith(parentField))
      .map((field) => diffs[field]);
    const uniqueValues = Array.from(new Set(values));
    return uniqueValues.length > 0 ? uniqueValues[0] : undefined;
  });

export const selectHasDiffs = (parentField: string) =>
  createSelector(selectDiffs, (diffs) => {
    return (
      Object.keys(diffs)
        .filter((key) => key.startsWith(parentField))
        .map((field) => (diffs[field]?.length ?? 0) > 0)
        .filter((hasInfo) => hasInfo === true).length > 0
    );
  });
