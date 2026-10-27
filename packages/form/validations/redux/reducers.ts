import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnyType } from '@pkg-common/types';
import { FormValidationsState } from './types';
import {
  CLEAR_ENTITY,
  CLEAR_ENTITY_FORM_DATA,
  SAVE_ENTITY_ERROR,
  SAVE_ENTITY_SUCCESS,
} from '@pkg-entity/redux/actions';
import {
  getBEValidations,
  getBEValidationTypes,
  getBackendValidations,
} from '@pkg-form/validations/utils/validationUtils';
import { CallApi } from '@pkg-core/apiData/redux/reducers';
import { FORM_DEFINITION_ID } from '@pkg-constants/formIds';
import { SAVE_TABLE_DATA_ERROR, SAVE_TABLE_DATA_SUCCESS } from '@pkg-list/src/actions';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { SaveEntityErrorAction } from '@pkg-entity/redux/types';
import { SaveTableDataErrorAction } from '@pkg-list/src/types';
import { REMOVE_ARRAY_FIELD_ITEM } from '@pkg-entity/redux/actions';
import { getWidgetArrayPosition } from '@pkg-form/validations/utils/widgetUtils';

export const slice = 'FormValidations';

const initialState: FormValidationsState = {
  errors: {},
  serverErrors: {},
  serverErrorTypes: {},
  validationStep: null,
};

const validationSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    SetFormServerErrors: (
      state,
      action: PayloadAction<{
        errors: { [key: string]: Array<string> };
        errorTypes: {
          [key: string]: Array<{ message: string; type: 'WARNING' | 'ERROR' }>;
        };
      }>,
    ) => {
      const { errors, errorTypes } = action.payload;
      state.serverErrors = errors;
      state.serverErrorTypes = errorTypes;
    },
    ClearFormServerErrors: (state) => {
      state.serverErrors = {};
      state.serverErrorTypes = {};
    },
    SetValidationStep: (state, action) => {
      state.validationStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    // @ts-ignore
    builder
      // @ts-ignore
      .addCase(SAVE_ENTITY_ERROR, (state, action: PayloadAction<SaveEntityErrorAction>) => {
        const { entityId, error }: SaveEntityErrorAction = action.payload;
        state.serverErrors = getBEValidations(entityId, error?.violations || []);
        state.serverErrorTypes = getBEValidationTypes(entityId, error?.violations || []);
      })
      // @ts-ignore
      .addCase(SAVE_TABLE_DATA_ERROR, (state, action: PayloadAction<SaveTableDataErrorAction>) => {
        const { entityId, error }: any = action.payload;
        state.serverErrors = getBEValidations(entityId, error?.violations); //CHECK WITH EXISTING FUNCTIONALITY
        state.serverErrorTypes = getBEValidationTypes(entityId, error.violations); //CHECK WITH EXISTING FUNCTIONALITY
      })
      .addCase(SAVE_ENTITY_SUCCESS, (state) => {
        state.serverErrors = {};
        localStorage.removeItem('FORM_WIZARD_CONTEXT');
      })
      .addCase(SAVE_TABLE_DATA_SUCCESS, (state) => {
        state.serverErrors = {};
      })
      // @ts-ignore
      .addCase(CLEAR_ENTITY, (state, action: { payload: { entityId: string } }) => {
        const { entityId } = action.payload;
        state.errors = clearEntityRelatedEntries(entityId, state.errors);
        state.serverErrors = clearEntityRelatedEntries(entityId, state.serverErrors);
      })
      // @ts-ignore
      .addCase(CLEAR_ENTITY_FORM_DATA, (state, action: { payload: { entityId: string } }) => {
        const { entityId } = action.payload;
        state.errors = clearEntityRelatedEntries(entityId, state.errors);
        state.serverErrors = clearEntityRelatedEntries(entityId, state.serverErrors);
      })
      .addCase(CallApi.rejected, (state, action) => {
        const { pageId, error } = action.payload;

        const otherErrors = clearEntityRelatedEntries(pageId, state.serverErrors);
        const otherErrorTypes = clearEntityRelatedEntries(pageId, state.serverErrorTypes);

        const beValidations = getBEValidations(pageId, error?.violations);
        const beValidationTypes = getBEValidationTypes(pageId, error?.violations);

        if (Object.keys(beValidations).length > 0) {
          state.serverErrors = {
            ...otherErrors,
            ...beValidations,
          };
        }
        if (Object.keys(beValidationTypes).length > 0) {
          state.serverErrorTypes = {
            ...otherErrorTypes,
            ...beValidationTypes,
          };
        }
      })
      .addCase(CallApi.fulfilled, (state, action) => {
        const { wrapToProperty = '' } = action.meta?.arg || {};
        const { payload } = action;
        const { data, id, pageId, metadata } = payload || {};
        const url = action.meta?.arg.url;
        const skipClearFormServerErrorsOnSuccess = metadata?.skipClearFormServerErrorsOnSuccess;

        const entityId =
          id === FORM_DEFINITION_ID || pageId === FORM_DEFINITION_ID ? FORM_DEFINITION_ID : pageId;

        // Case when api call is related to an inner part of the form, e.g names in Party
        const isPartOfPage = !!getWidgetArrayPosition(id ?? pageId);

        const violationsData = wrapToProperty
          ? data?.[wrapToProperty]?.violationsData
          : data?.violationsData;

        if (violationsData) {
          const { serverErrors, serverErrorTypes } = getBackendValidations({
            entityId,
            violationsData,
            url,
            currentServerErrors: state.serverErrors,
            currentServerErrorTypes: state.serverErrorTypes,
            formData: payload?.data?.formData,
          });

          state.serverErrors = serverErrors;
          state.serverErrorTypes = serverErrorTypes;
          state.errors = {};
        } else if (
          entityId &&
          entityId !== FORM_DEFINITION_ID &&
          !isPartOfPage &&
          !skipClearFormServerErrorsOnSuccess
        ) {
          Object.keys(state.serverErrors).forEach((key) => {
            if (key.startsWith(entityId)) {
              // @ts-ignore
              state.serverErrors[key] = [];
            }
          });
          state.errors = {};
        }
      })
      // @ts-ignore
      .addCase(
        REMOVE_ARRAY_FIELD_ITEM,
        (state, action: { payload: { entityId: string; fieldId: string; index: number } }) => {
          const { fieldId, index } = action.payload;
          const arrayFieldItem = `${fieldId}_${index}`;
          Object.keys(state.errors).forEach((key) => {
            if (key.startsWith(arrayFieldItem)) {
              // @ts-ignore
              state.errors[key] = [];
            }
          });

          state.serverErrors = updateServerErrorsIndex(state.serverErrors, fieldId, index);
          state.serverErrorTypes = updateServerErrorsIndex(state.serverErrorTypes, fieldId, index);
        },
      )
      .addCase(SYSTEM_CLEAR, (state) => {
        state.errors = {};
        state.serverErrors = {};
        state.serverErrorTypes = {};
      });
  },
});

