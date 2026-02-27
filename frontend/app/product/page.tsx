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
        </motion.div>);
}

export default function ProductPage() {
    const router = useRouter();
    const [loginOpen, setLoginOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const [id, setID] = useState<ID | null>(null);
    const authed = !!id;

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

    async function process() {
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

    function addToAccount() {
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
                        transition={{ duration: 1.4, ease: 'easeInOut' }} />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
                <SiteHeader
                    authed={authed}
                    onLoginClick={() => setLoginOpen(true)}
                    onLogoutClick={logout} />
                <div className="relative mx-auto flex min-h-[calc(30vh-72px)] max-w-6xl flex-col justify-center px-6 pb-2">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                            Product
                        </h1>
                    </div>
                    <p className="mt-5 max-w-2xl text-lg font-semibold text-white/85 md:text-xl">
                        Learn more about our prediction tools, add-ons, and services.
                    </p>
                </div>
            </section>

            <section id="catalog" className="bg-white">
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-extrabold text-gray-900">Catalog</h2>
                        <p className="mt-3 text-lg font-semibold text-gray-600">
                            Add modules and services as your needs grow.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-lg font-extrabold text-gray-900">
                                        Atherosclerosis Risk Predictor
                                    </div>
                                </div>
                                <div className="rounded-full bg-gray-900 px-3 py-1 text-xs font-extrabold text-white">
                                    Flagship
                                </div>
                            </div>
                            <ul className="mt-5 space-y-2 text-sm font-semibold text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Stage + confidence signal</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
                                    <span>Key drivers in plain language</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                    <span>History tracking for comparisons</span>
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-lg font-extrabold text-gray-900">
                                        Metabolic Support Module
                                    </div>
                                </div>
                                <div className="rounded-full bg-gray-100 px-5 py-1 text-xs font-extrabold text-gray-700">
                                    Extension
                                </div>
                            </div>
                            <ul className="mt-5 space-y-2 text-sm font-semibold text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Fast inputs for quick checks</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
                                    <span>Trend-ready summaries</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Simple guidance + next steps</span>
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-lg font-extrabold text-gray-900">
                                        Advanced Calendar Data Tracker
                                    </div>
                                </div>
                                <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">
                                    Extension
                                </div>
                            </div>
                            <ul className="mt-5 space-y-2 text-sm font-semibold text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Clear categories you can understand</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
                                    <span>Notes + comparisons across dates</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Exportable summaries (Pro+)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Trusted for clarity
                        </h2>
                        <p className="mt-3 text-lg font-semibold text-gray-600">
                            A few words from early users.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                quote:
                                    'MedPredict turns my numbers into something I can actually explain to my family members.',
                                name: 'Jamie R.',
                                title: 'Volunteer EMT',
                            },
                            {
                                quote:
                                    'The confidence information and predictions make it feel transparent. It does not feel like just numbers.',
                                name: 'Avery K.',
                                title: 'Data Analyst',
                            },
                            {
                                quote:
                                    "It's simple, fast, and readable on mobile and my laptop. Exactly what health tools should feel like.",
                                name: 'Morgan S.',
                                title: 'Nursing Student',
                            },
                        ].map((t) => (
                            <div key={t.name} className="border bg-white p-6">
                                <div className="text-3xl font-extrabold text-gray-300">“</div>
                                <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-700">
                                    {t.quote}
                                </p>
                                <div className="mt-6 border-t border-gray-400 pt-4">
                                    <div className="text-sm font-extrabold text-gray-900">{t.name}</div>
                                    <div className="text-xs font-bold text-gray-500">{t.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Reveal>
                <section id="pricing" className="bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-16">
                        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-3xl">
                                <h2 className="text-4xl font-extrabold text-gray-900">Pricing</h2>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-6 md:grid-cols-3">
                            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                                <div className="text-sm font-extrabold text-gray-900">Starter</div>
                                <div className="mt-3 flex items-end gap-2">
                                    <div className="text-5xl font-extrabold text-gray-900">$0</div>
                                    <div className="pb-2 text-sm font-bold text-gray-500">/ month</div>
                                </div>
                                <p className="mt-3 text-sm font-semibold text-gray-600">
                                    Quick predictions for everyday curiosity and simple tracking.
                                </p>
                                <div className="mt-6 space-y-3 text-sm font-semibold text-gray-700">
                                    <li>Single condition predictions</li>
                                    <li>Basic confidence score</li>
                                    <li>View prediction history</li>
                                    <li>Access to basic prediction models</li>
                                </div>
                                <div className="mt-8">
                                    <button
                                        className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-50"
                                        onClick={() => (authed ? router.push('/dashboard') : setLoginOpen(true))}>
                                        {authed ? 'Continue to dashboard' : 'Get started'}
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-gray-900 bg-white p-8 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-extrabold text-gray-900">Pro</div>
                                    <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-extrabold text-white">
                                        Most popular
                                    </div>
                                </div>
                                <div className="mt-3 flex items-end gap-2">
                                    <div className="text-5xl font-extrabold text-gray-900">$12</div>
                                    <div className="pb-2 text-sm font-bold text-gray-500">/ month</div>
                                </div>
                                <p className="mt-3 text-sm font-semibold text-gray-600">
                                    Deeper history, more models, and cleaner comparisons over time.
                                </p>
                                <div className="mt-6 space-y-3 text-sm font-semibold text-gray-700">
                                    <li>Access to advance prediction models</li>
                                    <li>Unlimited saved runs</li>
                                    <li>Trend insights + comparisons</li>
                                    <li>Priority support</li>
                                </div>
                                <div className="mt-8">
                                    <button
                                        className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
                                        onClick={() => (authed ? addToAccount() : setLoginOpen(true))}>
                                        {authed ? 'Add to account' : 'Upgrade to Pro'}
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                                <div className="text-sm font-extrabold text-gray-900">Teams</div>
                                <div className="mt-3 flex items-end gap-2">
                                    <div className="text-5xl font-extrabold text-gray-900">$49</div>
                                    <div className="pb-2 text-sm font-bold text-gray-500">/ month</div>
                                </div>
                                <p className="mt-3 text-sm font-semibold text-gray-600">
                                    For clinics, labs, and evaluation teams that want shared insights.
                                </p>
                                <div className="mt-6 space-y-3 text-sm font-semibold text-gray-700">
                                    <li>Shared workspace + roles</li>
                                    <li>Exportable reports</li>
                                    <li>Audit-friendly activity log</li>
                                    <li>Dedicated onboarding</li>
                                </div>
                                <div className="mt-8">
                                    <button
                                        className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
                                        onClick={() => (authed ? addToAccount() : setLoginOpen(true))}>
                                        {authed ? 'Add to account' : 'Upgrade to Teams'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            <section id="FAQ" className="bg-white">
                <Reveal>
                    <div className="mx-auto max-w-7xl px-6 py-4">
                        <div className="max-w-3xl">
                            <h2 className="text-4xl font-extrabold text-gray-900">FAQ</h2>
                            <p className="mt-3 text-lg font-semibold text-gray-600">
                                Quick answers to common questions.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-6 md:grid-cols-2">
                            {[
                                {
                                    q: 'Is this medical advice?',
                                    a: 'No. MedPredict is educational support. Consult a qualified clinician for diagnosis and treatment.',
                                },
                                {
                                    q: 'What else do you sell besides the flagship model?',
                                    a: 'We offer add-on modules plus services like integrations, evaluation, and export/report packs.',
                                },
                                {
                                    q: 'Can teams share results?',
                                    a: 'Yes. Teams includes a shared workspace, roles, and exportable reports for evaluation workflows.',
                                },
                                {
                                    q: 'What happens to my data?',
                                    a: 'We design flows to minimize exposure and keep access intentional. Document the specifics on your privacy page.',
                                },
                            ].map((item) => (
                                <div key={item.q} className="rounded-3xl border border-gray-200 bg-white p-6">
                                    <div className="text-lg font-extrabold text-gray-900">{item.q}</div>
                                    <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 rounded-3xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">
                                        Ready to see your results clearly?
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-gray-600">
                                        Start with the demo flow, then upgrade when you want history and exports.
                                    </div>
                                </div>
                                <button
                                    onClick={() => setLoginOpen(true)}
                                    className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-extrabold text-white hover:bg-gray-800">
                                    Try it now
                                </button>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            <SiteFooter />

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