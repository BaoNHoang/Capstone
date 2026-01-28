'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

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

function FloatingDots({ count = 35 }: { count?: number }) {
  const colors = ['bg-blue-300', 'bg-purple-300'];
  const [dots, setDots] = useState<Dot[] | null>(null);

  useEffect(() => {
    const generated = Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${2 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 4}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setDots(generated);
  }, [count]);

  if (!dots) return null; // Don't render on server

  return (
    <>
      {dots.map((dot, i) => (
        <div
          key={i}
          className={`absolute h-2 w-2 rounded-full ${dot.color} animate-float`}
          style={{
            left: dot.left,
            top: dot.top,
            opacity: 0.5,
            animationDuration: dot.animationDuration,
            animationDelay: dot.animationDelay,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export default function StartPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {

    let interval = setInterval(() => {
      setIndex(Math.floor(Math.random() * BACKGROUNDS.length));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">

      <AnimatePresence>
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BACKGROUNDS[index]})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: .65 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/25" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingDots />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">

        <motion.h1
          className="mb-4 text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 md:text-9xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          MedPredict
        </motion.h1>

        <motion.p
          className="mb-8 max-w-2xl text-center text-xl font-extrabold text-white md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Turning Data Into Better Health Decisions
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Link href="/home">
            <motion.button
              className="rounded-full bg-blue-500 px-12 py-5 text-3xl font-extrabold
             tracking-wide text-white shadow-[0_0_30px_rgba(59,130,246,0.6)]
             hover:bg-blue-600"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
            >
              Start
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
