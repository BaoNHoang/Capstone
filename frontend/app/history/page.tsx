'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

const API_BASE = '/api';

type ID = {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
};

type PredictionResult = {
    history_id?: number;
    health_label?: string;
    risk_score?: number;
    plaque_stage?: number;
    stage_name?: string;
    severity?: string;
    summary?: string;
    recommendations?: string[];
    warning?: string;
};

type PredictPayload = {
    age_years: number;
    sex: string;
    height_cm: number;
    weight_kg: number;
    smoking_status: string;
    activity_level: string;
    family_history_heart_disease: boolean;
    hypertension: boolean;
    diabetes: boolean;
    on_statin: boolean;
    on_bp_meds: boolean;
    clinical_ascvd_history: boolean;
    heart_attack_history: boolean;
    stroke_tia_history: boolean;
    peripheral_artery_disease_history: boolean;
    recent_cardio_event_12mo: boolean;
    multi_plaque_dev: boolean;
    blood_pressure_mmHg: number;
    ldl_mg_dL: number;
};

type PredictionHistoryItem = {
    id: number;
    timeCreated: string;
    inputs: PredictPayload;
    results: PredictionResult;
};

function getSeverityStyle(severity?: string) {
    const value = severity?.toLowerCase();

    if (value === 'high' || value === 'severe') {
        return 'bg-red-100 text-red-800 ring-red-200';
    }

    if (value === 'moderate') {
        return 'bg-yellow-50 text-yellow-700 ring-yellow-200';
    }

    if (value === 'low') {
        return 'bg-green-100 text-green-800 ring-green-200';
    }

    return 'bg-blue-100 text-blue-700 ring-blue-200';
}

function formatBoolean(value: boolean) {
    return value ? 'Yes' : 'No';
}

export default function HistoryPage() {
    const router = useRouter();
    const [loginOpen, setLoginOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [id, setID] = useState<ID | null>(null);
    const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

    async function loadHistory() {
        try {
            setError(null);

            const res = await fetch(`${API_BASE}/predict/history`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.detail || 'Could not load history');
            }

            const data = (await res.json()) as PredictionHistoryItem[];
            setHistory(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Something went wrong');
            }
        }
    }

    async function process() {
        try {
            setError(null);
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
            await loadHistory();
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
            setHistory([]);
            setLogoutOpen(false);
            setLoginOpen(true);
        }
    }

    const selectedItem = history.find((h) => h.id === openDetailsId) ?? null;

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
                                        History
                                    </h1>
                                </div>
                            ) : (
                                <div className="text-lg font-extrabold text-white/80">
                                    Please login to access your history
                                </div>
                            )}
                            <div className="mt-3 text-sm font-semibold text-white/75">
                                Previous predictions saved for this account.
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-10">
                {!id ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                                <div className="mt-4 h-6 w-44 animate-pulse rounded bg-gray-100" />
                                <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
                                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                                <div className="mt-6 h-10 w-32 animate-pulse rounded-xl bg-gray-100" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                                className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-slate-100"
                                onClick={() => router.push('/dashboard')}>
                                Back to Dashboard
                            </button>

                            <div className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                                {history.length} {history.length === 1 ? 'record' : 'records'}
                            </div>
                        </div>

                        <div className="md:p-8">
                            {error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                    {error}
                                </div>
                            )}

                            {history.length === 0 ? (
                                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <div className="text-lg font-extrabold text-slate-800">
                                        No saved predictions yet
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Run a prediction first and it will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                                    {history.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                                        Saved
                                                    </div>
                                                    <div className="mt-1 text-sm font-extrabold text-slate-700">
                                                        {new Date(item.timeCreated).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${
                                                        item.results.health_label?.toLowerCase() === 'healthy'
                                                            ? 'bg-blue-100 text-blue-700 ring-blue-200'
                                                            : getSeverityStyle(item.results.severity)
                                                    }`}>
                                                    {item.results.health_label?.toLowerCase() === 'healthy'
                                                        ? 'Healthy'
                                                        : `Risk: ${item.results.severity ?? 'No severity'}`}
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2">
                                                <div className="rounded-xl p-1">
                                                    <div className="text-[11px] font-bold uppercase text-slate-600">
                                                        Health
                                                    </div>
                                                    <div className="mt-1 text-sm font-extrabold text-slate-700">
                                                        {item.results.health_label ?? '--'}
                                                    </div>
                                                </div>

                                                <div className="rounded-xl p-1">
                                                    <div className="text-[11px] font-bold uppercase text-slate-600">
                                                        Stage
                                                    </div>
                                                    <div className="mt-1 text-sm font-extrabold text-slate-700">
                                                        {item.results.stage_name ?? '--'}
                                                    </div>
                                                </div>

                                                <div className="rounded-xl p-1">
                                                    <div className="text-[11px] font-bold uppercase text-slate-600">
                                                        Severity
                                                    </div>
                                                    <div className="mt-1 text-sm font-extrabold text-slate-700">
                                                        {item.results.severity ?? '--'}
                                                    </div>
                                                </div>

                                                <div className="rounded-xl p-1">
                                                    <div className="text-[11px] font-bold uppercase text-slate-600">
                                                        Risk Score
                                                    </div>
                                                    <div className="mt-1 text-sm font-extrabold text-slate-700">
                                                        {item.results.risk_score ?? '--'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    className="w-full rounded-xl bg-slate-800 py-2 text-sm font-extrabold text-white transition hover:bg-slate-700"
                                                    onClick={() => setOpenDetailsId(item.id)}>
                                                    View Details
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm"
                    onClick={() => setOpenDetailsId(null)}>
                    <div
                        className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl md:p-6"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Prediction Details
                                </div>
                                <div className="mt-1 text-lg font-extrabold text-slate-900">
                                    {new Date(selectedItem.timeCreated).toLocaleString()}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                                onClick={() => setOpenDetailsId(null)}>
                                Close
                            </button>
                        </div>

                        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">Age</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.age_years}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">Sex</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.sex}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">Height</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.height_cm} cm
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">Weight</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.weight_kg} kg
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">Smoking</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.smoking_status}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">Activity</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.activity_level}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Family History
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.family_history_heart_disease)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Hypertension
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.hypertension)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Diabetes
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.diabetes)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    On Statin
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.on_statin)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    On BP Meds
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.on_bp_meds)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Clinical ASCVD History
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.clinical_ascvd_history)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Heart Attack History
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.heart_attack_history)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Stroke / TIA History
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.stroke_tia_history)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Peripheral Artery Disease
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(
                                        selectedItem.inputs.peripheral_artery_disease_history
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Recent Cardio Event
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.recent_cardio_event_12mo)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Multi Plaque Development
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {formatBoolean(selectedItem.inputs.multi_plaque_dev)}
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Blood Pressure
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.blood_pressure_mmHg} mmHg
                                </div>
                            </div>

                            <div className="rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-slate-600">
                                    LDL
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-slate-700">
                                    {selectedItem.inputs.ldl_mg_dL} mg/dL
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSuccess={() => {
                    setLoginOpen(false);
                    process(); }}/>
            <LogoutConfirmModal
                open={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                onConfirm={logout}/>
        </main>
    );
}