'use client';

import { useEffect, useMemo, useState } from 'react';

const API_BASE = '/api';
type Mode = 'login' | 'signup' | 'forgot';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

function getPasswordChecks(value: string) {
    return {
        minLength: value.length >= 6,
        lowercase: /[a-z]/.test(value),
        uppercase: /[A-Z]/.test(value),
        number: /\d/.test(value),
    };
}

function isPasswordValid(value: string) {
    const checks = getPasswordChecks(value);
    return checks.minLength && checks.lowercase && checks.uppercase && checks.number;
}

function PasswordRequirements({ password }: { password: string }) {
    const checks = getPasswordChecks(password);

    const itemClass = (ok: boolean) =>
        `text-xs font-medium ${ok ? 'text-green-600' : 'text-gray-500'}`;

    return (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-700">Password must include:</p>
            <ul className="mt-2 space-y-1">
                <li className={itemClass(checks.minLength)}>At least 6 characters</li>
                <li className={itemClass(checks.lowercase)}>A lowercase letter</li>
                <li className={itemClass(checks.uppercase)}>A uppercase letter</li>
                <li className={itemClass(checks.number)}>A number</li>
            </ul>
        </div>
    );
}

export default function LoginModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: (firstName: string) => void;
}) {
    const [mode, setMode] = useState<Mode>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const shouldValidatePassword = mode === 'signup' || mode === 'forgot';
    const passwordValid = isPasswordValid(password);

    useEffect(() => {
        if (!open) return;
        setErr(null);
        setSuccessMsg(null);
        setLoading(false);
        setMode('login');
        setUsername('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
    }, [open]);

    const title = useMemo(() => {
        if (mode === 'login')
            return 'Login';
        if (mode === 'signup')
            return 'Create account';
        return 'Forgot Password';
    }, [mode]);

    const subtitle = useMemo(() => {
        if (mode === 'login')
            return 'Sign in to access Predictor and Dashboard.';
        if (mode === 'signup')
            return 'Create an account to access MedPredict.';
        return 'Confirm your username and date of birth to set a new password.';
    }, [mode]);

    if (!open) return null;

    function switchMode(nextMode: Mode) {
        setErr(null);
        setSuccessMsg(null);
        setLoading(false);
        setMode(nextMode);
        setPassword('');

        if (nextMode === 'login') {
            setFirstName('');
            setLastName('');
            setDateOfBirth('');
        }

        if (nextMode === 'signup') {
            setFirstName('');
            setLastName('');
            setDateOfBirth('');
        }

        if (nextMode === 'forgot') {
            setDateOfBirth('');
            setFirstName('');
            setLastName('');
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setSuccessMsg(null);
        if (shouldValidatePassword && !passwordValid) {
            setErr(
                'Password must be at least 6 characters and include a lowercase letter, an uppercase letter, and a number.'
            );
            return;
        }
        setLoading(true);

        try {
            let path = '';
            let body: Record<string, string> = {};

            if (mode === 'login') {
                path = '/auth/login';
                body = { username, password };
            } else if (mode === 'signup') {
                path = '/auth/signup';
                body = {
                    username,
                    password,
                    firstName,
                    lastName,
                    dateOfBirth,
                };
            } else {
                path = '/auth/forgot-password';
                body = {
                    username,
                    dateOfBirth,
                    newPassword: password,
                };
            }

            const res = await fetch(`${API_BASE}${path}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            let data = null;
            try {
                data = await res.json();
            } catch { }

            if (!res.ok) {
                throw new Error(data?.detail || 'Authentication failed');
            }

            if (mode === 'forgot') {
                setSuccessMsg('Your password has been updated.');
                setPassword('');
                setDateOfBirth('');
                setMode('login');
                return;
            }

            onSuccess(data?.firstName || '');
            onClose();
        } catch (e: any) {
            setErr(e?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-label="Close login modal" />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
                        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
                    </div>
                </div>
                <form onSubmit={onSubmit} className="mt-6">
                    {mode === 'signup' && (
                        <>
                            <label className="block text-sm font-bold text-gray-800">First Name</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                                required />
                            <label className="mt-4 block text-sm font-bold text-gray-800">Last Name</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                                required />
                            <label className="mt-4 block text-sm font-bold text-gray-800">Date of Birth</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                type="date"
                                required />
                        </>
                    )}
                    {mode === 'forgot' && (
                        <>
                            <label className="block text-sm font-bold text-gray-800">Username</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required />  
                            <label className="mt-4 block text-sm font-bold text-gray-800">Date of Birth</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                type="date"
                                required />
                            <label className="mt-4 block text-sm font-bold text-gray-800">New Password</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                minLength={6}
                                pattern={PASSWORD_REGEX.source}
                                title="Password must be at least 6 characters and include a lowercase letter, an uppercase letter, and a number."
                                required />
                            <PasswordRequirements password={password} />
                        </>
                    )}
                    {mode !== 'forgot' && (
                        <>
                            <label className="mt-4 block text-sm font-bold text-gray-800">Username</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required />

                            <label className="mt-4 block text-sm font-bold text-gray-800">Password</label>
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="••••••••"
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                minLength={mode === 'signup' ? 6 : undefined}
                                pattern={mode === 'signup' ? PASSWORD_REGEX.source : undefined}
                                title={
                                    mode === 'signup'
                                        ? 'Password must be at least 6 characters and include a lowercase letter, an uppercase letter, and a number.'
                                        : undefined
                                }
                                required />

                            {mode === 'signup' && <PasswordRequirements password={password} />}
                            {mode === 'login' && (
                                <button
                                    type="button"
                                    className="mt-2 block text-left text-xs font-medium text-blue-600 hover:text-blue-700"
                                    onClick={() => switchMode('forgot')}>
                                    Forgot Password?
                                </button>
                            )}
                        </>
                    )}

                    {err && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                            {err}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
                            {successMsg}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                        {loading
                            ? 'Please wait…'
                            : mode === 'login'
                              ? 'Sign in'
                              : mode === 'signup'
                                ? 'Create account'
                                : 'Update password'}
                    </button>

                    {mode === 'login' && (
                        <button
                            type="button"
                            className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-900 hover:bg-gray-50"
                            onClick={() => switchMode('signup')}>
                            Create Account
                        </button>
                    )}

                    {mode === 'signup' && (
                        <button
                            type="button"
                            className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-900 hover:bg-gray-50"
                            onClick={() => switchMode('login')}>
                            Sign in
                        </button>
                    )}
                    {mode === 'forgot' && (
                        <button
                            type="button"
                            className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-900 hover:bg-gray-50"
                            onClick={() => switchMode('login')}>
                            Back to Sign in
                        </button>
                    )}
                </form>
                <div className="mt-6 text-center text-xs font-semibold text-gray-500">
                    By continuing, you agree this is not medical advice and is for educational purposes only.
                </div>
            </div>
        </div>
    );
}