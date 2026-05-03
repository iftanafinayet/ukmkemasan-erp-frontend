import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestComponent } from './TestComponent';

test('renders Hello World text', () => {
  render(<TestComponent />);
  const linkElement = screen.getByText(/hello world/i);
  expect(linkElement).toBeInTheDocument();
});
