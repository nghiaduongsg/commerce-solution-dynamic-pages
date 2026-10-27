import React from 'react';
import { render, screen } from '@testing-library/react';
import WithInfo from './WithInfo';
import useAdditionalInfo from '../hooks/useAdditionalInfo';
import DOMPurify from 'dompurify';
import { useTheme } from '@mui/material/styles';
import { InfoSchema } from '@pkg-common/types';

jest.mock('../hooks/useAdditionalInfo');
jest.mock('dompurify');
jest.mock('@mui/material/styles');

describe('WithInfo component - HTML support', () => {
  const mockTheme = {
    palette: {
      error: { main: '#red' },
      warning: { main: '#orange' },
      info: { main: '#blue' },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    (DOMPurify.sanitize as jest.Mock).mockImplementation((html: string) => html);
  });

  const createMockAdditionalInfo = (
    overrides: Partial<ReturnType<typeof useAdditionalInfo>> = {},
  ) => ({
    translatedMessage: '',
    severity: 'info',
    isTooltip: false,
    isDefault: false,
    isMultiple: false,
    variant: 'outlined',
    displayIcon: false,
    allowHtml: false,
    ...overrides,
  });

  it('renders HtmlMessage when allowHtml is true (isDefault case)', () => {
    (useAdditionalInfo as jest.Mock).mockReturnValue(
      createMockAdditionalInfo({
        translatedMessage: '<strong>Bold text</strong>',
        isDefault: true,
        allowHtml: true,
      }),
    );

    const info = { type: 'DEFAULT', infoMessage: 'test.message' } as InfoSchema;
    render(<WithInfo id="test-id" info={info} />);

    expect(DOMPurify.sanitize).toHaveBeenCalledWith('<strong>Bold text</strong>');
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('renders Typography when allowHtml is false (isDefault case)', () => {
    (useAdditionalInfo as jest.Mock).mockReturnValue(
      createMockAdditionalInfo({
        translatedMessage: 'Plain text message',
        isDefault: true,
      }),
    );

    const info = { type: 'DEFAULT', infoMessage: 'test.message' } as InfoSchema;
    render(<WithInfo id="test-id" info={info} />);

    expect(DOMPurify.sanitize).not.toHaveBeenCalled();
    expect(screen.getByText('Plain text message')).toBeTruthy();
  });

  it('renders HtmlMessage when allowHtml is true (isMultiple case)', () => {
    (useAdditionalInfo as jest.Mock).mockReturnValue(
      createMockAdditionalInfo({
        translatedMessage: 'Line 1\nLine 2',
        severity: 'warning',
        isMultiple: true,
        allowHtml: true,
      }),
    );

    const info = { type: 'DEFAULT', infoMessage: 'test.message' } as InfoSchema;
    render(<WithInfo id="test-id" info={info} />);

    expect(DOMPurify.sanitize).toHaveBeenCalledWith('Line 1\nLine 2');
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('renders Typography when allowHtml is false (isMultiple case)', () => {
    (useAdditionalInfo as jest.Mock).mockReturnValue(
      createMockAdditionalInfo({
        translatedMessage: 'Line 1\nLine 2',
        severity: 'warning',
        isMultiple: true,
      }),
    );

    const info = { type: 'DEFAULT', infoMessage: 'test.message' } as InfoSchema;
    render(<WithInfo id="test-id" info={info} />);

    expect(DOMPurify.sanitize).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('renders tooltip when isTooltip is true with allowHtml', () => {
    (useAdditionalInfo as jest.Mock).mockReturnValue(
      createMockAdditionalInfo({
        translatedMessage: '<em>Tooltip text</em>',
        isTooltip: true,
        allowHtml: true,
      }),
    );

    const info = { type: 'TOOLTIP', infoMessage: 'test.message' } as InfoSchema;
    const { container } = render(<WithInfo id="test-id" info={info} />);

    // Verify InfoTooltip is rendered by checking for the icon span
    expect(container.querySelector('span[style*="height"]')).toBeTruthy();
  });

  it('does not render when info is null', () => {
    (useAdditionalInfo as jest.Mock).mockReturnValue(createMockAdditionalInfo());

    const { container } = render(<WithInfo id="test-id" info={null as unknown as InfoSchema} />);
    expect(container.querySelector('[role="alert"]')).toBeFalsy();
  });

  it('sanitizes malicious HTML content when allowHtml is true', () => {
    const maliciousHtml =
      '<strong>Safe text</strong><script>alert("XSS")</script><img src="x" onerror="alert(1)">';
    (useAdditionalInfo as jest.Mock).mockReturnValue(
      createMockAdditionalInfo({
        translatedMessage: maliciousHtml,
        isDefault: true,
        allowHtml: true,
      }),
    );

    const info = { type: 'DEFAULT', infoMessage: 'test.message' } as InfoSchema;
    render(<WithInfo id="test-id" info={info} />);

    // Verify DOMPurify.sanitize is called with the malicious content
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousHtml);

    // Component should render without crashing
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
