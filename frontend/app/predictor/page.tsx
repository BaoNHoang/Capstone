'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import Welcome from '@/components/Welcome';
import InfoModal from '@/components/InfoModal';


const API_BASE = '/api';

type ID = {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
};

type PredictorForm = {
    age_years: string;
    sex: string;
    height_cm: string;
    weight_kg: string;
    smoking_status: string;
    activity_level: string;
    family_history_heart_disease: string;
    hypertension: string;
    diabetes: string;
    on_statin: string;
    on_bp_meds: string;
    clinical_ascvd_history: string;
    heart_attack_history: string;
    stroke_tia_history: string;
    peripheral_artery_disease_history: string;
    recent_cardio_event_12mo: string;
    multi_plaque_dev: string;
    blood_pressure_mmHg: string;
    ldl_mg_dL: string;
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

function parseBool(value: string, label: string) {
    const v = value.trim().toLowerCase();
    if (v === 'true')
        return true;
    if (v === 'false')
        return false;
    throw new Error(`${label} must be selected`);
}

function parseNumber(value: string, label: string) {
    const trimmed = value.trim();
    if (trimmed === '') {
        throw new Error(`${label} is required`);
    }

    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
        throw new Error(`${label} must be a valid number`);
    }
    if (n < 0) {
        throw new Error(`${label} cannot be negative`);
    }
    return n;
}

function buildPayload(form: PredictorForm): PredictPayload {
    return {
        age_years: parseNumber(form.age_years, 'Age'),
        sex: form.sex.trim(),
        height_cm: parseNumber(form.height_cm, 'Height'),
        weight_kg: parseNumber(form.weight_kg, 'Weight'),
        smoking_status: form.smoking_status.trim().toLowerCase(),
        activity_level: form.activity_level.trim().toLowerCase(),
        family_history_heart_disease: parseBool(
            form.family_history_heart_disease,
            'Family history of heart disease'
        ),
        hypertension: parseBool(form.hypertension, 'Hypertension'),
        diabetes: parseBool(form.diabetes, 'Diabetes'),
        on_statin: parseBool(form.on_statin, 'On statin'),
        on_bp_meds: parseBool(form.on_bp_meds, 'On blood pressure meds'),
        clinical_ascvd_history: parseBool(
            form.clinical_ascvd_history,
            'Clinical ASCVD history'
        ),
        heart_attack_history: parseBool(
            form.heart_attack_history,
            'Heart attack history'
        ),
        stroke_tia_history: parseBool(
            form.stroke_tia_history,
            'Stroke / TIA history'
        ),
        peripheral_artery_disease_history: parseBool(
            form.peripheral_artery_disease_history,
            'Peripheral artery disease history'
        ),
        recent_cardio_event_12mo: parseBool(
            form.recent_cardio_event_12mo,
            'Recent cardio event (12 months)'
        ),
        multi_plaque_dev: parseBool(
            form.multi_plaque_dev,
            'Multi plaque disease'
        ),
        blood_pressure_mmHg: parseNumber(form.blood_pressure_mmHg, 'Blood pressure'),
        ldl_mg_dL: parseNumber(form.ldl_mg_dL, 'LDL'),
    };
}

function Input({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = true,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600">
                {label}
            </label>
            <input
                type={type}
                value={value}
                placeholder={placeholder || 'Enter value'}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                min={type === 'number' ? 0 : undefined}
                className="rounded-2xl border border-gray-200 bg-white p-3 font-medium text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-400"/>
        </div>
    );
}

function SelectInput({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    required = true,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="rounded-2xl border border-gray-200 bg-white p-3 font-medium text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-400">
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

const yesNoOptions = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
];

const sexOptions = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
];

const smokingOptions = [
    { label: 'Never', value: 'never' },
    { label: 'Former', value: 'former' },
    { label: 'Current', value: 'current' },
];

const activityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'High', value: 'high' },
];

