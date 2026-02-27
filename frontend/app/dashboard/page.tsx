'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const bp = (p: string) => `${BASE}${p}`;

const BACKGROUNDS = [
  bp('/backgrounds/bg1.jpg'),
  bp('/backgrounds/bg2.jpg'),
  bp('/backgrounds/bg3.jpg'),
  bp('/backgrounds/bg4.jpg'),
  bp('/backgrounds/bg5.jpg'),
];

type ID = {
  id: number;
  username?: string;
};

function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.5, ease: 'easeOut', delay: 0 }}>
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [id, setID] = useState<ID | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = id?.username

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(Math.floor(Math.random() * BACKGROUNDS.length));
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    BACKGROUNDS.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  async function refreshMe() {
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
    refreshMe();
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
    <main className="relative min-h-screen overflow-x-hidden">
      <section className="relative min-h-[10vh] max-h-[300px] overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BACKGROUNDS[index]})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}/>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
        <SiteHeader
          authed={!!id}
          displayName={displayName}
          onLoginClick={() => setLoginOpen(true)}
          onLogoutClick={logout}/>
        <div className="relative mx-auto flex min-h-[calc(30vh-72px)] max-w-6xl flex-col justify-center px-6 pb-2">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">Dashboard</h1>
          </div>
          <p className="mt-4 max-w-2xl text-lg font-semibold text-white/85 md:text-xl">
            Your saved activity, predictions, and account info.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {loading ? (
            <div className="text-sm font-semibold text-gray-600">Loading…</div>
          ) : !id ? (
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold text-gray-900">Login first</h2>
                <p className="mt-3 text-lg font-semibold text-gray-600">
                  You need to be signed in to access the dashboard.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700"
                    onClick={() => setLoginOpen(true)}>
                    Open login
                  </button>
                  <button
                    className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-50"
                    onClick={() => router.push('/')}>
                    Back to home
                  </button>
                </div>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Account</div>
                    <div className="mt-2 text-2xl font-extrabold text-gray-900">{displayName}</div>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Status</div>
                    <div className="mt-2 text-2xl font-extrabold text-gray-900">Session active</div>
                  </div>
                </div>
              </div>
              </div>
          )}
        </div>
      </section>
      <SiteFooter />
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false);
          refreshMe();
        }}
      />
    </main>
  );
}