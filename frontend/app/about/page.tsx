'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const bp = (p: string) => `${BASE}${p}`;

const BACKGROUNDS = [
  bp('/backgrounds/bg1.jpg'),
  bp('/backgrounds/bg2.jpg'),
  bp('/backgrounds/bg3.jpg'),
  bp('/backgrounds/bg4.jpg'),
  bp('/backgrounds/bg5.jpg'),
];

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
      transition={{ duration: 1.0, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

const VALUES = [
  {
    title: 'Clarity over complexity',
    body: 'We translate common health numbers into plain-language insights that feel approachable, not overwhelming.',
  },
  {
    title: 'Privacy-first by default',
    body: 'Your data should be treated with care. We design flows that minimize exposure and keep access intentional.',
  },
  {
    title: 'Built to expand',
    body: 'We start focused (atherosclerosis) and grow responsibly—adding conditions without changing the core experience.',
  },
  {
    title: 'Confidence + context',
    body: 'Predictions are paired with a confidence signal and what-to-do-next guidance so results are actionable.',
  },
];

const TIMELINE = [
  {
    year: '2024',
    title: 'Prototype',
    body: 'We built the first MedPredict flow: guided entry → risk stage → confidence score.',
  },
  {
    year: '2025',
    title: 'Usability + polish',
    body: 'We refined language, simplified screens, and improved readability across devices.',
  },
  {
    year: '2026',
    title: 'Capstone launch',
    body: 'We shipped a clean, static-friendly experience designed to run fast on the web (including GitHub Pages).',
  },
];

const TEAM = [
  { name: 'Product & UX', desc: 'Turns requirements into a smooth, understandable experience.' },
  { name: 'Modeling & Evaluation', desc: 'Validates behavior across realistic ranges and flags edge cases.' },
  { name: 'Engineering', desc: 'Builds the interface, data flow, and deployment pipeline.' },
  { name: 'Privacy & Security', desc: 'Defines safe defaults and keeps user data protected.' },
];

export default function AboutPage() {
  const [authed, setAuthed] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const [index, setIndex] = useState(0);

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
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              MedPredict
            </Link>
            <nav className="hidden items-center gap-10 md:flex">
              <Link href="/" className="text-1xl font-semibold text-white/80 hover:text-white">
                Home
              </Link>
              <Link href="/about" className="text-1xl font-semibold text-white/80 hover:text-white">
                About
              </Link>
              <Link href="#" className="text-1xl font-semibold text-white/80 hover:text-white">
                Products
              </Link>
              <Link href="#" className="text-1xl font-semibold text-white/80 hover:text-white">
                Technology
              </Link>
              <Link href="#" className="text-1xl font-semibold text-white/80 hover:text-white">
                Careers
              </Link>
              <Link href="#" className="text-1xl font-semibold text-white/80 hover:text-white">
                Privacy
              </Link>
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
        <div className="relative mx-auto flex min-h-[calc(30vh-72px)] max-w-6xl flex-col justify-center px-6 pb-2">
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}>
            <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
              About MedPredict
            </h1>
          </motion.div>
          <motion.p
            className="mt-5 max-w-2xl text-lg font-semibold text-white/85 md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}>
            Learn more about our mission, our process, and where we’re headed.
          </motion.p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <div className="max-w-3xl">
              <h2 className="mt-2 text-5xl font-extrabold text-gray-900">
                Built to make health data
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  easier to understand
                </span>
              </h2>
              <p className="mt-5 text-lg font-semibold leading-relaxed text-gray-600">
                MedPredict is a health technology company focused on helping people interpret common
                numbers they already have like cholesterol, blood pressure, glucose, and BMI. Our goal is to
                turn confusing metrics into a clear summary you can actually use.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Founded</div>
                  <div className="mt-2 text-lg font-extrabold text-gray-900">2026</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Headquarters</div>
                  <div className="mt-2 text-lg font-extrabold text-gray-900">Norfolk, VA</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Focus</div>
                  <div className="mt-2 text-lg font-extrabold text-gray-900">Clinical support</div>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-6">
                  <div className="text-lg font-extrabold text-gray-900">Medical discipline</div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">
                    We borrow the engineering mindset used in advanced technical industries where clear requirements,
                    testable outputs, and careful validation are essential. We apply that mindset to healthcare to make data more actionable
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-6">
                  <div className="text-lg font-extrabold text-gray-900">Readable outputs</div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">
                    Every prediction is paired with a confidence signal and plain language explanations
                    so you can understand what the model is doing and how to use the results.
                    We want to make it clear when the model is confident and what factors are driving its predictions.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <div className="text-lg font-extrabold text-amber-900">Not medical advice</div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-amber-900/90">
                    MedPredict is an educational and support company. We partner with medical professionals from across the globe but
                    always consult a qualified clinician for diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="mt-12 rounded-2xl max-w-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-xl font-extrabold text-gray-900">Where we’re going next</div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">
                MedPredict is designed to expand. We’re building a platform that can support additional conditions,
                strengthen confidence explanations, and add a clean history dashboard so users can track trends over
                time without adding friction.
              </p>
              <ul className="mt-6 space-y-3 text-sm font-semibold text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                  <span>More conditions beyond atherosclerosis, added responsibly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
                  <span>Sharper confidence + uncertainty explanations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                  <span>A cleaner dashboard for history, trends, and comparisons</span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

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
                <a href="#" className="hover:text-blue-400">Instagram</a>
                <a href="https://www.linkedin.com/in/bao-nguyen-hoang/" className="hover:text-blue-400">LinkedIn</a>
                <a href="https://github.com/BaoNHoang/MedPredict://github.com/BaoNHoang/" className="hover:text-blue-400">GitHub</a>
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