export default function PredictorPage() {
    const router = useRouter();
    const [loginOpen, setLoginOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [id, setID] = useState<ID | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [welcomeOpen, setWelcomeOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [welcomeFirstName, setWelcomeFirstName] = useState('');
    const [form, setForm] = useState<PredictorForm>({
        age_years: '',
        sex: '',
        height_cm: '',
        weight_kg: '',
        smoking_status: '',
        activity_level: '',
        family_history_heart_disease: '',
        hypertension: '',
        diabetes: '',
        on_statin: '',
        on_bp_meds: '',
        clinical_ascvd_history: '',
        heart_attack_history: '',
        stroke_tia_history: '',
        peripheral_artery_disease_history: '',
        recent_cardio_event_12mo: '',
        multi_plaque_dev: '',
        blood_pressure_mmHg: '',
        ldl_mg_dL: '',
    });

    async function process() {
        try {
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
            setResult(null);
            setLogoutOpen(false);
            setLoginOpen(true);
        }
    }

    function updateField<K extends keyof PredictorForm>(key: K, value: PredictorForm[K]) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setResult(null);

        try {
            const payload = buildPayload(form);

            const res = await fetch(`${API_BASE}/predict`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || 'Prediction failed');
            }

            setResult(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Something went wrong');
            }
        } finally {
            setSubmitting(false);
        }
    }

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
                                    onClick={() => router.push('/dashboard')}>
                                    Dashboard
                                </button>
                                {id ? (
                                    <button
                                        className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-red-800"
                                        onClick={() => setLogoutOpen(true)}>
                                        Logout
                                    </button>
                                ) : (
                                    <button
                                        className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-white/25"
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
                                        Predictor
                                    </h1>
                                </div>
                            ) : (
                                <div className="text-lg font-extrabold text-white/80">
                                    Please login to access the predictor
                                </div>
                            )}
                            <div className="mt-3 text-sm font-semibold text-white/75">
                                Note: This predictor is for informational product features only.
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
                    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
                        <form
                            onSubmit={onSubmit}
                            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-6">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-extrabold text-gray-900">
                                        Patient Input Form
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setInfoOpen(true)}
                                        className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-50">
                                        Info
                                    </button>
                                </div>
                                <div className="mt-2 text-sm font-semibold text-gray-600">
                                    Fill in the fields below to generate a prediction from your trained model.
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Input
                                    label="Age (years)"
                                    type="number"
                                    value={form.age_years}
                                    onChange={(v) => updateField('age_years', v)} />
                                <SelectInput
                                    label="Sex"
                                    value={form.sex}
                                    onChange={(v) => updateField('sex', v)}
                                    options={sexOptions}
                                    placeholder="Select sex" />
                                <Input
                                    label="Height (cm)"
                                    type="number"
                                    value={form.height_cm}
                                    onChange={(v) => updateField('height_cm', v)} />
                                <Input
                                    label="Weight (kg)"
                                    type="number"
                                    value={form.weight_kg}
                                    onChange={(v) => updateField('weight_kg', v)} />
                                <SelectInput
                                    label="Smoking Status"
                                    value={form.smoking_status}
                                    onChange={(v) => updateField('smoking_status', v)}
                                    options={smokingOptions}
                                    placeholder="Select smoking status" />
                                <SelectInput
                                    label="Activity Level"
                                    value={form.activity_level}
                                    onChange={(v) => updateField('activity_level', v)}
                                    options={activityOptions}
                                    placeholder="Select activity level" />
                                <Input
                                    label="Blood Pressure"
                                    type="number"
                                    value={form.blood_pressure_mmHg}
                                    onChange={(v) => updateField('blood_pressure_mmHg', v)} />
                                <Input
                                    label="LDL"
                                    type="number"
                                    value={form.ldl_mg_dL}
                                    onChange={(v) => updateField('ldl_mg_dL', v)} />
                                <SelectInput
                                    label="Family history of heart disease"
                                    value={form.family_history_heart_disease}
                                    onChange={(v) => updateField('family_history_heart_disease', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Hypertension"
                                    value={form.hypertension}
                                    onChange={(v) => updateField('hypertension', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Diabetes"
                                    value={form.diabetes}
                                    onChange={(v) => updateField('diabetes', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="On statin"
                                    value={form.on_statin}
                                    onChange={(v) => updateField('on_statin', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="On blood pressure meds"
                                    value={form.on_bp_meds}
                                    onChange={(v) => updateField('on_bp_meds', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Clinical ASCVD history"
                                    value={form.clinical_ascvd_history}
                                    onChange={(v) => updateField('clinical_ascvd_history', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Heart attack history"
                                    value={form.heart_attack_history}
                                    onChange={(v) => updateField('heart_attack_history', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Stroke / TIA history"
                                    value={form.stroke_tia_history}
                                    onChange={(v) => updateField('stroke_tia_history', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Peripheral artery disease history"
                                    value={form.peripheral_artery_disease_history}
                                    onChange={(v) => updateField('peripheral_artery_disease_history', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Recent cardio event (12 months)"
                                    value={form.recent_cardio_event_12mo}
                                    onChange={(v) => updateField('recent_cardio_event_12mo', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                                <SelectInput
                                    label="Multi plaque disease"
                                    value={form.multi_plaque_dev}
                                    onChange={(v) => updateField('multi_plaque_dev', v)}
                                    options={yesNoOptions}
                                    placeholder="Select yes or no" />
                            </div>
                            {error && (
                                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                    {error}
                                </div>
                            )}
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                                    {submitting ? 'Running prediction...' : 'Predict'}
                                </button>
                            </div>
                        </form>

                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="text-2xl font-extrabold text-gray-900">
                                Prediction Result
                            </div>
                            <div className="mt-2 text-sm font-semibold text-gray-600">
                                Your backend should return the model result here.
                            </div>

                            {!result ? (
                                <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-gray-500">
                                    No prediction yet.
                                </div>
                            ) : (
                                <div className="mt-6 space-y-4">
                                    <div className="rounded-2xl bg-slate-50 p-5">
                                        <div className="text-sm font-bold text-gray-500">
                                            Health Label
                                        </div>
                                        <div className="mt-1 text-2xl font-extrabold text-slate-900">
                                            {result.health_label ?? '--'}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-5">
                                        <div className="text-sm font-bold text-gray-500">
                                            Predicted Stage
                                        </div>
                                        <div className="mt-1 text-2xl font-extrabold text-slate-900">
                                            {result.stage_name ?? `Stage ${result.plaque_stage ?? '--'}`}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-5">
                                        <div className="text-sm font-bold text-gray-500">
                                            Severity
                                        </div>
                                        <div className="mt-1 text-2xl font-extrabold text-slate-900">
                                            {result.severity ?? '--'}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-5">
                                        <div className="text-sm font-bold text-gray-500">
                                            Risk Score
                                        </div>
                                        <div className="mt-1 text-3xl font-extrabold text-slate-900">
                                            {result.risk_score ?? '--'}
                                        </div>
                                    </div>
                                    {result.summary && (
                                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
                                            {result.summary}
                                        </div>
                                    )}
                                    {result.recommendations && result.recommendations.length > 0 && (
                                        <div className="rounded-2xl border border-gray-200 bg-white p-5">
                                            <div className="text-sm font-bold text-gray-500">
                                                Recommendations
                                            </div>
                                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-gray-700">
                                                {result.recommendations.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {result.warning && (
                                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
                                            {result.warning}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>

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
            <InfoModal
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                onConfirm={() => setInfoOpen(false)} />
        </main>
    );
}