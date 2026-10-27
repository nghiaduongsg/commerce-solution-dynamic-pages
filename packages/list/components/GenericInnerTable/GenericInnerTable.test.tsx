import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@pkg-common/test-utils';
import useTable from '@pkg-list/hooks/useTable';
import GenericInnerTable from '@pkg-list/components/GenericInnerTable/GenericInnerTable';
import { GenericInnerTableProps } from './GenericInnerTable.d';

jest.mock('@pkg-list/hooks/useTable', () => jest.fn());
const mockUseTable = jest.mocked(useTable);
beforeEach(() => jest.clearAllMocks());

const Component = ({
  getCellContentCallback,
  namespaces,
  row,
  tableId,
}: GenericInnerTableProps) => {
  return (
    <GenericInnerTable
      getCellContentCallback={getCellContentCallback}
      namespaces={namespaces}
      row={row}
      tableId={tableId}
    />
  );
};

describe('GenericInnerTable component', () => {
  const mockGetContent = jest.fn();

  it('should NOT render container without row matches', () => {
    mockUseTable?.mockReturnValue({
      innerVisibleColumns: [{ groupByProperty: 'tests' }],
    } as any);

    renderWithProviders(
      {},
      <Component
        getCellContentCallback={mockGetContent}
        namespaces={['PartyRole']}
        row={{}}
        tableId="PartyRole"
      />,
    );

    expect(screen?.queryByTestId(/inner-table-container/i)).not.toBeInTheDocument();
  });

  it('should render container with row matches', () => {
    mockUseTable?.mockReturnValue({
      innerVisibleColumns: [{ accessors: ['PartyRole', 'tests'], groupByProperty: 'tests' }],
    } as any);
    renderWithProviders(
      {},
      <Component
        getCellContentCallback={mockGetContent}
        row={{ id: '1', tests: ['rowOne', 'rowTwo'] }}
        tableId="PartyRole"
      />,
    );
    expect(screen?.getByTestId(/inner-table-container/i)).toBeInTheDocument();
    expect(screen?.getByText(/tests/i)).toBeInTheDocument();
  });
});
