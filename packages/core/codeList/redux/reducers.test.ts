import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import CodeListReducer, {
  LoadCodeList,
  CODELIST_LOAD_FULFILLED,
  CODELIST_LOAD_PENDING,
  CODELIST_LOAD_REJECTED,
  LoadCodeLists,
} from './reducers';
import i18n from 'i18next';

import { CodeListItem } from '@pkg-core/codeList/redux/types';
import { CURRENCIES, LANGUAGES, SYSTEM_PARAMETERS } from '@pkg-constants/codeListVariables';
import { CallApi } from '@pkg-core/apiData/redux/reducers';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';

jest.mock('axios');
jest.mock('i18next', () => ({ addResources: jest.fn(), language: 'en' }));

const mockedAxios = axios as unknown as jest.Mock;
const mockDomain = 'https://api';
const systemReducer = (state = { apiUrl: mockDomain, themes: [] } as any) => state;

describe('async thunk test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('loads and stores codelist on success', async () => {
    mockedAxios.mockResolvedValue({ data: [{ code: 'A', label: 'Alpha' }] });

    const store = configureStore({
      reducer: { CodeList: CodeListReducer, System: systemReducer },
    });

    await store.dispatch(LoadCodeList({ code: 'TEST', api: 'codelist/test' }));

    const lists = (store.getState() as any).CodeList.lists;

    expect(lists.TEST).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'A', label: 'Alpha' })]),
    );

    expect(mockedAxios).toHaveBeenCalled();
    const calledWith = mockedAxios.mock.calls[0][0];
    expect(calledWith.url).toBe(`${mockDomain}/codelist/test`);
  });

  test('does not fetch when codelist already present and not alwaysReload', async () => {
    mockedAxios.mockImplementation(() => {
      throw new Error('should not be called');
    });

    const preloadedState = {
      CodeList: {
        lists: { EXIST: [{ code: 'X', label: 'X' }] },
        loading: false,
        componentValueType: {},
      },
      System: { apiUrl: mockDomain, themes: [] },
    };

    const store = configureStore({
      reducer: { CodeList: CodeListReducer, System: systemReducer },
      preloadedState,
    });

    await store.dispatch(LoadCodeList({ code: 'EXIST', api: 'should/not/be/called' }));

    const lists = (store.getState() as any).CodeList.lists;
    expect(lists.EXIST).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'X' })]));
    expect(mockedAxios).not.toHaveBeenCalled();
  });

  test('removes loading and does not persist list on failure', async () => {
    mockedAxios.mockRejectedValue(new Error('network error'));

    const store = configureStore({
      reducer: { CodeList: CodeListReducer, System: systemReducer },
    });

    await store.dispatch(LoadCodeList({ code: 'FAIL', api: 'codelist/fail' }));

    const lists = (store.getState() as any).CodeList.lists;
    expect(lists.FAIL).toBeUndefined();
    expect((store.getState() as any).CodeList.loading).toBe(false);
  });

  test('reload codelist when alwaysReload is enabled', async () => {
    mockedAxios.mockResolvedValue({ data: [{ code: 'A', label: 'Alpha' }] });

    const preloadedState = {
      CodeList: {
        lists: { EXIST: [{ code: 'X', label: 'X' }] },
        loading: false,
        componentValueType: {},
      },
      System: { apiUrl: mockDomain, themes: [] },
    };

    const store = configureStore({
      reducer: { CodeList: CodeListReducer, System: systemReducer },
      preloadedState,
    });

    await store.dispatch(LoadCodeList({ code: 'EXIST', api: 'codelist/test', alwaysReload: true }));

    const lists = (store.getState() as any).CodeList.lists;

    expect(lists.EXIST).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'A', label: 'Alpha' })]),
    );

    expect(mockedAxios).toHaveBeenCalled();
    const calledWith = mockedAxios.mock.calls[0][0];
    expect(calledWith.url).toBe(`${mockDomain}/codelist/test`);
  });
});