export const { SetFormServerErrors, ClearFormServerErrors, SetValidationStep } =
  validationSlice.actions;

export default validationSlice.reducer;

const clearEntityRelatedEntries = (entityId: string, initial: { [key: string]: AnyType }) => {
  const final = {};
  Object.keys(initial).forEach((fieldId) => {
    if (!fieldId.startsWith(entityId)) {
      final[fieldId] = initial[fieldId];
    }
  });
  return final;
};

const updateServerErrorsIndex = (
  serverErrors: { [key: string]: AnyType },
  fieldPrefix: string,
  removedIndex: number,
): { [key: string]: AnyType } => {
  const serverErrorsUpdate = { ...serverErrors };
  const regex = new RegExp(String.raw`^${fieldPrefix}_(\d+)_(.+)$`);

  Object.keys(serverErrorsUpdate).forEach((key) => {
    const match = new RegExp(regex).exec(key);

    if (match) {
      const index = Number.parseInt(match[1], 10);
      const fieldSuffix = match[2];

      if (index === removedIndex) {
        delete serverErrorsUpdate[key];
      } else if (index > removedIndex) {
        const newIndex = index - 1;
        const newKey = `${fieldPrefix}_${newIndex}_${fieldSuffix}`;

        serverErrorsUpdate[newKey] = serverErrorsUpdate[key];
        delete serverErrorsUpdate[key];
      }
    }
  });

  return serverErrorsUpdate;
};
