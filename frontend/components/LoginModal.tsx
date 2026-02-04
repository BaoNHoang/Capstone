'use client';

import { useState } from 'react';

export default function LoginModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!open) return null;

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Temporary mock auth (replace with FastAPI login later)
        localStorage.setItem('access_token', 'demo-token');

        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-label="Close login modal"
            />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="text-2xl font-extrabold text-gray-900">Login</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Sign in to access Predictor and Dashboard.
                </p>
                <form onSubmit={onSubmit} className="mt-6">
                    <label className="block text-sm font-bold text-gray-800">Email</label>
                    <input
                        className="mt-2 w-full rounded-lg border p-2 text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                    <label className="mt-4 block text-sm font-bold text-gray-800">Password</label>
                    <input
                        className="mt-2 w-full rounded-lg border p-2 text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                    />
                    <button className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}
