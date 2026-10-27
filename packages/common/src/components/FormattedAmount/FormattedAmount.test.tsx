import React from 'react';
import { render, screen } from '@testing-library/react';
import FormattedAmount from './FormattedAmount';
import '@testing-library/jest-dom';

jest.mock('@pkg-common/hooks/useAmount', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@pkg-common/utils', () => ({
  hasValue: jest.fn(),
}));

import useAmount from '@pkg-common/hooks/useAmount';
import { hasValue } from '@pkg-common/utils';

describe('FormattedAmount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders formatted amount with prefix symbol', () => {
    (useAmount as jest.Mock).mockReturnValue({
      symbolPosition: 'PREFIX',
      thousandSeparator: ',',
      decimalPlaces: 2,
      decimalPlacesExtended: 4,
      symbol: '$',
      decimalSeparator: '.',
      value: 1234.56,
    });
    (hasValue as jest.Mock).mockReturnValue(true);

    render(<FormattedAmount id="amount" value={'1234.56'} currency="USD" />);

    expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument();
  });

  it('renders with suffix symbol when symbolPosition is SUFFIX', () => {
    (useAmount as jest.Mock).mockReturnValue({
      symbolPosition: 'SUFFIX',
      thousandSeparator: '.',
      decimalPlaces: 2,
      decimalPlacesExtended: 4,
      symbol: '€',
      decimalSeparator: ',',
      value: 1000.5,
    });
    (hasValue as jest.Mock).mockReturnValue(true);

    render(<FormattedAmount id="amount" value={'1000.5'} currency="EUR" />);

    expect(screen.getByText(/1.000,50€/)).toBeInTheDocument();
  });

  it('renders empty when value is missing', () => {
    (useAmount as jest.Mock).mockReturnValue({
      symbolPosition: 'PREFIX',
      thousandSeparator: ',',
      decimalPlaces: 2,
      decimalPlacesExtended: 4,
      symbol: '$',
      decimalSeparator: '.',
      value: undefined,
    });
    (hasValue as jest.Mock).mockReturnValue(false);

    render(<FormattedAmount id="amount" value={'undefined'} currency="USD" />);

    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });
});
