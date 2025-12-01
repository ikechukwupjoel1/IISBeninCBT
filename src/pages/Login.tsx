import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button, Label, Card, Input } from '../components/ui/UI';
import { Logo } from '../components/ui/Logo';
import { Particles } from '../components/ui/Particles';
import { Icons } from '../components/ui/Icons';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { z, ZodError } from 'zod';

interface LoginProps {
    setGlobalLogo: (logo: string) => void;
    globalLogo: string;
}

// Zod Schema for Login Validation
const loginSchema = z.object({
    regNo: z.string().min(1, 'Registration Number or Email is required'),
    pin: z.string().min(1, 'PIN is required'),
});

export const Login: React.FC<LoginProps> = ({ globalLogo }) => {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const { login } = useAuth();
    const [regNo, setRegNo] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setError('');

        try {
            loginSchema.parse({ regNo, pin });
        } catch (err) {
            if (err instanceof ZodError) {
                setError(err.issues[0].message);
                setLoginLoading(false);
                return;
            }
        }

        try {
            let result;

            // Try student login first (reg number + PIN)
            if (regNo.startsWith('IIS-')) {
                result = await authService.signInWithStudentCredentials(regNo, pin);
            }
            // Try email/password login for teachers and admins
            else if (regNo.includes('@')) {
                result = await authService.signInWithEmail(regNo, pin);
            } else {
                // Default to student login attempt if format is ambiguous but not email
                result = await authService.signInWithStudentCredentials(regNo, pin);
            }

            if (result.error || !result.user) {
                console.log('Login failed:', result.error);
                setError(result.error || 'Invalid credentials. Please check your ID/Email and PIN.');
                showError(result.error || 'Invalid credentials. Please try again.');
            } else {
                console.log('Login successful. User:', result.user);
                console.log('User Role (Raw):', result.user.role);

                // Update global auth state
                login(result.user);

                success(`Welcome back, ${result.user.name}!`);
                // Navigate based on role
                const role = result.user.role.toUpperCase();
                switch (role) {
                    case 'ADMIN':
                        navigate('/admin');
                        break;
                    case 'TEACHER':
                        navigate('/teacher');
                        break;
                    case 'STUDENT':
                        navigate('/student');
                        break;
                    default:
                        navigate('/');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
            showError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-50">
            <Particles />
            <main id="main-content" className="w-full max-w-md p-8 relative z-10 animate-in zoom-in duration-300">
                <Card className="p-8 md:p-10 shadow-2xl border-t-4 border-brand-600 backdrop-blur-lg bg-white/95">
                    <div className="flex flex-col items-center mb-8">
                        <div className="mb-4 relative">
                            <div className="absolute inset-0 bg-brand-200 rounded-full blur-lg opacity-50 animate-pulse" aria-hidden="true"></div>
                            <Logo className="w-24 h-24 relative z-10" src={globalLogo} />
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-brand-900 text-center">IISBenin CBT</h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Secure Assessment Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <Label htmlFor="regNo">Registration No / Staff Email</Label>
                            <Input
                                id="regNo"
                                type="text"
                                value={regNo}
                                onChange={(e: any) => setRegNo(e.target.value)}
                                className="bg-slate-50"
                                placeholder="ID or Email"
                                required
                                autoComplete="username"
                                aria-describedby="regNo-hint"
                            />
                            <p id="regNo-hint" className="sr-only">Enter your student registration number or staff email address</p>
                        </div>
                        <div>
                            <Label htmlFor="pin">Access PIN</Label>
                            <Input
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={(e: any) => setPin(e.target.value)}
                                className="bg-slate-50"
                                placeholder="•••••"
                                required
                                autoComplete="current-password"
                                aria-describedby="pin-hint"
                            />
                            <p id="pin-hint" className="sr-only">Enter your personal identification number</p>
                        </div>

                        {error && (
                            <div role="alert" className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                <Icons.ExclamationTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full py-3 text-base font-bold shadow-lg shadow-brand-200/50 transition-transform active:scale-[0.98]" disabled={loginLoading}>
                            {loginLoading ? 'Authenticating...' : 'Sign In to Portal'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">
                            Restricted Access &bull; Indian International School Benin
                        </p>
                    </div>
                </Card>
            </main>
        </div>
    );
};
