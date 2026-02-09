'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';

export default function HomePage() {
    const router = useRouter();
    const [authed, setAuthed] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <main className="relative font-Poppins min-h-screen overflow-hidden bg-white">
            <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">MedPredict</div>
                    <nav className="hidden items-center gap-6 md:flex">
                        <a href="#features" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                            Features
                        </a>
                        <a href="#how" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                            How it works
                        </a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <button
                            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold font-calibri text-gray-900 hover:bg-gray-50"
                            onClick={() => setLoginOpen(true)}>
                            Log in
                        </button>
                    </div>
                </div>
            </header>
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
                <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />
                <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
                            Turn health metrics into clear risk insight.
                        </h1>
                        <p className="mt-5 text-lg font-semibold text-gray-700 md:text-xl">
                            Analyzes common data to
                            estimate risk for diseases starting with <span className="font-extrabold text-2xl">atherosclerosis</span>.
                        </p>
                    </div>
                </div>
            </section>
            <section id="features" className="mx-auto max-w-6xl px-6 py-16">
                <h2 className="text-3xl font-extrabold text-gray-900">What <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"> MedPredict </span> does</h2>
                <p className="mt-2 max-w-2xl text-gray-600">
                    Designed to be scalable across diseases while starting with atherosclerosis risk prediction.
                </p>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="text-lg font-extrabold text-red-400">Risk Prediction</div>
                        <p className="mt-2 text-sm text-gray-600">
                            Input common metrics to receive a risk stage and probability score.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="text-lg font-extrabold text-red-400">Model Selection</div>
                        <p className="mt-2 text-sm text-gray-600">
                            Compare outputs across multiple ML models (baseline → deep learning).
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="text-lg font-extrabold text-red-400">Actionable Guidance</div>
                        <p className="mt-2 text-sm text-gray-600">
                            Generates recommendations to support better health decisions and prevention.
                        </p>
                    </div>
                </div>
            </section>
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
            <footer className="bg-gray-900 text-gray-300">
                <div className="mx-auto max-w-6xl px-6 py-16">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">MedPredict</div>
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
                                <li><a href="#" className="hover:text-white">About</a></li>
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
