'use client';

import { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

export default function LoginModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setLoading(false);
    setMode('login');
    setUsername('');
    setPassword('');
  }, [open]);

  const title = useMemo(() => (mode === 'login' ? 'Login' : 'Create account'), [mode]);
  const subtitle = useMemo(
    () =>
      mode === 'login'
        ? 'Sign in to access Predictor and Dashboard.'
        : 'Create an account to access MedPredict.',
    [mode]
  );

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/signup';
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.detail || 'Authentication failed');
      }

      onSuccess();
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
        aria-label="Close login modal"/>
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="mt-6">
          <label className="block text-sm font-bold text-gray-800">Email</label>
          <input
            className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="username"
            required
          />
          <label className="mt-4 block text-sm font-bold text-gray-800">Password</label>
          <input
            className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />

          {err && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
              {err}
            </div>
          )}
          
          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-900 hover:bg-gray-50"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create Account' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs font-semibold text-gray-500">
          By continuing, you agree this is not medical advice and is for educational purposes only.
        </div>
      </div>
    </div>
  );
}