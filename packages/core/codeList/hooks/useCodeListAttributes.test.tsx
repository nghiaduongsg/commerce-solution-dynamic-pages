import useCodeListAttributes from './useCodeListAttributes';
import { renderHook } from '@testing-library/react';
import { getMockWrapper } from '@_jestHelpers/reactMockStore';

const storeData = {
  CodeList: {
    lists: {
      LIST1: [
        {
          code: 'A',
          label: 'A',
          attributes: [{ key: 'keyA', value: 'value-keyA' }],
        },
      ],
      LIST2: [
        {
          code: 'B',
          label: 'B',
          attributes: [{ key: 'keyB', value: 'value-keyB' }],
        },
      ],
    },
  },
};

describe('useCodeListAttributes', () => {
  const wrapper = getMockWrapper(storeData);

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getItem', () => {
    it('should return codelist item', () => {
      const { result } = renderHook(() => useCodeListAttributes('LIST1'), { wrapper });
      const expected = {
        code: 'A',
        label: 'A',
        attributes: [{ key: 'keyA', value: 'value-keyA' }],
      };
      const { getItem } = result.current;
      expect(getItem('A')).toEqual(expected);
    });

    it('should return undefined when codelist item was not found', () => {
      const { result } = renderHook(() => useCodeListAttributes('TEST'), { wrapper });
      const { getItem } = result.current;
      expect(getItem('C')).toEqual(undefined);
    });
  });

  describe('getAttribute', () => {
    it('retrieve attribute value', () => {
      const { result } = renderHook(() => useCodeListAttributes('LIST1'), { wrapper });

      const { getAttribute } = result.current;
      const expected = ['value-keyA'];
      expect(getAttribute('A', 'keyA')).toEqual(expected);
    });

    it('retrieve attribute value when no such attribute exist for the given codelist', () => {
      const { result } = renderHook(() => useCodeListAttributes('TEST_CODE'), { wrapper });

      const { getAttribute } = result.current;

      expect(getAttribute('C', 'keyA')).toEqual(undefined);
    });
  });

  describe('getItemByAttribute', () => {
    it('should return item having specific attribute value', () => {
      const { result } = renderHook(() => useCodeListAttributes('LIST1'), { wrapper });

      const { getItemByAttribute } = result.current;

      expect(getItemByAttribute('keyA', 'value-keyA')).toEqual({
        code: 'A',
        label: 'A',
        attributes: [{ key: 'keyA', value: 'value-keyA' }],
      });
    });

    it('should return undefined if there was no item with specific attribute', () => {
      const { result } = renderHook(() => useCodeListAttributes('LIST1'), { wrapper });

      const { getItemByAttribute } = result.current;

      expect(getItemByAttribute('keyC', 'value-keyA')).toEqual(undefined);
    });

    it('should return undefined if there was an item with specific attribute but the value was not a match', () => {
      const { result } = renderHook(() => useCodeListAttributes('LIST1'), { wrapper });

      const { getItemByAttribute } = result.current;

      expect(getItemByAttribute('keyA', 'value-keyC')).toEqual(undefined);
    });
  });

  describe('getAllItemsByAttribute', () => {
    it('should retrieve all items matching any of the attribute values', () => {
      const { result } = renderHook(() => useCodeListAttributes('LIST1'), { wrapper });

      const { getAllItemsByAttribute } = result.current;
      const items = getAllItemsByAttribute('keyA', ['value-keyA', 'value-keyB']);

      expect(items.length).toBeGreaterThan(0);

      const hasMatchingAttribute = (item) => {
        const attrs = item.attributes ?? [];
        return attrs.some(
          (attr) => attr.key === 'keyA' && ['value-keyA', 'value-keyB'].includes(attr.value),
        );
      };

      expect(items.every(hasMatchingAttribute)).toBe(true);
    });

    it('should return empty array when no items match the attribute values', () => {
      const { result } = renderHook(() => useCodeListAttributes('LIST1'), { wrapper });

      const { getAllItemsByAttribute } = result.current;
      const items = getAllItemsByAttribute('keyA', ['non-existent-value']);

      expect(items).toEqual([]);
    });
  });
});

export {};
