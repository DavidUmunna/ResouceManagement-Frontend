import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Button from '../src/components/Button';

afterEach(cleanup);

describe('<Button /> — shared enterprise button', () => {
  it('renders its children', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('always carries the standard radius (rounded-lg)', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('rounded-lg');
  });

  it('defaults to the primary (blue) variant', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });

  it('applies semantic variants', () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
    rerender(<Button variant="success">Approve</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');
  });

  it('applies size + block', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-xs');
    rerender(<Button block>Wide</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('fires onClick when enabled', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not fire onClick when disabled', () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Nope</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('when loading: shows a spinner, is disabled, and blocks clicks', () => {
    const onClick = jest.fn();
    const { container } = render(<Button loading onClick={onClick}>Saving</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults type to button, and honours type=submit', () => {
    const { rerender } = render(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    rerender(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('appends caller className last (so it can extend the base)', () => {
    render(<Button className="mt-4 custom-x">X</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('custom-x');
    expect(btn).toHaveClass('rounded-lg'); // base still present
  });
});
