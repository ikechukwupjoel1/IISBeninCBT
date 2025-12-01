import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, Input, Badge } from '../components/ui/UI';

describe('UI Components', () => {
    describe('Button', () => {
        it('renders with children', () => {
            render(<Button>Click Me</Button>);
            expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
        });

        it('handles click events', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click Me</Button>);
            fireEvent.click(screen.getByRole('button', { name: /Click Me/i }));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('can be disabled', () => {
            render(<Button disabled>Disabled</Button>);
            expect(screen.getByRole('button', { name: /Disabled/i })).toBeDisabled();
        });
    });

    describe('Input', () => {
        it('renders correctly', () => {
            render(<Input placeholder="Enter text" />);
            expect(screen.getByPlaceholderText(/Enter text/i)).toBeInTheDocument();
        });

        it('handles value changes', () => {
            const handleChange = vi.fn();
            render(<Input onChange={handleChange} />);
            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'test' } });
            expect(handleChange).toHaveBeenCalled();
        });
    });

    describe('Badge', () => {
        it('renders with children', () => {
            render(<Badge>Status</Badge>);
            expect(screen.getByText(/Status/i)).toBeInTheDocument();
        });

        it('applies color variants', () => {
            const { container } = render(<Badge color="green">Active</Badge>);
            expect(container.firstChild).toHaveClass('bg-green-100');
            expect(container.firstChild).toHaveClass('text-green-700');
        });
    });
});
