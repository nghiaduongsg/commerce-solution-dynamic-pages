import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import TableTemplate from './TableTemplate';

const uiSchema = {
  'ui:options': {
    titleKey: 'label',
    tableColumns: [
      { key: 'key', labelKey: 'Field key' },
      { key: 'label', labelKey: 'Field label' },
      { key: 'dataType', labelKey: 'Data type' },
      { key: 'required', labelKey: 'Required field' },
    ],
    detailLabels: {
      key: 'Field key',
      label: 'Field label',
      dataType: 'Data type',
      required: 'Required field',
      minLength: 'Minimum length',
      regex: 'Pattern',
    },
  },
};

const formData = [
  {
    key: 'color',
    label: 'Colour',
    dataType: 'string',
    required: true,
    validation: { minLength: 2, regex: '^#' },
  },
  { key: 'size', label: 'Size', dataType: 'number', required: false },
];

// The mocked translator returns keys, so headers resolve to the declared labelKeys.
const setup = (data: unknown = formData) => {
  const props: any = {
    formData: data,
    uiSchema,
    schema: {},
    idSchema: { $id: 'ProductType_fields' },
    formContext: { namespace: 'commerceProductType', dataTestId: 'fields' },
  };
  return render(<TableTemplate {...props} />);
};

test('renders the declared columns as a table', () => {
  setup();
  ['Field key', 'Field label', 'Data type', 'Required field'].forEach((header) =>
    expect(screen.getByText(header)).toBeInTheDocument(),
  );
  expect(screen.getByText('color')).toBeInTheDocument();
  expect(screen.getByText('size')).toBeInTheDocument();
});

test('selecting a row reveals validation detail not shown in the table', () => {
  setup();
  fireEvent.click(screen.getByText('color'));
  const panel = screen.getByRole('region', { name: 'Colour' });
  expect(within(panel).getByText('Minimum length')).toBeInTheDocument();
  expect(within(panel).getByText('2')).toBeInTheDocument();
  expect(within(panel).getByText('^#')).toBeInTheDocument();
});

test('falls back to an empty state when there is no data', () => {
  setup([]);
  expect(screen.getByText('detailTable.empty')).toBeInTheDocument();
});
