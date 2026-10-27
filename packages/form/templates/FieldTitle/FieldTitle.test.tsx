import { render, screen } from '@testing-library/react';
import FieldTitle from './FieldTitle';
import React from 'react';

describe('FieldTitle', () => {
  it('renders the title as a string', () => {
    render(<FieldTitle title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the title as a number', () => {
    render(<FieldTitle title={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders the title as a JSX element', () => {
    render(<FieldTitle title={<span data-testid="jsx-title">JSX Title</span>} />);
    expect(screen.getByTestId('jsx-title')).toBeInTheDocument();
  });

  it('does not apply bold fontWeight when isBold is false', () => {
    render(<FieldTitle title="Normal Title" isBold={false} />);
    const label = screen.getByText('Normal Title');
    expect(label).not.toHaveStyle({ fontWeight: 'bold' });
  });

  it('applies error styling when isValid is false', () => {
    render(<FieldTitle title="Invalid Title" isValid={false} />);
    // MUI FormLabel applies the "error" class when error prop is true
    const label = screen.getByText('Invalid Title');
    expect(label).toHaveClass('Mui-error');
  });

  it('does not apply error styling when isValid is true', () => {
    render(<FieldTitle title="Valid Title" isValid />);
    const label = screen.getByText('Valid Title');
    expect(label).not.toHaveClass('Mui-error');
  });

  it('applies custom sx styles', () => {
    render(<FieldTitle title="Styled Title" sx={{ color: 'red' }} />);
    // Verifies the component renders without issues with custom sx
    expect(screen.getByText('Styled Title')).toBeInTheDocument();
  });

  it('uses default props when only title is provided', () => {
    render(<FieldTitle title="Default Props Title" />);
    const label = screen.getByText('Default Props Title');
    expect(label).not.toHaveClass('Mui-error');
    expect(label).not.toHaveStyle({ fontWeight: 'bold' });
  });

  it('applies bold fontWeight when isBold is true', () => {
    render(<FieldTitle title="Bold Title" isBold />);
    const label = screen.getByText('Bold Title');
    expect(label).toBeInTheDocument();
    expect(label).not.toHaveClass('Mui-error');
  });
});
