'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

type ID = {
  id: number;
  username?: string;
};

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">{title}</div>
      {subtitle ? <div className="mt-2 text-sm font-semibold text-gray-600">{subtitle}</div> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [id, setID] = useState<ID | null>(null);
  const [loading, setLoading] = useState(true);


  const displayName = useMemo(() => {
    if (!id) return '';
    return id.username?.trim() ? id.username : `User #${id.id}`;
  }, [id]);

  async function process() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me_cookie`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        setID(null);
        return;
      }

      const data = (await res.json()) as ID;
      setID(data);
    } catch {
      setID(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    process();
  }, []);

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
    } finally {
      setID(null);
      router.push('/');
    }
  }

  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-850 to-slate-700" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div
                className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                MedPredict
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-white/25"
                  onClick={() => router.push('/')}>
                  Home
                </button>
                <button
                  className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-100"
                  onClick={() => router.push('/')}>
                  Predictor
                </button>
                {id ? (
                  <button
                    className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-800"
                    onClick={logout}>
                    Logout
                  </button>
                ) : (
                  <button
                    className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-white/15"
                    onClick={() => setLoginOpen(true)}>
                    Login
                  </button>
                )}
              </div>
            </div>
            <div>
              {loading ? (
                <div className="h-5 w-56 animate-pulse rounded bg-white/15" />
              ) : id ? (
                <div className="text-lg font-extrabold text-white">
                  <h1 className="text-4xl font-extrabold text-white md:text-5xl">
                    Welcome back, <span className="text-white/90">{displayName}</span> </h1>
                </div>
              ) : (
                <div className="text-lg font-extrabold text-white">
                  You’re not signed in. Login to access your tools and saved results.
                </div>
              )}
              <div className="mt-3 text-sm font-semibold text-white/75">
                Note: This dashboard is for informational product features only and does not provide medical advice.
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                <div className="mt-4 h-6 w-44 animate-pulse rounded bg-gray-100" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                <div className="mt-6 h-10 w-32 animate-pulse rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>
        ) : !id ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Card title="Access required" subtitle="Sign in to use your medical tools and view history.">
                <div className="space-y-3 text-sm font-semibold text-gray-700">
                  <div>• Run predictions from your personal predictor page</div>
                  <div>• Save and view prior runs (once you add storage later)</div>
                  <div>• Keep your session private with account login</div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
                    onClick={() => setLoginOpen(true)}>
                    Go to Login
                  </button>
                  <button
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-50"
                    onClick={() => router.push('/')}>
                    Back to Home
                  </button>
                </div>
              </Card>
            </div>
            <div className="lg:col-span-5">
              <Card title="Predictor preview" subtitle="You can still view the predictor page UI.">
                <p className="text-sm font-semibold text-gray-700">
                  If your predictor page doesn’t require authentication yet, you can open it now.
                </p>
                <div className="mt-6">
                  <button
                    className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700"
                    onClick={() => router.push('/')}>
                    Open Predictor
                  </button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card title="Account" subtitle={displayName}>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">User ID</div>
                  <div className="mt-1 text-lg font-extrabold text-gray-900">{id.id}</div>
                </div>
            </Card>
            <Card title="Medical tools">
              <div className="space-y-3 text-sm font-semibold text-gray-700">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-extrabold text-gray-900">Atherosclerosis Risk Predictor</div>
                  <div className="mt-1 text-xs font-semibold text-gray-600">
                    Enter basic health inputs and receive a risk score + potential stage.
                  </div>
                  <button
                    className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
                    onClick={() => router.push("/")}>
                    Open tool
                  </button>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-extrabold text-gray-900">Results History</div>
                  <div className="mt-1 text-xs font-semibold text-gray-600">
                    (Placeholder) Add DB storage later to save prior predictions.
                  </div>
                  <button
                    className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-extrabold text-gray-900 hover:bg-gray-50"
                    onClick={() => alert('Reminder to fill')}>
                    View history
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false);
          process();
        }} />
    </main>
  );
}