describe('CodeList Reducer', () => {
  it('should return the defaultState when parameter state is undefined and no action is passed', () => {
    const expected = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    expect(CodeListReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should return the parameter state when no action is passed', () => {
    const state = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    expect(CodeListReducer(state, { type: '' })).toEqual(state);
  });

  it(CODELIST_LOAD_PENDING, () => {
    const state = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: CODELIST_LOAD_PENDING,
      meta: {
        arg: {
          code: 'TestCode',
        },
      },
    };

    const expected = {
      lists: {
        TestCode: [
          {
            code: 'LOADING',
            label: 'LOADING',
            attributes: [],
          },
        ],
      },
      loading: true,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it(CODELIST_LOAD_FULFILLED, () => {
    const state = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: CODELIST_LOAD_FULFILLED,
      payload: {
        code: 'Test Code',
        list: [
          {
            code: 'code3',
            label: 'String 3',
          },
          {
            code: 'String 1',
          },
          {
            code: 'code2',
            label: 'String 4',
          },
          {
            code: 'code4',
            label: 'String 4',
          },
        ],
      },
    };

    const expected = {
      ...state,
      loading: false,
      lists: {
        'Test Code': [
          {
            code: 'String 1',
          },
          {
            code: 'code3',
            label: 'String 3',
          },
          {
            code: 'code2',
            label: 'String 4',
          },
          {
            code: 'code4',
            label: 'String 4',
          },
        ],
      },
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it(`${CODELIST_LOAD_FULFILLED} sorts items with special characters correctly`, () => {
    const state = {
      lists: {},
      loading: false,
      componentValueType: {},
    };
    const action = {
      type: CODELIST_LOAD_FULFILLED,
      payload: {
        code: 'SPECIAL_CHARS',
        list: [
          { code: 'A', label: 'Ž' },
          { code: 'B', label: 'Ą' },
          { code: 'C', label: 'Č' },
          { code: 'D', label: 'A' },
          { code: 'E', label: 'B' },
          { code: 'F', label: 'C' },
          { code: 'G', label: 'Š' },
          { code: 'H', label: 'Ū' },
        ],
      },
    };
    // Expected order: A, Ą, B, C, Č, Š, Ū, Ž
    const expected = {
      ...state,
      loading: false,
      lists: {
        SPECIAL_CHARS: [
          { code: 'D', label: 'A' },
          { code: 'B', label: 'Ą' },
          { code: 'E', label: 'B' },
          { code: 'F', label: 'C' },
          { code: 'C', label: 'Č' },
          { code: 'G', label: 'Š' },
          { code: 'H', label: 'Ū' },
          { code: 'A', label: 'Ž' },
        ],
      },
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it(`${CODELIST_LOAD_FULFILLED} sorts differently based on locale`, () => {
    const state = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: CODELIST_LOAD_FULFILLED,
      payload: {
        code: 'LOCALE_TEST',
        list: [
          { code: 'A', label: 'zoo' },
          { code: 'B', label: 'äpple' },
        ],
      },
    };

    // German locale: ä sorts before z
    i18n.language = 'de';
    const germanResult = CodeListReducer(state, action);
    expect((germanResult as any).lists.LOCALE_TEST[0].code).toBe('B');

    // Swedish locale: ä sorts after z
    i18n.language = 'sv';
    const swedishResult = CodeListReducer(state, action);
    expect((swedishResult as any).lists.LOCALE_TEST[0].code).toBe('A');
  });

  it(CODELIST_LOAD_REJECTED, () => {
    const state = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: CODELIST_LOAD_REJECTED,
      payload: {
        code: 'Test Code',
        list: [],
      },
    };

    const expected = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it(LoadCodeLists.pending, () => {
    const state = {
      lists: {},
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: LoadCodeLists.pending,
      payload: {
        api: 'some/url',
        lists: ['A', 'B'],
      },
    };

    const expected = {
      lists: {},
      loading: true,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it(LoadCodeLists.fulfilled, () => {
    const state = {
      lists: {
        C: [{ code: '4', label: '4' }],
      },
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: LoadCodeLists.fulfilled,
      payload: {
        A: [{ code: '1', label: '1' }],
        B: [
          { code: '2', label: '2' },
          { code: '3', label: '3' },
        ],
      },
    };

    const expected = {
      lists: {
        C: [{ code: '4', label: '4' }],
        A: [{ code: '1', label: '1' }],
        B: [
          { code: '2', label: '2' },
          { code: '3', label: '3' },
        ],
      },
      loading: false,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it('CodeList/AddCodeList', () => {
    const codelistA = [
      {
        code: 'codeA1',
        label: 'A1',
      },
      {
        code: 'codeA2',
        label: 'A2',
      },
    ] as Array<CodeListItem>;

    const codelistB = [
      {
        code: 'codeB1',
        label: 'B1',
      },
    ] as Array<CodeListItem>;

    const state = {
      lists: {
        A: codelistA,
      },
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: 'CodeList/AddCodeList',
      payload: {
        resourceId: 'B',
        data: codelistB,
      },
    };

    const expected = {
      lists: {
        A: codelistA,
        B: codelistB,
      },
      loading: false,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it('CodeList/ClearCodelists', () => {
    const state = {
      lists: {
        other: [{ code: 'A', label: 'A' }],
        another: [{ code: 'A', label: 'A' }],
        [SYSTEM_PARAMETERS]: [{ code: 'A', label: 'A' }],
        [CURRENCIES]: [{ code: 'EUR', label: 'Euro' }],
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
      },
      loading: false,
      componentValueType: { test: 'other' },
    };

    const action = {
      type: 'CodeList/ClearCodeLists',
    };

    const expected = {
      lists: {
        [SYSTEM_PARAMETERS]: [{ code: 'A', label: 'A' }],
        [CURRENCIES]: [{ code: 'EUR', label: 'Euro' }],
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
      },
      loading: false,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it(SYSTEM_CLEAR, () => {
    const state = {
      lists: {
        other: [{ code: 'A', label: 'A' }],
        another: [{ code: 'A', label: 'A' }],
        [SYSTEM_PARAMETERS]: [{ code: 'A', label: 'A' }],
        [CURRENCIES]: [{ code: 'EUR', label: 'Euro' }],
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
      },
      loading: false,
      componentValueType: { test: 'another' },
    };

    const action = {
      type: SYSTEM_CLEAR,
    };

    const expected = {
      lists: {
        [SYSTEM_PARAMETERS]: [{ code: 'A', label: 'A' }],
        [CURRENCIES]: [{ code: 'EUR', label: 'Euro' }],
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
      },
      loading: false,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it('ApiData/CallApi/fulfilled', () => {
    const state = {
      lists: {
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
      },
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        data: [
          { code: 'A', label: 'A', expired: false, attributes: [] },
          { code: 'B', label: 'B', expired: false, attributes: [] },
        ],
        id: 'CODELIST_FROM_API_CALL',
        metadata: { saveAs: 'CODELIST' },
      },
    };

    const expected = {
      lists: {
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
        CODELIST_FROM_API_CALL: [
          {
            code: 'A',
            label: 'A',
            expired: false,
            attributes: [],
            relatedObject: {
              attributes: [],
              code: 'A',
              expired: false,
              label: 'A',
            },
          },
          {
            code: 'B',
            label: 'B',
            expired: false,
            attributes: [],
            relatedObject: {
              attributes: [],
              code: 'B',
              expired: false,
              label: 'B',
            },
          },
        ],
      },
      loading: false,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it('ApiData/CallApi/fulfilled (showCode = true)', () => {
    const state = {
      lists: {
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
      },
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        data: [
          { code: 'A', label: 'A', expired: false, attributes: [] },
          { code: 'B', label: 'B', expired: false, attributes: [] },
        ],
        id: 'CODELIST_FROM_API_CALL',
        metadata: { saveAs: 'CODELIST', showCode: true },
      },
    };

    const expected = {
      lists: {
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
        CODELIST_FROM_API_CALL: [
          {
            code: 'A',
            label: 'A - A',
            expired: false,
            attributes: [],
            relatedObject: {
              attributes: [],
              code: 'A',
              expired: false,
              label: 'A',
            },
          },
          {
            code: 'B',
            label: 'B - B',
            expired: false,
            attributes: [],
            relatedObject: {
              attributes: [],
              code: 'B',
              expired: false,
              label: 'B',
            },
          },
        ],
      },
      loading: false,
      componentValueType: {},
    };
    expect(CodeListReducer(state, action)).toEqual(expected);
  });

  it('ApiData/CallApi/fulfilled not saved as codelist', () => {
    const state = {
      lists: {
        [LANGUAGES]: [{ code: 'EN', label: 'English' }],
      },
      loading: false,
      componentValueType: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        data: [
          { code: 'A', label: 'A' },
          { code: 'B', label: 'B' },
        ],
        id: 'CODELIST_FROM_API_CALL',
      },
    };

    expect(CodeListReducer(state, action)).toEqual(state);
  });
});
