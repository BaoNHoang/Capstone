'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import LoginModal from '@/components/LoginModal';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import Welcome from '@/components/Welcome';

const API_BASE = "/api";
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
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
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

export default function TechnologyPage() {
    const [loginOpen, setLoginOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const [id, setID] = useState<ID | null>(null);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [welcomeOpen, setWelcomeOpen] = useState(false);
    const [welcomeFirstName, setWelcomeFirstName] = useState('');


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
            const res = await fetch(`${API_BASE}/auth/cookie`, {
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
        } finally {
            setID(null);
            setLogoutOpen(false);
            setLoginOpen(true);
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
                        transition={{ duration: 1.4, ease: 'easeInOut' }}
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
                <SiteHeader
                    authed={!!id}
                    onLoginClick={() => setLoginOpen(true)}
                    onLogoutClick={() => setLogoutOpen(true)} />
                <div className="relative mx-auto flex min-h-[calc(30vh-72px)] max-w-6xl flex-col justify-center px-6 pb-2">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                            Technology
                        </h1>
                    </div>
                    <p className="mt-5 max-w-2xl text-lg font-semibold text-white/85 md:text-xl">
                        Learn more about MedPredict was built.
                    </p>
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-extrabold text-gray-900">How it works</h2>
                        <p className="mt-4 text-lg font-semibold leading-relaxed text-gray-600">
                            MedPredict is medical prediction proxy application designed to behave like a product. The goal is to convert
                            common health numbers into a clear stage and explanation, while keeping the experience fast and readable.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                title: 'Input normalization',
                                body:
                                    'We validate ranges, handle missing values safely, and standardize the format of user inputs so models behave consistently.',
                                label: 'Examples',
                                bullets: ['Range checks (e.g., BP, cholesterol)', 'Safe defaults for “unknown” fields'],
                            },
                            {
                                title: 'Risk staging',
                                body:
                                    'The core model converts inputs into a stage label and a 0–100 style risk score so results are easy to interpret.',
                                label: 'Outputs',
                                bullets: ['Stage 1–4 classification', 'Risk score for ranking + trends'],
                            },
                            {
                                title: 'Recommendation + explanation',
                                body:
                                    'Every result is paired with a recommendation and a short, readable “why” section that highlights the biggest contributors.',
                                label: 'Behavior',
                                bullets: ['Recommendation for next steps', 'Key drivers shown in plain language'],
                            },
                        ].map((s) => (
                            <div key={s.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="mt-2 text-smed font-extrabold text-gray-900">{s.title}</div>
                                <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-600">{s.body}</p>
                                <div className="mt-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">{s.label}</div>
                                <ul className="mt-2 space-y-2 text-sm font-semibold text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                        <span>{s.bullets[0]}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
                                        <span>{s.bullets[1]}</span>
                                    </li>
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id='pipeline' className="mb-20">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-extrabold text-gray-900">Pipeline & Technology Stack</h2>
                        <p className="mt-4 text-lg font-semibold leading-relaxed text-gray-600">
                            A system built to make it easy to add new additions.
                        </p>
                    </div>
                    <Reveal>
                        <div className="mt-10 grid gap-6 md:grid-cols-2">
                            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="text-lg font-extrabold text-gray-900">Frontend</div>
                                <p className="mt-2 text-sm font-semibold text-gray-600">
                                    Next.js + React.js + TailwindCSS for fast, responsive pages and consistent UI components.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">Next.js</span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">React</span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">Tailwind</span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">Framer Motion</span>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="text-lg font-extrabold text-gray-900">API & model serving</div>
                                <p className="mt-2 text-sm font-semibold text-gray-600">
                                    FastAPI for validation of inputs, running the model, and returning a structured result.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">FastAPI</span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">Python</span>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="text-lg font-extrabold text-gray-900">Data & storage</div>
                                <p className="mt-2 text-sm font-semibold text-gray-600">
                                    Secure user accounts + saved runs + history views. Designed to keep storage minimal and intentional.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">PostgreSQL</span>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="text-lg font-extrabold text-gray-900">Deployment</div>
                                <p className="mt-2 text-sm font-semibold text-gray-600">
                                    Optimized for fast web delivery. Can run as static-friendly UI + API backend hosted separately.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">Docker</span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-700">AWS</span>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
            <SiteFooter />
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