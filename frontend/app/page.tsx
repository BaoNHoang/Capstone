'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

const BACKGROUNDS = [
  '/backgrounds/bg1.jpg',
  '/backgrounds/bg2.jpg',
  '/backgrounds/bg3.jpg',
  '/backgrounds/bg4.jpg',
  '/backgrounds/bg5.jpg',
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
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0 }}
    >
      {children}
    </motion.div>
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
    }, 4500);
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
              <a href="#features" className="text-sm font-semibold text-white/80 hover:text-white">
                Features
              </a>
              <a href="#how" className="text-sm font-semibold text-white/80 hover:text-white">
                How it works
              </a>
              <a href="/about" className="text-sm font-semibold text-white/80 hover:text-white">
                About
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
                onClick={() => setLoginOpen(true)}
              >
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
                transition={{ duration: 0.8 }}
              >
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
            transition={{ delay: 0.25, duration: 0.8 }}
          >
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
                transition={{ duration: 2, repeat: Infinity }}
              >
                🡇
              </motion.span>
            </motion.p>
          </div>
        </div>
      </section>

      <Reveal>
        <section id="platform" className="bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-10 md:grid-cols-2 md:items-start">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900">
                  <p className="text-4xl font-extrabold text-gray-900">One platform</p>
                  <p className="text-4xl font-extrabold text-gray-900">Clear results</p>
                </h2>
                <p className="mt-4 text-gray-600 font-semibold">
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
                      Every prediction is deliveredso it’s easy to understand and compare.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="text-sm font-extrabold text-gray-900">What you get</div>
                <div className="mt-5 grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="font-extrabold text-gray-900">Guided data entry</div>
                      <div className="text-sm font-semibold text-gray-600">
                        Built around common numbers people already have—blood pressure, cholesterol, BMI, glucose, and more.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="font-extrabold text-gray-900">Fast, reliable predictions</div>
                      <div className="text-sm font-semibold text-gray-600">
                        Designed to return results quickly and consistently—whether you’re using a baseline model or deep learning.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="font-extrabold text-gray-900">Your history in one place</div>
                      <div className="text-sm font-semibold text-gray-600">
                        Save past inputs and predictions to track trends over time in your dashboard.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="font-extrabold text-gray-900">Built to expand</div>
                      <div className="text-sm font-semibold text-gray-600">
                        Starting with atherosclerosis, with a foundation that supports adding more conditions as the platform grows.
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
        <section id="how" className="bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-3xl font-extrabold text-gray-900">How it works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="text-sm font-bold text-blue-400">Step 1</div>
                <div className="mt-2 text-lg font-extrabold text-gray-700">Login for privacy</div>
                <p className="mt-2 text-sm text-gray-600">
                  Your health inputs and prediction history are protected by your account.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="text-sm font-bold text-blue-400">Step 2</div>
                <div className="mt-2 text-lg font-extrabold text-gray-700">Enter your metrics</div>
                <p className="mt-2 text-sm text-gray-600">
                  Blood pressure, cholesterol, BMI, glucose, and other factors.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow flex flex-col h-full">
                <div className="text-sm font-bold text-blue-400">Step 3</div>
                <div className="mt-2 text-lg font-extrabold text-gray-700">Get results</div>
                <p className="mt-2 text-sm text-gray-600">
                  View risk stage, probability, and recommended next actions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className=" text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">MedPredict</div>
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
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
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
