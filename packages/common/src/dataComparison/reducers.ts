import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { DataDiffsState, SetDiffsAction } from './types';
import { createSlice } from '@reduxjs/toolkit';
import { CallApi } from '@pkg-core/apiData/redux/reducers';
import { unwrapEntityDataArea } from '@pkg-entity/utils/utils';
import { compareForms } from '@pkg-entity/utils/comparisonUtils';

const initialState: DataDiffsState = {};

export const slice = 'DataDiffs';

const DataDiffsSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    SetDiffs: (state: DataDiffsState, action: { type: string; payload: SetDiffsAction }) => {
      const { diffs } = action.payload || {};
      Object.keys(diffs || {}).forEach((key) => (state[key] = diffs[key]));
    },
    ClearDiffs: (state: DataDiffsState) => {
      Object.keys(state || {}).forEach((key) => (state[key] = undefined));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(SYSTEM_CLEAR, (state) => {
        Object.keys(state || {}).forEach((key) => (state[key] = undefined));
      })
      // @ts-ignore
      .addCase(CallApi.fulfilled, (state, action) => {
        const { payload } = action;
        const { data, metadata } = payload || {};
        const { saveAs, replacementValues } = metadata || {};

        if (saveAs === 'DATA_COMPARISON') {
          const pageId = 'FormDefinition';
          let prev;
          let current;

          if (Array.isArray(data?.content)) {
            const forms = data.content;
            const formId = replacementValues?.formId;
            const comparedFormId = replacementValues?.comparedFormId;

            const currentForm = forms.find((f) => f?.id === formId) || forms[0];
            const comparedForm = forms.find((f) => f?.id === comparedFormId) || forms[1];

            prev = unwrapEntityDataArea(comparedForm);
            current = unwrapEntityDataArea(currentForm);
          } else {
            const versions = Object.values(data);

            // @ts-ignore
            const v1Timestamp = new Date(versions[0]?.lastUpdateTimestamp).getTime();
            // @ts-ignore
            const v2Timestamp = new Date(versions[1]?.lastUpdateTimestamp).getTime();

            const unwrappedV1 = unwrapEntityDataArea(versions[0]);
            const unwrappedV2 = unwrapEntityDataArea(versions[1]);

            prev = v2Timestamp > v1Timestamp ? unwrappedV1 : unwrappedV2;
            current = v2Timestamp > v1Timestamp ? unwrappedV2 : unwrappedV1;
          }

          const diffsObject = compareForms(prev, current, pageId);
          const diffs = diffsObject.diffs;
          Object.keys(diffs || {}).forEach((key) => (state[key] = diffs[key]));
        }
      });
  },
});

export const { SetDiffs, ClearDiffs } = DataDiffsSlice.actions;

export default DataDiffsSlice.reducer;
