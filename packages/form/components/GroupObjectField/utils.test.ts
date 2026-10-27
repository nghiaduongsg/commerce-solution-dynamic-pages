import {
  getFinalConfiguration,
  capitalizeFirstLetter,
  formatMetadata,
  getTableRows,
  showCodeColumn,
} from '@pkg-form/components/GroupObjectField/utils';

describe('table helpers', () => {
  const rowsWithCode = {
    row1: {
      code: 'FC-001',
      columns: ['amount', 'status'],
      calculatedByBe: true,
    },
    row2: {
      code: '',
      columns: ['status'],
    },
  } as any;

  const rowsWithoutCode = {
    row1: {
      columns: ['amount'],
      calculatedByBe: true,
    },
    row2: {
      columns: ['status'],
    },
  } as any;

  describe('showCodeColumn', () => {
    it('returns true when at least one row has a code', () => {
      expect(showCodeColumn(rowsWithCode)).toBe(true);
    });

    it('returns false when no row has a code', () => {
      expect(showCodeColumn(rowsWithoutCode)).toBe(false);
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('capitalizes the first letter of a string', () => {
      expect(capitalizeFirstLetter('amount')).toBe('Amount');
    });

    it('returns empty string when given empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });
  });

  describe('getFinalConfiguration', () => {
    it('builds the final configuration with default and additional columns', () => {
      const apiValues = { url: '/test-url' } as any;

      const result = getFinalConfiguration(
        'table-1',
        ['amount', 'status'],
        'TEST_NAMESPACE',
        rowsWithCode,
        apiValues,
        true,
      );

      expect(result).toEqual({
        'ui:labels': {
          namespace: 'TEST_NAMESPACE',
        },
        avoidDefaultLoad: true,
        tableId: 'table-1',
        showTitle: true,
        rowId: 'label',
        url: '',
        heightAdjustable: false,
        columnConfigurable: false,
        unfolded: true,
        apiValues,
        columns: [
          {
            type: 'string',
            name: 'fiscalCode',
            accessors: ['code'],
            align: 'left',
            visible: true,
            bold: true,
            width: 10,
            truncate: {
              enabled: false,
              width: 100,
              lines: 1,
            },
          },
          {
            type: 'string',
            name: 'label',
            accessors: ['translatedLabel'],
            align: 'left',
            visible: true,
            bold: true,
            truncate: {
              enabled: false,
              width: 100,
              lines: 1,
            },
          },
          {
            type: 'editable',
            name: 'amount',
            accessors: ['amount'],
            align: 'left',
            visible: true,
            truncate: {
              enabled: false,
              width: 100,
              lines: 1,
            },
          },
          {
            type: 'editable',
            name: 'status',
            accessors: ['status'],
            align: 'left',
            visible: true,
            truncate: {
              enabled: false,
              width: 100,
              lines: 1,
            },
          },
        ],
      });
    });

    it('sets fiscalCode column visible to false when no row has code', () => {
      const result = getFinalConfiguration(
        'table-2',
        ['amount'],
        'TEST_NAMESPACE',
        rowsWithoutCode,
      );

      expect(result.columns[0]).toMatchObject({
        name: 'fiscalCode',
        visible: false,
      });
    });

    it('adds ui:buttons when buttons are provided', () => {
      const buttons = [{ label: 'Edit' }] as any;

      const result = getFinalConfiguration(
        'table-3',
        ['amount'],
        'TEST_NAMESPACE',
        rowsWithCode,
        undefined,
        undefined,
        buttons,
      );

      expect(result['ui:buttons']).toBe(buttons);
    });

    it('does not add ui:buttons when buttons are not provided', () => {
      const result = getFinalConfiguration('table-4', ['amount'], 'TEST_NAMESPACE', rowsWithCode);

      expect(result).not.toHaveProperty('ui:buttons');
    });
  });

  describe('formatMetadata', () => {
    it('formats metadata correctly when code column is shown', () => {
      const result = formatMetadata(['amount', 'status'], rowsWithCode);

      expect(result).toEqual({
        2: {
          0: true,
        },
        3: {
          0: true,
          1: true,
        },
      });
    });

    it('formats metadata correctly when code column is not shown', () => {
      const result = formatMetadata(['amount', 'status'], rowsWithoutCode);

      expect(result).toEqual({
        1: {
          0: true,
        },
        2: {
          1: true,
        },
      });
    });

    it('creates empty metadata objects for columns even when rows do not use them', () => {
      const rows = {
        row1: { columns: ['amount'] },
      } as any;

      const result = formatMetadata(['amount', 'status'], rows);

      expect(result).toEqual({
        1: {
          0: true,
        },
        2: {},
      });
    });
  });

  describe('getTableRows', () => {
    it('returns table rows with translated label, calculatedByBe, code and dynamic values', () => {
      const translate = jest.fn(
        (key: string, options: any) => `${key}-${options.ns}-${options.lng}`,
      );
      const value = {
        row1Amount: 100,
        row1Status: 'OPEN',
        row2Amount: 200,
        row2Status: 'CLOSED',
      };

      const result = getTableRows(
        rowsWithCode,
        ['amount', 'status'],
        'TEST_NAMESPACE',
        value,
        translate,
        'en',
      );

      expect(translate).toHaveBeenCalledWith('row1', {
        ns: 'TEST_NAMESPACE',
        lng: 'en',
      });
      expect(translate).toHaveBeenCalledWith('row2', {
        ns: 'TEST_NAMESPACE',
        lng: 'en',
      });

      expect(result).toEqual([
        {
          label: 'row1',
          translatedLabel: 'row1-TEST_NAMESPACE-en',
          calculatedByBe: true,
          code: 'FC-001',
          row1Amount: 100,
          row1Status: 'OPEN',
        },
        {
          label: 'row2',
          translatedLabel: 'row2-TEST_NAMESPACE-en',
          calculatedByBe: false,
          code: '',
          row2Amount: 200,
          row2Status: 'CLOSED',
        },
      ]);
    });

    it('sets dynamic values to null when value is not provided', () => {
      const translate = jest.fn((key: string) => key);

      const result = getTableRows(
        rowsWithoutCode,
        ['amount', 'status'],
        'TEST_NAMESPACE',
        undefined,
        translate,
        'en',
      );

      expect(result).toEqual([
        {
          label: 'row1',
          translatedLabel: 'row1',
          calculatedByBe: true,
          code: '',
          row1Amount: null,
          row1Status: null,
        },
        {
          label: 'row2',
          translatedLabel: 'row2',
          calculatedByBe: false,
          code: '',
          row2Amount: null,
          row2Status: null,
        },
      ]);
    });
  });
});
