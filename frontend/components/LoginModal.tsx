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
            <ul>
                <li className={itemClass(checks.minLength)}>At least 6 characters</li>
                <li className={itemClass(checks.lowercase)}>A lowercase letter</li>
                <li className={itemClass(checks.uppercase)}>An uppercase letter</li>
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
    const [email, setEmail] = useState('');
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginCode, setLoginCode] = useState('');
    const [loginToken, setLoginToken] = useState('');
    const [signupCode, setSignupCode] = useState('');
    const [signupToken, setSignupToken] = useState('');
    const [sendingSignupCode, setSendingSignupCode] = useState(false);
    const [signupCodeSent, setSignupCodeSent] = useState(false);
    const [forgotIdentifier, setForgotIdentifier] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingLoginCode, setSendingLoginCode] = useState(false);
    const [sendingResetCode, setSendingResetCode] = useState(false);
    const [loginCodeSent, setLoginCodeSent] = useState(false);
    const [resetCodeSent, setResetCodeSent] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const shouldValidatePassword = mode === 'signup' || mode === 'forgot';
    const passwordValid = isPasswordValid(password);

    useEffect(() => {
        if (!open) return;
        setErr(null);
        setSuccessMsg(null);
        setLoading(false);
        setSendingLoginCode(false);
        setSendingSignupCode(false);
        setSendingResetCode(false);
        setLoginCodeSent(false);
        setSignupCodeSent(false);
        setResetCodeSent(false);
        setForgotIdentifier('');
        setMode('login');
        setUsername('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
        setEmail('');
        setLoginIdentifier('');
        setLoginPassword('');
        setLoginCode('');
        setLoginToken('');
        setSignupCode('');
        setSignupToken('');
        setResetCode('');
        setResetToken('');
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
        return 'Confirm your credentials to set a new password.';
    }, [mode]);

    if (!open) return null;

    function clearSharedMessages() {
        setErr(null);
        setSuccessMsg(null);
    }
    function switchMode(nextMode: Mode) {
        clearSharedMessages();
        setLoading(false);
        setSendingLoginCode(false);
        setSendingSignupCode(false);
        setSendingResetCode(false);
        setMode(nextMode);
        setUsername('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
        setEmail('');
        setLoginIdentifier('');
        setLoginPassword('');
        setLoginCode('');
        setLoginToken('');
        setLoginCodeSent(false);
        setSignupCode('');
        setSignupToken('');
        setSignupCodeSent(false);
        setResetCode('');
        setResetToken('');
        setResetCodeSent(false);
    }

    async function sendLoginCode() {
        clearSharedMessages();

        if (!loginIdentifier.trim()) {
            setErr('Please enter your username or email.');
            return;
        }

        if (!loginPassword.trim()) {
            setErr('Please enter your password.');
            return;
        }

        setSendingLoginCode(true);

        try {
            const res = await fetch(`${API_BASE}/auth/send-login-code`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: loginIdentifier,
                    password: loginPassword,
                }),
            });

            let data = null;
            try {
                data = await res.json();
            } catch { }

            if (!res.ok) {
                throw new Error(data?.detail || 'Failed to send sign-in code');
            }

            setLoginToken(data?.loginToken || '');
            setLoginCodeSent(true);
            setSuccessMsg('Sign-in code sent to your email.');
        } catch (e: any) {
            setErr(e?.message || 'Something went wrong');
        } finally {
            setSendingLoginCode(false);
        }
    }

    async function sendSignupCode() {
        clearSharedMessages();

        if (!email.trim()) {
            setErr('Please enter your email first.');
            return;
        }

        setSendingSignupCode(true);

        try {
            const res = await fetch(`${API_BASE}/auth/send-signup-code`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                }),
            });

            let data = null;
            try {
                data = await res.json();
            } catch { }

            if (!res.ok) {
                throw new Error(data?.detail || 'Failed to send sign-up code');
            }

            setSignupToken(data?.signupToken || '');
            setSignupCodeSent(true);
            setSuccessMsg('Sign-up code sent to your email.');
        } catch (e: any) {
            setErr(e?.message || 'Something went wrong');
        } finally {
            setSendingSignupCode(false);
        }
    }

    async function sendForgotPasswordCode() {
        clearSharedMessages();

        if (!forgotIdentifier.trim()) {
            setErr('Please enter your username or email.');
            return;
        }

        if (!dateOfBirth) {
            setErr('Please enter your date of birth.');
            return;
        }

        setSendingResetCode(true);

        try {
            const res = await fetch(`${API_BASE}/auth/send-forgot-password-code`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: forgotIdentifier,
                    dateOfBirth,
                }),
            });

            let data = null;
            try {
                data = await res.json();
            } catch { }

            if (!res.ok) {
                throw new Error(data?.detail || 'Failed to send reset code');
            }

            setResetToken(data?.resetToken || '');
            setResetCodeSent(true);
            setSuccessMsg('Password reset code sent to your email.');
        } catch (e: any) {
            setErr(e?.message || 'Something went wrong');
        } finally {
            setSendingResetCode(false);
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        clearSharedMessages();
        if (shouldValidatePassword && !passwordValid) {
            setErr(
                'Password must be at least 6 characters and include a lowercase letter, an uppercase letter, and a number.'
            );
            return;
        }

        if (mode === 'login' && !loginToken) {
            setErr('Please send your sign-in code first.');
            return;
        }

        if (mode === 'login' && !loginCode.trim()) {
            setErr('Please enter the sign-in code from your email.');
            return;
        }

        if (mode === 'signup' && !signupToken) {
            setErr('Please send your sign-up code first.');
            return;
        }

        if (mode === 'signup' && !signupCode.trim()) {
            setErr('Please enter the sign-up code from your email.');
            return;
        }

        if (mode === 'forgot' && !resetToken) {
            setErr('Please send your password reset code first.');
            return;
        }

        if (mode === 'forgot' && !resetCode.trim()) {
            setErr('Please enter the password reset code from your email.');
            return;
        }

        setLoading(true);

        try {
            let path = '';
            let body: Record<string, string> = {};

            if (mode === 'login') {
                path = '/auth/login';
                body = {
                    identifier: loginIdentifier,
                    password: loginPassword,
                    verificationCode: loginCode,
                    loginToken,
                };
            } else if (mode === 'signup') {
                path = '/auth/signup';
                body = {
                    username,
                    password,
                    firstName,
                    lastName,
                    dateOfBirth,
                    email,
                    verificationCode: signupCode,
                    signupToken,
                };
            } else {
                path = '/auth/forgot-password';
                body = {
                    identifier: forgotIdentifier,
                    dateOfBirth,
                    verificationCode: resetCode,
                    resetToken,
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
                setResetCode('');
                setResetToken('');
                setResetCodeSent(false);
                setMode('login');
                return;
            }
            const resolvedFirstName =
                data?.firstName?.trim?.() || firstName.trim() || '';
            onSuccess(resolvedFirstName);
            onClose();
        } catch (e: any) {
            setErr(e?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
            onClick={onClose}>
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
                <div
                    className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl max-h-[90vh] overflow-y-auto sm:p-6 md:max-w-md md:p-8"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                                {title}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="mt-5 sm:mt-6">
                        {mode === 'login' && (
                            <>
                                <label className="block text-sm font-bold text-gray-800">Username or Email</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={loginIdentifier}
                                    onChange={(e) => {
                                        setLoginIdentifier(e.target.value);
                                        setLoginCode('');
                                        setLoginToken('');
                                        setLoginCodeSent(false);
                                    }}
                                    autoComplete="username"
                                    required />
                                <label className="mt-4 block text-sm font-bold text-gray-800">Password</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={loginPassword}
                                    onChange={(e) => {
                                        setLoginPassword(e.target.value);
                                        setLoginCode('');
                                        setLoginToken('');
                                        setLoginCodeSent(false);
                                    }}
                                    type="password"
                                    autoComplete="current-password"
                                    required />
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                        className="w-full rounded-lg border border-gray-200 p-2 text-black"
                                        value={loginCode}
                                        onChange={(e) => setLoginCode(e.target.value)}
                                        placeholder="Enter sign-in code"
                                        required/>
                                    <button
                                        type="button"
                                        onClick={sendLoginCode}
                                        disabled={sendingLoginCode || !loginIdentifier.trim() || !loginPassword.trim()}
                                        className="w-full sm:w-auto cursor-pointer whitespace-nowrap rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-60">
                                        {sendingLoginCode ? 'Sending...' : loginCodeSent ? 'Resend Code' : 'Send Code'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="cursor-pointer mt-2 block text-left text-xs font-medium text-blue-600 hover:text-blue-700"
                                    onClick={() => switchMode('forgot')}>
                                    Forgot Password?
                                </button>
                            </>
                        )}
                        {mode === 'signup' && (
                            <>
                                <label className="block text-sm font-bold text-gray-800">First Name</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required />
                                <label className="mt-4 block text-sm font-bold text-gray-800">Last Name</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required />
                                <label className="mt-4 block text-sm font-bold text-gray-800">Date of Birth</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    type="date"
                                    required />
                                <label className="mt-4 block text-sm font-bold text-gray-800">Email</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={email}
                                    onChange={(e) => {setEmail(e.target.value); setSignupCode(''); setSignupToken(''); setSignupCodeSent(false);}}
                                    type="email"
                                    autoComplete="email"
                                    required />
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                        className="w-full rounded-lg border border-gray-200 p-2 text-black"
                                        value={signupCode}
                                        onChange={(e) => setSignupCode(e.target.value)}
                                        placeholder="Enter sign-up code"
                                        required />
                                    <button
                                        type="button"
                                        onClick={sendSignupCode}
                                        disabled={sendingSignupCode || !email.trim()}
                                        className="w-full sm:w-auto cursor-pointer whitespace-nowrap rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-60">
                                        {sendingSignupCode ? 'Sending...' : signupCodeSent ? 'Resend Code' : 'Send Code'}
                                    </button>
                                </div>
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
                                    autoComplete="new-password"
                                    minLength={6}
                                    pattern={PASSWORD_REGEX.source}
                                    title="Password must be at least 6 characters and include a lowercase letter, an uppercase letter, and a number."
                                    required />
                                <PasswordRequirements password={password} />
                            </>
                        )}
                        {mode === 'forgot' && (
                            <>
                                <label className="block text-sm font-bold text-gray-800">Username or Email</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={forgotIdentifier}
                                    onChange={(e) => {
                                        setForgotIdentifier(e.target.value);
                                        setResetCode('');
                                        setResetToken('');
                                        setResetCodeSent(false);
                                    }}
                                    autoComplete="username"
                                    required />
                                <label className="mt-4 block text-sm font-bold text-gray-800">Date of Birth</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={dateOfBirth}
                                    onChange={(e) => {
                                        setDateOfBirth(e.target.value);
                                        setResetCode('');
                                        setResetToken('');
                                        setResetCodeSent(false);
                                    }}
                                    type="date"
                                    required />
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                        className="w-full rounded-lg border border-gray-200 p-2 text-black"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                        placeholder="Enter reset code"
                                        required />
                                    <button
                                        type="button"
                                        onClick={sendForgotPasswordCode}
                                        disabled={sendingResetCode || !forgotIdentifier.trim() || !dateOfBirth}
                                        className="w-full sm:w-auto cursor-pointer whitespace-nowrap rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-60">
                                        {sendingResetCode ? 'Sending...' : resetCodeSent ? 'Resend Code' : 'Send Code'}
                                    </button>
                                </div>
                                <label className="mt-4 block text-sm font-bold text-gray-800">New Password</label>
                                <input
                                    className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={6}
                                    pattern={PASSWORD_REGEX.source}
                                    title="Password must be at least 6 characters and include a lowercase letter, an uppercase letter, and a number."
                                    required />
                                <PasswordRequirements password={password} />
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
                            className="cursor-pointer mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                            {loading
                                ? 'Please wait...'
                                : mode === 'login'
                                    ? 'Sign in'
                                    : mode === 'signup'
                                        ? 'Create account'
                                        : 'Update password'}
                        </button>

                        {mode === 'login' && (
                            <button
                                type="button"
                                className="cursor-pointer mt-3 w-full rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-900 hover:bg-gray-50"
                                onClick={() => switchMode('signup')}>
                                Create Account
                            </button>
                        )}

                        {mode === 'signup' && (
                            <button
                                type="button"
                                className="cursor-pointer mt-3 w-full rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-900 hover:bg-gray-50"
                                onClick={() => switchMode('login')}>
                                Sign in
                            </button>
                        )}
                        {mode === 'forgot' && (
                            <button
                                type="button"
                                className="cursor-pointer mt-3 w-full rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-900 hover:bg-gray-50"
                                onClick={() => switchMode('login')}>
                                Back to Sign in
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}