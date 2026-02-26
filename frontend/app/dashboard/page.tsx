'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

type Me = { id: number; email: string };

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [openLogin, setOpenLogin] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function fetchMe() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me_cookie`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        setMe(null);
        return;
      }

      const data = (await res.json()) as Me;
      setMe(data);
    } catch (e: any) {
      setErr(e?.message || 'Failed to reach API');
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    setErr(null);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e: any) {
      // even if logout fails, we can still clear local state
      setErr(e?.message || 'Logout failed');
    } finally {
      setMe(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm font-semibold text-gray-600">
            Your account and recent activity. (Dummy for now)
          </p>
        </div>

        <div className="text-right">
          {me ? (
            <>
              <div className="text-sm font-semibold text-gray-700">
                Signed in as <span className="font-extrabold">{me.email}</span>
              </div>
              <button
                onClick={logout}
                className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setOpenLogin(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {err && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {err}
        </div>
      )}

      <section className="mt-8">
        {loading ? (
          <p className="text-sm font-semibold text-gray-600">Loading…</p>
        ) : !me ? (
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">You’re not logged in</h2>
            <p className="mt-2 text-sm font-semibold text-gray-600">
              Sign in to access your predictor, saved runs, and account settings.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setOpenLogin(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Open Login
              </button>
              <Link
                href="/"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>

            <ul className="mt-6 list-disc pl-5 text-sm font-semibold text-gray-600">
              <li>After login, this page will show your history and saved inputs.</li>
              <li>For now it’s a dummy dashboard wired to your cookie session.</li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Overview</h2>
            <p className="mt-2 text-sm font-semibold text-gray-600">
              This is a placeholder dashboard. Add real sections once your predictor endpoints exist.
            </p>

            <div className="mt-6">
              <h3 className="text-lg font-extrabold text-gray-900">Quick links</h3>
              <ul className="mt-2 space-y-2 text-sm font-semibold">
                <li>
                  <Link href="/predictor" className="text-blue-700 hover:underline">
                    Go to Predictor
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="text-blue-700 hover:underline">
                    View Prediction History
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="text-blue-700 hover:underline">
                    Account Settings
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-gray-900">Status</h3>
              <ul className="mt-2 list-disc pl-5 text-sm font-semibold text-gray-600">
                <li>Backend: {API_BASE}</li>
                <li>Session: active (cookie-based)</li>
                <li>DB: PostgreSQL (via FastAPI)</li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-gray-900">Next steps</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm font-semibold text-gray-600">
                <li>Add a “saved inputs” table endpoint (later).</li>
                <li>Add a “recent predictions” endpoint (later).</li>
                <li>Replace dead links with real pages.</li>
              </ol>
            </div>
          </div>
        )}
      </section>

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSuccess={() => {
          // after login/signup, refresh session state
          fetchMe();
        }}
      />
    </main>
  );
}