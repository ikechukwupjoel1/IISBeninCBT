import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Login } from '../pages/Login';
import { ToastProvider } from '../context/ToastContext';
import { BrowserRouter } from 'react-router-dom';

describe('Login Component', () => {
    it('renders login form', () => {
        render(
            <ToastProvider>
                <BrowserRouter>
                    <Login globalLogo="" setGlobalLogo={() => { }} />
                </BrowserRouter>
            </ToastProvider>
        );

        expect(screen.getByText(/IISBenin CBT/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Registration No/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Access PIN/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
});
