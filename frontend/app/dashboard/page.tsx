'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import Welcome from '@/components/Welcome';

const API_BASE = '/api';

type ID = {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
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
            <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                {title}
            </div>
            {subtitle ? (
                <div className="mt-2 text-sm font-semibold text-gray-600">{subtitle}</div>
            ) : null}
            <div className="mt-5">{children}</div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [loginOpen, setLoginOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [id, setID] = useState<ID | null>(null);
    const [welcomeOpen, setWelcomeOpen] = useState(false);
    const [welcomeFirstName, setWelcomeFirstName] = useState('');

    const displayName = useMemo(() => {
        if (!id) return '';
        return id.firstName?.trim()
            ? id.firstName
            : id.username?.trim()
                ? id.username
                : `User #${id.id}`;
    }, [id]);

    async function process() {
        try {
            const res = await fetch(`${API_BASE}/auth/cookie`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!res.ok) {
                setID(null);
                setLoginOpen(true);
                return;
            }
            const data = (await res.json()) as ID;
            setID(data);
        } catch {
            setID(null);
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
        } finally {
            setID(null);
            setLogoutOpen(false);
            setLoginOpen(true);
        }
    }

    return (
        <main className="min-h-screen">
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-800 to-slate-700" />
                <div className="relative mx-auto max-w-7xl px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent">
                                MedPredict
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-white/25"
                                    onClick={() => router.push('/')}>
                                    Home
                                </button>
                                <button
                                    className="rounded-2xl bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-100"
                                    onClick={() => router.push('/predictor')}>
                                    Predictor
                                </button>
                                {id ? (
                                    <button
                                        className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-red-800"
                                        onClick={() => setLogoutOpen(true)}>
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
                            {id ? (
                                <div className="text-lg font-extrabold text-white">
                                    <h1 className="text-4xl font-extrabold text-white md:text-5xl">
                                        Hello <span className="text-white/90">{displayName}</span>
                                    </h1>
                                </div>
                            ) : (
                                <div className="text-lg font-extrabold text-white/80">
                                    Please login to access your dashboard
                                </div>
                            )}
                            <div className="mt-3 text-sm font-semibold text-white/75">
                                Note: This dashboard is for informational product features only.
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-10">
                {!id ? (
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
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card title="Account" subtitle={displayName}>
                            <div>
                                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                                    User ID
                                </div>
                                <div className="mt-1 text-lg font-extrabold text-gray-900">{id.id}</div>
                            </div>
                        </Card>
                        <Card title="Medical tools">
                            <div className="space-y-3 text-sm font-semibold text-gray-700">
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="text-sm font-extrabold text-gray-900">
                                        Atherosclerosis Risk Predictor
                                    </div>
                                    <div className="mt-1 text-xs font-semibold text-gray-600">
                                        Enter basic health inputs and receive a risk score + potential
                                        stage.
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        <button
                                            className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-700"
                                            onClick={() => router.push('/predictor')}>
                                            Open tool
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-extrabold text-gray-900 hover:bg-gray-50"
                                            onClick={() => router.push('/info')}>
                                            Info
                                        </button>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="text-sm font-extrabold text-gray-900">
                                        Results History
                                    </div>
                                    <div className="mt-1 text-xs font-semibold text-gray-600">
                                        View prediction history.
                                    </div>
                                    <button
                                        className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-extrabold text-gray-900 hover:bg-gray-50"
                                        onClick={() => router.push('/history')}>
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
                onSuccess={(firstName) => {
                    setLoginOpen(false);
                    process();
                    setWelcomeFirstName(firstName);
                    setWelcomeOpen(true);
                }} />
            <LogoutConfirmModal
                open={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                onConfirm={logout} />
            <Welcome
                open={welcomeOpen}
                firstName={welcomeFirstName}
                onClose={() => setWelcomeOpen(false)} />
        </main>
    );
}