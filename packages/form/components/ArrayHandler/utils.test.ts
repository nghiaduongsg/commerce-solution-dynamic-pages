import {
  filterItems,
  getTreeSchema,
  getTreeUiSchema,
  getLevelElementId,
} from '@pkg-form/components//ArrayHandler/utils';

import { getWidgetImmediateParentId } from '@pkg-form/validations/utils/widgetUtils';
describe('utils tests', () => {
  it('getLevelElementId should return id when isAboutToDuplicate is true', () => {
    const result = getLevelElementId(
      'test-id',
      'children',
      0,
      'test-path',
      false,
      false,
      false,
      true,
    );
    expect(result).toBe('test-id');
  });
  it('getLevelElementId should not return id when isAboutToEdit is false', () => {
    const result = getLevelElementId(
      'test-id',
      'children',
      0,
      'test-path',
      false,
      false,
      false,
      false,
    );
    expect(result).not.toBe('test-id');
  });
});

jest.mock('@pkg-form/validations/utils/widgetUtils', () => ({
  getWidgetImmediateParentId: jest.fn(),
}));

describe('tree helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('filterItems', () => {
    const items = [
      {
        id: 1,
        name: 'Alpha',
        nested: {
          description: 'First Item',
        },
      },
      {
        id: 2,
        name: 'Beta',
        nested: {
          description: 'Second Item',
        },
      },
      {
        id: 3,
        name: 'Gamma',
        nested: {
          description: 'Other Value',
        },
      },
    ];

    it('returns all items when searchKey is null', () => {
      expect(filterItems(items, null)).toEqual(items);
    });

    it('filters items based on nested object values', () => {
      expect(filterItems(items, 'second')).toEqual([
        {
          id: 2,
          name: 'Beta',
          nested: {
            description: 'Second Item',
          },
        },
      ]);
    });

    it('matches case-insensitively because values are lowercased', () => {
      expect(filterItems(items, 'alpha')).toEqual([
        {
          id: 1,
          name: 'Alpha',
          nested: {
            description: 'First Item',
          },
        },
      ]);
    });

    it('returns mapped items with __HIDDEN__ when keepAll is true', () => {
      expect(filterItems(items, 'second', true)).toEqual([
        {
          id: 1,
          name: 'Alpha',
          nested: {
            description: 'First Item',
          },
          __HIDDEN__: true,
        },
        {
          id: 2,
          name: 'Beta',
          nested: {
            description: 'Second Item',
          },
          __HIDDEN__: false,
        },
        {
          id: 3,
          name: 'Gamma',
          nested: {
            description: 'Other Value',
          },
          __HIDDEN__: true,
        },
      ]);
    });

    it('returns empty array when items is undefined and searchKey exists', () => {
      expect(filterItems(undefined, 'alpha')).toEqual([]);
    });
  });

  describe('getTreeSchema', () => {
    const schema = {
      items: {
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          children: {
            items: {
              properties: {
                childId: { type: 'string' },
                childLabel: { type: 'string' },
              },
            },
          },
        },
      },
    };

    it('returns child schema when action is add and level > 0', () => {
      expect(getTreeSchema(schema, 'children', 'add', 1, ['extraA', 'extraB'])).toEqual({
        properties: {
          childId: { type: 'string' },
          childLabel: { type: 'string' },
          extraA: undefined,
          extraB: undefined,
        },
        type: 'object',
      });
    });

    it('returns root schema and removes children property when not in add child mode', () => {
      expect(getTreeSchema(schema, 'children', 'edit', 0)).toEqual({
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          children: undefined,
        },
        type: 'object',
      });
    });

    it('uses empty string key when childrenProperty is empty', () => {
      expect(getTreeSchema(schema, '', 'edit', 0)).toEqual({
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          children: {
            items: {
              properties: {
                childId: { type: 'string' },
                childLabel: { type: 'string' },
              },
            },
          },
          '': undefined,
        },
        type: 'object',
      });
    });
  });

  describe('getTreeUiSchema', () => {
    const uiSchema = {
      items: {
        field1: {
          'ui:widget': 'text',
        },
        children: {
          items: {
            childField: {
              'ui:widget': 'select',
            },
          },
        },
      },
    };

    it('returns nested ui schema when action is add and level > 0', () => {
      expect(getTreeUiSchema('page-id', uiSchema, 'TEST_NS', 'children', 'add', 2)).toEqual({
        childField: {
          'ui:widget': 'select',
        },
        'ui:labels': { namespace: 'TEST_NS' },
        'ui:page': { id: 'page-id' },
      });
    });

    it('returns root ui schema when not adding child level', () => {
      expect(getTreeUiSchema('page-id', uiSchema, 'TEST_NS', 'children', 'edit', 0)).toEqual({
        field1: {
          'ui:widget': 'text',
        },
        children: {
          items: {
            childField: {
              'ui:widget': 'select',
            },
          },
        },
        'ui:labels': { namespace: 'TEST_NS' },
        'ui:page': { id: 'page-id' },
      });
    });
  });

  describe('getLevelElementId', () => {
    it('returns id when level is 0 and isAboutToAdd is true', () => {
      expect(
        getLevelElementId('root-id', 'children', 0, 'path.to.node', true, false, false, false),
      ).toBe('root-id');
    });

    it('returns jsonPath when editing', () => {
      expect(
        getLevelElementId('root-id', 'children', 2, 'path.to.node', false, true, false, false),
      ).toBe('path.to.node');
    });

    it('returns jsonPath_childrenProperty when adding in deeper level', () => {
      expect(
        getLevelElementId('root-id', 'children', 2, 'path.to.node', true, false, false, false),
      ).toBe('path.to.node_children');
    });

    it('returns immediate parent id when deleting', () => {
      (getWidgetImmediateParentId as jest.Mock).mockReturnValue('parent-id');

      expect(
        getLevelElementId('root-id', 'children', 2, 'path.to.node', false, false, true, false),
      ).toBe('parent-id');

      expect(getWidgetImmediateParentId).toHaveBeenCalledWith('path.to.node');
    });

    it('returns empty string when no mode is active', () => {
      expect(
        getLevelElementId('root-id', 'children', 2, 'path.to.node', false, false, false, false),
      ).toBe('');
    });
  });
});
