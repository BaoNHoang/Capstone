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

export default function AboutPage() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [id, setID] = useState<ID | null>(null);

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
          authed={!!id}
          onLoginClick={() => setLoginOpen(true)}
          onLogoutClick={logout}/>
        <div className="relative mx-auto flex min-h-[calc(30vh-72px)] max-w-6xl flex-col justify-center px-6 pb-2">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">About</h1>
          </div>
          <p className="mt-5 max-w-2xl text-lg font-semibold text-white/85 md:text-xl">
            Learn more about our mission and where we are headed.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="mt-2 text-5xl font-extrabold text-gray-900">
              Built to make health data
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                easier to understand
              </span>
            </h2>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-gray-600">
              MedPredict is a health technology proxy service focused on helping people interpret common numbers they already have like
              cholesterol, blood pressure, glucose, and BMI. Our goal is to turn confusing metrics into a clear summary you can
              actually use to make better health decisions. We want to empower people with the information they need to take control
              of their health and have more meaningful conversations with their providers.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Founded</div>
                    <div className="mt-2 text-2xl font-extrabold text-gray-900">2026</div>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Headquarters</div>
                    <div className="mt-2 text-2xl font-extrabold text-gray-900">Yorktown, VA</div>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Focus</div>
                    <div className="mt-2 text-2xl font-extrabold text-gray-900">Clinical support</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="space-y-10">
                  <div>
                    <div className="text-xl font-extrabold text-gray-900">Medical discipline</div>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-600">
                      We borrow the engineering mindset used in advanced technical industries where clear requirements, testable
                      outputs, and careful validation are essential. We apply that mindset to healthcare to make data more actionable
                    </p>
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-gray-900">Readable outputs</div>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-600">
                      Every prediction is paired with a confidence signal and plain language explanations so you can understand what
                      the model is doing and how to use the results. We want to make it clear when the model is confident and what
                      factors are driving its predictions.
                    </p>
                  </div>
                  <Reveal>
                    <div className="border-l-4 border-amber-300 bg-amber-50 px-6 py-5">
                      <div className="text-xl font-extrabold text-amber-900">Not medical advice</div>
                      <p className="mt-3 text-sm font-semibold leading-relaxed text-amber-900/90">
                        MedPredict is an educational and support company. We partner with medical professionals from across the globe
                        but always consult a qualified clinician for diagnosis and treatment.
                      </p>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="bg-white">
        <Reveal>
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="max-w-sm">
                  <h2 className="mt-3 text-4xl font-extrabold text-gray-900">Team</h2>
                  <p className="mt-4 text-l leading-relaxed text-gray-600">
                    MedPredict is founder-led and employee owned, with the product experience and engineering decisions driven by one clear goal:
                    <span className="font-bold"> Making health numbers easier to understand.</span>
                  </p>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-gray-900">Bao Hoang</div>
                      <div className="mt-1 text-sm font-bold text-gray-500">Founder & Creator</div>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href="https://www.linkedin.com/in/bao-nguyen-hoang/"
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
                        LinkedIn
                      </a>
                      <a
                        href="https://github.com/BaoNHoang"
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
                        GitHub
                      </a>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-gray-100 pt-6" />
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-gray-900">John Doe</div>
                      <div className="mt-1 text-sm font-bold text-gray-500">Co-Founder & Lead Engineer</div>
                    </div>
                    <div className="flex gap-3" />
                  </div>
                </div>
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