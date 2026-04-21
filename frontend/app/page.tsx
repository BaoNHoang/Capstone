'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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

const CAROUSEL_TILES = [
    { title: 'Dashboard', subtitle: 'Make your prediction', href: '/dashboard', img: bp('/backgrounds/bg1.jpg') },
    { title: 'About', subtitle: 'Learn more about MedPredict', href: '/about', img: bp('/backgrounds/bg2.jpg') },
    { title: 'Product', subtitle: 'Shop our medical tools', href: '/product', img: bp('/backgrounds/bg3.jpg') },
    { title: 'Technology', subtitle: 'Our advanced AI models', href: '/technology', img: bp('/backgrounds/bg4.jpg') },
    { title: 'Careers', subtitle: 'Join our team', href: '/careers', img: bp('/backgrounds/bg5.jpg') },
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
        </motion.div>
    );
}

function HorizontalCarousel4Up() {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const [mouseMode, setMouseMode] = useState(false);
    const mouseModeTimeout = useRef<number | null>(null);

    const pingMouseMode = () => {
        setMouseMode(true);
        if (mouseModeTimeout.current) 
            window.clearTimeout(mouseModeTimeout.current);
        mouseModeTimeout.current = window.setTimeout(() => setMouseMode(false), 2500);
    };

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            const canScrollX = el.scrollWidth > el.clientWidth;
            if (!canScrollX) 
                return;

            const isVerticalScrollIntent = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
            if (!isVerticalScrollIntent) 
                return;

            e.preventDefault();
            pingMouseMode();
            el.scrollBy({
                left: e.deltaY,
                behavior: 'auto',
            });
        };

        const onMouseMove = () => pingMouseMode();

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('mousemove', onMouseMove);

        return () => {
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <div className="relative">
            <div
                ref={scrollerRef}
                aria-label="Explore carousel"
                className={[
                    'overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory',
                    mouseMode ? 'mouse-scrollbar' : 'no-scrollbar',
                ].join(' ')}
                style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehaviorX: 'contain',
                    scrollbarWidth: mouseMode ? 'auto' : 'none',
                }}
            >
                <div className="flex w-max gap-4 py-3 pr-4">
                    {CAROUSEL_TILES.map((t, i) => (
                        <Link
                            key={`${t.title}-${i}`}
                            href={t.href}
                            className="group relative block shrink-0 snap-start overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm w-[82vw] sm:w-[60vw] md:w-[42vw] lg:w-[30vw] xl:w-[23vw]" >
                            <div
                                className="h-[180px] sm:h-[210px] md:h-[230px] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url(${t.img})` }} />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/35 to-black/85" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                                <div className="text-lg sm:text-xl font-extrabold text-white">
                                    {t.title}
                                </div>
                                <div className="mt-1 text-xs sm:text-sm font-semibold text-white/85">
                                    {t.subtitle}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    const [loginOpen, setLoginOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const [headlineStep, setHeadlineStep] = useState<0 | 1>(0);
    const [id, setID] = useState<ID | null>(null);
    const startedRef = useRef(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [welcomeOpen, setWelcomeOpen] = useState(false);
    const [welcomeFirstName, setWelcomeFirstName] = useState('');

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const t = window.setTimeout(() => {
            setHeadlineStep(1);
        }, 2600);

        return () => window.clearTimeout(t);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(Math.floor(Math.random() * BACKGROUNDS.length));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const all = [...BACKGROUNDS, ...CAROUSEL_TILES.map((t) => t.img)];
        all.forEach((src) => {
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
            <section className="relative min-h-screen overflow-hidden">
                <AnimatePresence>
                    <motion.div
                        key={index}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${BACKGROUNDS[index]})` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, ease: 'easeInOut' }} />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
                <SiteHeader
                    authed={!!id}
                    onLoginClick={() => setLoginOpen(true)}
                    onLogoutClick={() => setLogoutOpen(true)} />
                <div className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8 pb-24 pt-10">
                    <motion.div
                        className="max-w-4xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.8 }}>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={headlineStep}
                                initial={{ opacity: 0, y: -14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.7, ease: 'easeInOut' }}>
                                {headlineStep === 0 ? (
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                                        Turning Data Into Better Health Decisions
                                    </h1>
                                ) : (
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                                        Make predictions based on your health numbers
                                    </h1>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                    <motion.p
                        className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl font-semibold text-white/85"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.8 }}>
                        Analyzes common data to estimate risk for diseases
                    </motion.p>
                    <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center px-4">
                        <motion.p
                            className="text-white/70 hover:text-white text-xs sm:text-sm font-bold leading-tight text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25, duration: 0.8 }}>
                            Scroll to explore
                            <motion.span
                                className="block -mt-1"
                                initial={{ opacity: 0, y: -18 }}
                                animate={{ y: [0, 5, 0], opacity: 1 }}
                                transition={{ duration: 2, repeat: Infinity }}>
                                <span className="text-2xl sm:text-3xl font-extrabold">⌄</span>
                            </motion.span>
                        </motion.p>
                    </div>
                </div>
            </section>

            <section id="explore" className="bg-white">
                <div className="mx-auto max-w-8xl px-4 sm:px-6 py-4 sm:py-6">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                            Explore
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-gray-500">→</div>
                    </div>
                    <HorizontalCarousel4Up />
                </div>
            </section>

            <Reveal>
                <section id="platform" className="bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
                        <div className="grid gap-8 lg:gap-10 md:grid-cols-2 md:items-start">
                            <div>
                                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                                    <p>One platform</p>
                                    <p>Clear results</p>
                                </h2>
                                <div className="mt-4 text-base sm:text-lg text-gray-600 font-semibold">
                                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                                        {' '}MedPredict{' '}
                                    </span>
                                    turns your everyday health numbers into a risk summary so you can
                                    understand what they may mean and take smarter next steps. As we grow, the same experience
                                    will support more conditions without changing how you use the app.
                                    <div className="mt-3 text-xs sm:text-sm text-gray-600">
                                        <span className="font-bold text-gray-600">Note: </span>
                                        This is a fictional product created for demonstration purposes only. It does not
                                        provide real medical predictions or advice. Always consult a healthcare
                                        professional for medical concerns.
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="p-4">
                                        <div className="text-base sm:text-lg font-extrabold text-gray-900">
                                            Pick how you want your results calculated
                                        </div>
                                        <p className="mt-1 text-sm font-semibold text-gray-600">
                                            Choose from multiple prediction options all in one dropdown
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-lg font-extrabold text-gray-900">
                                            A clear risk stage with a confidence score
                                        </div>
                                        <p className="mt-1 text-sm font-semibold text-gray-600">
                                            Every prediction is delivered so it is easy to understand and compare
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
                                <div className="text-sm font-extrabold text-gray-900">What you get</div>
                                <div className="mt-5 grid gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                                        <div>
                                            <div className="font-extrabold text-gray-900">Guided data entry</div>
                                            <div className="text-sm font-semibold text-gray-600">
                                                Built around common numbers people already have to make it easy to get predictions without needing extra tests or devices.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                                        <div>
                                            <div className="font-extrabold text-gray-900">Fast, reliable predictions</div>
                                            <div className="text-sm font-semibold text-gray-600">
                                                Designed to return results quickly and consistently so you can get the information you need when it matters most.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                                        <div>
                                            <div className="font-extrabold text-gray-900">Your history in one place</div>
                                            <div className="text-sm font-semibold text-gray-600">
                                                Save past inputs and predictions to track trends over time in your dashboard and support more informed health decisions.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                                        <div>
                                            <div className="font-extrabold text-gray-900">Built to expand</div>
                                            <div className="text-sm font-semibold text-gray-600">
                                                Starting with a foundation that supports adding more conditions as the platform grows without changing how you use it.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            <section id="partners" className="mb-16 sm:mb-20">
                <Reveal>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="max-w-4xl">
                            <h2 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                                Built alongside teams
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                                    who care about outcomes
                                </span>
                            </h2>
                            <p className="mt-4 sm:mt-6 text-base sm:text-lg font-semibold leading-relaxed text-gray-600">
                                A system designed with input from fictional research groups, community health programs,
                                and privacy-first infrastructure teams. These collaborations help us test the product
                                experience from data entry to risk explanations so that the results stay accurate, clear, and useful.
                            </p>
                        </div>
                        <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
                            <div className="border-l-4 border-blue-200 pl-4 sm:pl-6">
                                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                                    Clinical + Research Partner
                                </div>
                                <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900">
                                    Tidewater Cardio Collaborative
                                </h3>
                                <p className="mt-3 text-sm sm:text-base font-semibold text-gray-600">
                                    A fictional network of clinicians and researchers that helps us refine how we translate
                                    metrics into understandable risk stages. Their feedback focuses on clarity, consistency,
                                    and avoiding medical jargon where it doesn’t help.
                                </p>
                                <ul className="mt-5 space-y-2 text-sm font-semibold text-gray-700 list-disc pl-5">
                                    <li>Helps review risk stage labeling and explanation tone</li>
                                    <li>Validates “what to do next” language for readability</li>
                                    <li>Advises on the most common inputs people already have access to</li>
                                </ul>
                            </div>
                            <div className="border-l-4 border-purple-400 pl-4 sm:pl-6">
                                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                                    Community Program Partner
                                </div>
                                <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900">
                                    BrightBridge Wellness Coalition
                                </h3>
                                <p className="mt-3 text-sm sm:text-base font-semibold text-gray-600">
                                    A fictional community health partner that helps us keep MedPredict approachable. They guide
                                    how we present steps, offer context, and keep the experience encouraging, especially for
                                    people using health apps for the first time.
                                </p>
                                <ul className="mt-5 space-y-2 text-sm font-semibold text-gray-700 list-disc pl-5">
                                    <li>Tests the guided data-entry flow for simplicity</li>
                                    <li>Improves “next steps” recommendations to be practical</li>
                                    <li>Helps design language that feels supportive, not scary</li>
                                </ul>
                            </div>
                            <div className="border-l-4 border-gray-900 pl-4 sm:pl-6">
                                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                                    Privacy + Infrastructure Partner
                                </div>
                                <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900">
                                    Northstar Secure Cloud
                                </h3>
                                <p className="mt-3 text-sm sm:text-base font-semibold text-gray-600">
                                    A fictional infrastructure partner supporting secure authentication and reliable
                                    performance. Their guidance informs how we think about encryption, access controls, and
                                    keeping yours and ours sensitive information protected.
                                </p>
                                <ul className="mt-5 space-y-2 text-sm font-semibold text-gray-700 list-disc pl-5">
                                    <li>Advises on authentication and account security patterns</li>
                                    <li>Helps define safe defaults for data storage and access</li>
                                    <li>Reviews system reliability and performance under load</li>
                                </ul>
                            </div>
                            <div className="border-l-4 border-blue-600 pl-4 sm:pl-6">
                                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                                    Data + Evaluation Partner
                                </div>
                                <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900">
                                    Crescent Metrics Lab
                                </h3>
                                <p className="mt-3 text-sm sm:text-base font-semibold text-gray-600">
                                    A fictional evaluation lab that helps us check model behavior and user outputs.
                                    Established in 1984, they have decades of experience evaluating medical models and algorithms to ensure they meet high standards for reliability and clarity.
                                </p>
                                <ul className="mt-5 space-y-2 text-sm font-semibold text-gray-700 list-disc pl-5">
                                    <li>Reviews prediction stability across common input ranges</li>
                                    <li>Helps design confidence and uncertainty explanations</li>
                                    <li>Flags confusing edge cases that need product fixes</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Reveal>
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