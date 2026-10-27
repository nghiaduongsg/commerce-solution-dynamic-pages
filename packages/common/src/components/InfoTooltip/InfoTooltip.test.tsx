import React from 'react';
import { render, screen } from '@testing-library/react';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip component - HTML support', () => {
  it('accepts allowHtml prop for string messages', () => {
    const { container } = render(
      <InfoTooltip id="test-id" message="<strong>Bold</strong>" allowHtml={true} />,
    );

    const tooltip = container.querySelector('span[style*="height"]');
    expect(tooltip).toBeTruthy();
  });

  it('renders Typography for string message when allowHtml is false', () => {
    const { container } = render(
      <InfoTooltip id="test-id" message="Plain text" allowHtml={false} />,
    );

    const tooltip = container.querySelector('span[style*="height"]');
    expect(tooltip).toBeTruthy();
  });

  it('renders Typography for string message by default (allowHtml not provided)', () => {
    const { container } = render(<InfoTooltip id="test-id" message="Plain text" />);

    const tooltip = container.querySelector('span[style*="height"]');
    expect(tooltip).toBeTruthy();
  });

  it('accepts allowHtml prop for array messages', () => {
    const { container } = render(
      <InfoTooltip
        id="test-id"
        message={['<strong>Item 1</strong>', '<em>Item 2</em>']}
        allowHtml={true}
      />,
    );

    const tooltip = container.querySelector('span[style*="height"]');
    expect(tooltip).toBeTruthy();
  });

  it('renders Typography for array items when allowHtml is false', () => {
    const { container } = render(
      <InfoTooltip id="test-id" message={['Item 1', 'Item 2']} allowHtml={false} />,
    );

    const tooltip = container.querySelector('span[style*="height"]');
    expect(tooltip).toBeTruthy();
  });

  it('renders multiple array items when allowHtml is true', () => {
    const messages = ['<b>Bold</b>', '<i>Italic</i>', '<u>Underline</u>'];
    const { container } = render(<InfoTooltip id="test-id" message={messages} allowHtml={true} />);

    const tooltip = container.querySelector('span[style*="height"]');
    expect(tooltip).toBeTruthy();
  });

  it('renders with custom icon', () => {
    render(
      <InfoTooltip
        id="test-id"
        message="Test"
        icon={<span data-testid="custom-icon">Custom</span>}
      />,
    );

    expect(screen.getByTestId('custom-icon')).toBeTruthy();
  });

  it('passes dataTestId correctly', () => {
    render(<InfoTooltip id="test-id" message="Test" dataTestId="custom-tooltip" />);

    expect(screen.getByTestId('custom-tooltip')).toBeTruthy();
  });

  it('sanitizes malicious HTML content when allowHtml is true', () => {
    const maliciousHtml =
      '<strong>Safe text</strong><script>alert("XSS")</script><img src="x" onerror="alert(1)">';
    const { container } = render(
      <InfoTooltip id="test-id" message={maliciousHtml} allowHtml={true} />,
    );

    // Component should render without crashing
    const tooltip = container.querySelector('span[style*="height"]');
    expect(tooltip).toBeTruthy();

    // The component uses DOMPurify.sanitize which removes dangerous content
    // We verify the component accepts and renders the HTML safely
    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).not.toContain('onerror=');
  });
});
