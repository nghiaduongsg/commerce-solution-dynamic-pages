import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import DetailTable from './DetailTable';
import { DetailTableColumn, DetailTableRow } from './DetailTable.d';

const columns: Array<DetailTableColumn> = [
  { key: 'key', label: 'Field key' },
  { key: 'label', label: 'Field label' },
  { key: 'dataType', label: 'Data type' },
  { key: 'required', label: 'Required field' },
];

const rows: Array<DetailTableRow> = [
  {
    key: 'color',
    label: 'Colour',
    dataType: 'string',
    required: true,
    validation: { minLength: 2, regex: '^#' },
  },
  { key: 'size', label: 'Size', dataType: 'number', required: false },
];

const setup = (overrides = {}) =>
  render(
    <DetailTable
      columns={columns}
      rows={rows}
      getRowId={(row) => String(row.key)}
      rowTitle={(row) => String(row.label)}
      {...overrides}
    />,
  );

test('renders the configured column headers', () => {
  setup();
  columns.forEach((column) => expect(screen.getByText(column.label)).toBeInTheDocument());
});

test('renders a row per record with its cell values', () => {
  setup();
  expect(screen.getByText('color')).toBeInTheDocument();
  expect(screen.getByText('Colour')).toBeInTheDocument();
  expect(screen.getByText('size')).toBeInTheDocument();
  // No side panel until a row is selected.
  expect(screen.queryByRole('region', { name: 'Colour' })).not.toBeInTheDocument();
});

test('clicking a row opens the side panel with the full record', () => {
  setup();
  fireEvent.click(screen.getByText('color'));
  const panel = screen.getByRole('region', { name: 'Colour' });
  // The default detail body shows fields that are not in the table too.
  expect(within(panel).getByText('2')).toBeInTheDocument();
  expect(within(panel).getByText('^#')).toBeInTheDocument();
});

test('opening with the keyboard works and the close button dismisses the panel', async () => {
  setup();
  const row = screen.getByText('size').closest('tr') as HTMLElement;
  fireEvent.keyDown(row, { key: 'Enter' });
  expect(screen.getByRole('region', { name: 'Size' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'detailTable.close' }));
  await waitFor(() =>
    expect(screen.queryByRole('region', { name: 'Size' })).not.toBeInTheDocument(),
  );
});

test('uses the custom detail renderer when provided', () => {
  setup({ renderDetail: (row: DetailTableRow) => <div>custom-{String(row.key)}</div> });
  fireEvent.click(screen.getByText('color'));
  expect(screen.getByText('custom-color')).toBeInTheDocument();
});

test('shows an empty state when there are no rows', () => {
  render(<DetailTable columns={columns} rows={[]} />);
  expect(screen.getByText('detailTable.empty')).toBeInTheDocument();
});
