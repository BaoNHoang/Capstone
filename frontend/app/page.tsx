'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const bp = (p: string) => `${BASE}${p}`;

const BACKGROUNDS = [
  bp('/backgrounds/bg1.jpg'),
  bp('/backgrounds/bg2.jpg'),
  bp('/backgrounds/bg3.jpg'),
  bp('/backgrounds/bg4.jpg'),
  bp('/backgrounds/bg5.jpg'),
];

const CAROUSEL_TILES = [
  { title: 'About', subtitle: 'Learn more about MedPredict', href: '/about', img: bp('/backgrounds/bg2.jpg') },
  { title: 'Products', subtitle: 'Shop our medical tools', href: '#', img: bp('/backgrounds/bg3.jpg') },
  { title: 'Technology', subtitle: 'Our advanced AI models', href: '#', img: bp('/backgrounds/bg4.jpg') },
  { title: 'Careers', subtitle: 'Join our team', href: '#', img: bp('/backgrounds/bg5.jpg') },
  { title: 'Privacy', subtitle: 'Your information is our priority', href: '#', img: bp('/backgrounds/bg1.jpg') },
];

interface Dot {
  left: string;
  top: string;
  animationDuration: string;
  animationDelay: string;
  color: string;
}

function FloatingDots() {
  const colors = ['bg-blue-300', 'bg-purple-300'];
  const [dots, setDots] = useState<Dot[] | null>(null);

  useEffect(() => {
    const generated = Array.from({ length: 35 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${8 + Math.random() * 10}s`,
      animationDelay: `${Math.random() * 4}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setDots(generated);
  }, []);

  if (!dots) return null;

  return (
    <>
      {dots.map((dot, i) => (
        <div
          key={i}
          className={`absolute h-2 w-2 rounded-full ${dot.color} animate-float`}
          style={{
            left: dot.left,
            top: dot.top,
            opacity: 0.35,
            animationDuration: dot.animationDuration,
            animationDelay: dot.animationDelay,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0 }}>
      {children}
    </motion.div>
  );
}

function HorizontalCarousel4Up() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white to-white/0 z-2" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-white to-white/0 z-2" />
      <div
        ref={scrollerRef}
        className="no-scrollbar overflow-x-auto scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
        aria-label="Explore carousel">
        <div className="flex gap-3 py-3" style={{ width: 'max-content' }}>
          <Reveal>
          {CAROUSEL_TILES.map((t, i) => (
            <a
              key={`${t.title}-${i}`}
              href={t.href}
              className="group relative shrink-0 overflow-hidden rounded-3xl border-1 border-gray-900 bg-white shadow-sm"
              style={{
                width: 'min(1000px, calc((100vw - 10px) / 4))',
              }}>
              <div
                className="h-[340px] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${t.img})` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/25 to-black/85" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-xl font-extrabold text-white">{t.title}</div>
                <div className="mt-1 text-sm font-semibold text-white/85">
                  {t.subtitle}
                </div>
              </div>
            </a>
          ))}
          </Reveal>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [authed, setAuthed] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const [index, setIndex] = useState(0);
  const [headlineStep, setHeadlineStep] = useState<0 | 1>(0);

  const startedRef = useRef(false);

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
            transition={{ duration: 2.2 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <FloatingDots />
        </div>
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/25 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              MedPredict
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="/about" className="text-sm font-semibold text-white/80 hover:text-white">
                About
              </a>
              <a href="#how" className="text-sm font-semibold text-white/80 hover:text-white">
                How it works
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
                onClick={() => setLoginOpen(true)}>
                Log in
              </button>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] max-w-6xl flex-col justify-center px-6 pb-20">
          <motion.div className="max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={headlineStep}
                initial={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                transition={{ duration: 0.8 }}>
                {headlineStep === 0 ? (
                  <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                    Turning Data Into Better Health Decisions
                  </h1>
                ) : (
                  <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                    Make predictions based on your health numbers
                  </h1>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.p
            className="mt-5 max-w-2xl text-lg font-semibold text-white/85 md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}>
            Analyzes common data to estimate risk for diseases starting with <span className="font-extrabold text-2xl">atherosclerosis</span>
          </motion.p>
          <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center">
            <motion.p className="text-white/80 hover:text-white text-sm font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.8 }}>
              Scroll to explore
              <motion.span
                className='block text-center'
                initial={{ opacity: 0, y: -18 }}
                animate={{ y: [0, 5, 0], opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity }}>
                🡇
              </motion.span>
            </motion.p>
          </div>
        </div>
      </section>

      <section id="explore" className="bg-white">
        <div className="mx-auto max-w-8xl px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
            </div>
            <div className="text-sm font-bold text-gray-500">→</div>
          </div>
          <div>
            <HorizontalCarousel4Up />
          </div>
        </div>
      </section>

      <Reveal>
        <section id="platform" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid gap-10 md:grid-cols-2 md:items-start">
              <div>
                <h2 className="text-6xl font-extrabold text-gray-900">
                  <p>One platform</p>
                  <p>Clear results</p>
                </h2>
                <p className="mt-4 text-lg text-gray-600 font-semibold">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"> MedPredict </span> turns your everyday health numbers into a risk summary so you can
                  understand what they may mean and take smarter next steps. As we grow, the same experience
                  will support more conditions without changing how you use the app.
                </p>
                <div className="mt-8 grid gap-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="mt-2 text-lg font-extrabold text-gray-900">
                      Pick how you want your results calculated.
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-600">
                      Choose from multiple prediction options all in one dropdown.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="mt-2 text-lg font-extrabold text-gray-900">
                      A clear risk stage with a confidence score.
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-600">
                      Every prediction is delivered so it’s easy to understand and compare.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="text-sm font-extrabold text-gray-900">What you get</div>
                <div className="mt-5 grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <div>
                      <div className="font-extrabold text-gray-900">Guided data entry</div>
                      <div className="text-sm font-semibold text-gray-600">
                        Built around common numbers people already have to make it easy to get predictions without needing extra tests or devices.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <div>
                      <div className="font-extrabold text-gray-900">Fast, reliable predictions</div>
                      <div className="text-sm font-semibold text-gray-600">
                        Designed to return results quickly and consistently so you can get the information you need when it matters most.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <div>
                      <div className="font-extrabold text-gray-900">Your history in one place</div>
                      <div className="text-sm font-semibold text-gray-600">
                        Save past inputs and predictions to track trends over time in your dashboard and support more informed health decisions.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
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

      <Reveal>
        <section id="partners" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="max-w-7xl">
              <h2 className="mt-1 text-m font-extrabold tracking-tight text-gray-900 md:text-5xl">
                Built alongside teams
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  who care about outcomes
                </span>
              </h2>
              <p className="mt-6 text-lg font-semibold leading-relaxed text-gray-600">
                MedPredict is designed with input from fictional research groups, community health programs,
                and privacy-first infrastructure teams. These collaborations help us test the product
                experience from data entry to risk explanations so that the results stay accurate, clear, and useful.
              </p>
            </div>
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              <div className="border-l-4 border-blue-200 pl-6">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  Clinical + Research Partner
                </div>
                <h3 className="mt-3 text-2xl font-extrabold text-gray-900">
                  Tidewater Cardio Collaborative
                </h3>
                <p className="mt-3 text-base font-semibold text-gray-600">
                  A fictional network of clinicians and researchers that helps us refine how we translate
                  metrics into understandable risk stages. Their feedback focuses on clarity, consistency,
                  and avoiding medical jargon where it doesn’t help.
                </p>
                <div className="mt-5 space-y-2 text-sm font-semibold text-gray-700">
                  <li>Helps review risk stage labeling and explanation tone</li>
                  <li>Validates “what to do next” language for readability</li>
                  <li>Advises on the most common inputs people already have access to</li>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/partners/tidewater-cardio-collaborative"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
                    View partner page →
                  </a>
                </div>
              </div>
              <div className="border-l-4 border-purple-400 pl-6">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  Community Program Partner
                </div>
                <h3 className="mt-3 text-2xl font-extrabold text-gray-900">
                  BrightBridge Wellness Coalition
                </h3>
                <p className="mt-3 text-base font-semibold text-gray-600">
                  A fictional community health partner that helps us keep MedPredict approachable. They guide
                  how we present steps, offer context, and keep the experience encouraging, especially for
                  people using health apps for the first time.
                </p>
                <div className="mt-5 space-y-2 text-sm font-semibold text-gray-700">
                  <li>Tests the guided data-entry flow for simplicity</li>
                  <li>Improves “next steps” recommendations to be practical</li>
                  <li>Helps design language that feels supportive, not scary</li>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/partners/brightbridge-wellness"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
                    View partner page →
                  </a>
                </div>
              </div>
              <div className="border-l-4 border-gray-900 pl-6">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  Privacy + Infrastructure Partner
                </div>
                <h3 className="mt-3 text-2xl font-extrabold text-gray-900">Northstar Secure Cloud</h3>
                <p className="mt-3 text-base font-semibold text-gray-600">
                  A fictional infrastructure partner supporting secure authentication and reliable
                  performance. Their guidance informs how we think about encryption, access controls, and
                  keeping yours and ours sensitive information protected.
                </p>
                <div className="mt-5 space-y-2 text-sm font-semibold text-gray-700">
                  <li>Advises on authentication and account security patterns</li>
                  <li>Helps define safe defaults for data storage and access</li>
                  <li>Reviews system reliability and performance under load</li>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/partners/northstar-secure-cloud"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
                    View partner page →
                  </a>
                </div>
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  Data + Evaluation Partner
                </div>
                <h3 className="mt-3 text-2xl font-extrabold text-gray-900">Crescent Metrics Lab</h3>
                <p className="mt-3 text-base font-semibold text-gray-600">
                  A fictional evaluation lab that helps us check model behavior and user outputs.
                  Established in 1984, they have decades of experience evaluating medical models and algorithms to ensure they meet high standards for reliability and clarity.
                </p>
                <div className="mt-5 space-y-2 text-sm font-semibold text-gray-700">
                  <li>Reviews prediction stability across common input ranges</li>
                  <li>Helps design confidence and uncertainty explanations</li>
                  <li>Flags confusing edge cases that need product fixes</li>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/partners/crescent-metrics-lab"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
                    View partner page →
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-14 border-t border-gray-200 pt-8">
              <p className="max-w-4xl text-sm font-semibold leading-relaxed text-gray-600">
                Note: The organizations above are fictional and shown as an example layout for a partners section.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/partners"
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95">
                  Explore all partners →
                </a>
                <a
                  href="/partners/apply"
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
                  Partner with us →
                </a>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="how" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="text-5xl font-extrabold text-gray-900">How it works</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="text-sm font-bold text-blue-400">Step 1</div>
                <div className="mt-2 text-lg font-extrabold text-gray-900">Login for privacy</div>
                <p className="mt-2 text-sm text-gray-600">
                  Your health inputs and prediction history are protected by your account.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="text-sm font-bold text-blue-400">Step 2</div>
                <div className="mt-2 text-lg font-extrabold text-gray-900">Enter your metrics</div>
                <p className="mt-2 text-sm text-gray-600">
                  Blood pressure, cholesterol, BMI, glucose, and other factors.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow flex flex-col h-full">
                <div className="text-sm font-bold text-blue-400">Step 3</div>
                <div className="mt-2 text-lg font-extrabold text-gray-900">Get results</div>
                <p className="mt-2 text-sm text-gray-600">
                  View risk stage, probability, and recommended next actions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className=" text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">MedPredict</div>
              <p className="text-sm">Turning Data Into Better Health Decisions</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="hover:text-blue-400">Twitter</a>
                <a href="#" className="hover:text-blue-400">LinkedIn</a>
                <a href="#" className="hover:text-blue-400">GitHub</a>
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-gray-700 pt-5 text-center text-sm">
            <p>&copy; 2026 MedPredict. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => setAuthed(true)}
      />
    </main>
  );
}
