import { selectAllLists, selectList, selectLists, selectLoading } from './selectors';
import { AnyType } from '@pkg-common/types';

describe('CodeList selectors', () => {
  const state = {
    CodeList: {
      loading: false,
      lists: {
        LIST1: [
          { value: '1', label: 'label1' },
          { value: '2', label: 'label2' },
        ],
        LIST2: [{ value: '5', label: 'label5' }],
        LIST3: [{ value: '7', label: 'label7' }],
      },
      componentValueType: {
        field1: 'LIST1',
        field2: 'LIST2',
        field3: 'LIST3',
      },
    },
  } as AnyType;

  it('selectAllLists', () => {
    const expected = state.CodeList.lists;
    expect(selectAllLists(state)).toEqual(expected);
  });

  it('selectLoading', () => {
    const expected = false;
    expect(selectLoading('LIST1')(state)).toEqual(expected);
  });

  it('selectList', () => {
    const expected = [
      { value: '1', label: 'label1' },
      { value: '2', label: 'label2' },
    ];
    expect(selectList('LIST1')(state)).toEqual(expected);
  });

  it('selectLists', () => {
    const expected = {
      LIST2: [{ value: '5', label: 'label5' }],
      LIST3: [{ value: '7', label: 'label7' }],
    };
    expect(selectLists(['LIST2', 'LIST3'])(state)).toEqual(expected);
  });
});
