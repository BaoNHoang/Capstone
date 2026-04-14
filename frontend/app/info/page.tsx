'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
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

type FieldInfo = {
    label: string;
    meaning: string;
    howToAnswer: string;
    howToGetIt?: string;
    unit?: string;
};

const fieldGroups: { title: string; description: string; fields: FieldInfo[] }[] = [
    {
        title: 'Basic Information',
        description:
            'These are the main personal and measurement values used by the predictor. They describe who the user is and provide the baseline health numbers the model needs.',
        fields: [
            {
                label: 'Age (years)',
                meaning:
                    'Age is the number of years you have lived. It is a basic health factor because many cardiovascular risks tend to increase as people get older.',
                howToAnswer:
                    'Enter your age as a whole number in years.',
                howToGetIt:
                    'You can get this without a doctor by using your date of birth and calculating your current age.',
                unit: 'Years',
            },
            {
                label: 'Sex',
                meaning:
                    'This field refers to the sex category used by the model. Some medical risk patterns can differ between males and females, so the predictor includes it as one of the inputs.',
                howToAnswer:
                    'Select Male or Female based on the option that matches the form requirement.',
                howToGetIt:
                    'This is not something you measure. You select the option that matches the category the form is asking for.',
            },
            {
                label: 'Height (cm)',
                meaning:
                    'Height is your body height measured in centimeters. It helps provide body-size context and is often used together with weight to understand general physical profile.',
                howToAnswer:
                    'Enter your height in centimeters.',
                howToGetIt:
                    'You can measure your height at home using a wall, a flat object like a book, and a tape measure. If you know your height in feet and inches, convert it to centimeters using the conversion helper.',
                unit: 'Centimeters (cm)',
            },
            {
                label: 'Weight (kg)',
                meaning:
                    'Weight is your body weight measured in kilograms. Along with height, it helps describe general body composition and may affect overall cardiovascular risk estimation.',
                howToAnswer:
                    'Enter your weight in kilograms.',
                howToGetIt:
                    'You can get this at home using a bathroom scale. If your scale shows pounds, convert the number to kilograms using the conversion helper.',
                unit: 'Kilograms (kg)',
            },
            {
                label: 'Blood Pressure',
                meaning:
                    'Blood pressure is the force of blood pushing against the walls of your arteries as your heart pumps blood through your body. Higher blood pressure can place extra strain on the heart and blood vessels.',
                howToAnswer:
                    'Enter the single blood pressure value your form expects.',
                howToGetIt:
                    'You can check this at home using an automatic blood pressure cuff. Sit still for a few minutes, place the cuff correctly, and take a reading. Your form currently uses one numeric blood pressure field rather than separate top and bottom numbers.',
                unit: 'mmHg',
            },
            {
                label: 'LDL',
                meaning:
                    'LDL stands for low-density lipoprotein cholesterol. It is often called “bad” cholesterol because higher LDL levels are commonly associated with plaque buildup in arteries over time.',
                howToAnswer:
                    'Enter your LDL lab value if you know it.',
                howToGetIt:
                    'You usually cannot know this accurately at home without a cholesterol test. The best non-doctor source is a recent lab result from a prior blood test, health portal, screening event, or home cholesterol test kit if you have used one.',
                unit: 'mg/dL',
            },
        ],
    },
    {
        title: 'Lifestyle',
        description:
            'These fields describe daily habits and behavior patterns that can influence long-term cardiovascular health.',
        fields: [
            {
                label: 'Smoking Status',
                meaning:
                    'Smoking status tells the model whether a person has never smoked, used to smoke in the past, or currently smokes. Smoking is a major cardiovascular risk factor because it can damage blood vessels and increase plaque-related disease risk.',
                howToAnswer:
                    'Select Never, Former, or Current.',
                howToGetIt:
                    'This comes from your own history. Choose Never if you have not smoked, Former if you used to but no longer do, and Current if you still smoke.',
            },
            {
                label: 'Activity Level',
                meaning:
                    'Activity level reflects how physically active you are in everyday life. Physical activity can affect heart health, circulation, weight, blood pressure, and overall risk patterns.',
                howToAnswer:
                    'Select Low, Moderate, or High based on your typical lifestyle.',
                howToGetIt:
                    'You can estimate this yourself by thinking about your weekly routine. Low usually means little regular exercise, Moderate means some consistent activity, and High means frequent or vigorous activity.',
            },
        ],
    },
    {
        title: 'Medical History and Risk Factors',
        description:
            'These yes-or-no questions describe known medical conditions, treatment history, and previous cardiovascular events that may affect risk.',
        fields: [
            {
                label: 'Family history of heart disease',
                meaning:
                    'This asks whether close biological relatives, such as parents or siblings, have had heart disease. Family history can matter because inherited risk patterns may increase the chance of developing similar problems.',
                howToAnswer:
                    'Select Yes if there is known heart disease in close biological family members. Otherwise select No.',
                howToGetIt:
                    'You can usually get this by asking close family members about known heart-related conditions or events in your family history.',
            },
            {
                label: 'Hypertension',
                meaning:
                    'Hypertension means high blood pressure. It is a condition where blood pressure stays elevated over time, which can increase stress on arteries and raise cardiovascular risk.',
                howToAnswer:
                    'Select Yes if you already know you have high blood pressure. Otherwise select No.',
                howToGetIt:
                    'Without seeing a doctor, the best way to estimate this is repeated home blood pressure readings taken on different days. A single high reading does not reliably confirm hypertension, so if you are unsure, do not assume a diagnosis.',
            },
            {
                label: 'Diabetes',
                meaning:
                    'Diabetes is a condition that affects how the body manages blood sugar. It is included because diabetes can significantly affect blood vessels, circulation, and cardiovascular health.',
                howToAnswer:
                    'Select Yes only if you already know you have diabetes. Otherwise select No.',
                howToGetIt:
                    'This usually cannot be confirmed accurately without prior testing. If you already have a diagnosis, use that. If you do not, this is not something you should self-diagnose from symptoms alone.',
            },
            {
                label: 'On statin',
                meaning:
                    'A statin is a medication commonly used to lower cholesterol, especially LDL cholesterol. This field helps capture whether cholesterol management treatment is already part of the person’s care.',
                howToAnswer:
                    'Select Yes if you currently take a statin medication. Otherwise select No.',
                howToGetIt:
                    'You can check this by looking at your prescription bottle, medication list, pharmacy app, or personal records.',
            },
            {
                label: 'On blood pressure meds',
                meaning:
                    'This field asks whether you currently take medication intended to control blood pressure. It helps the model understand whether blood pressure is being medically managed.',
                howToAnswer:
                    'Select Yes if you currently take blood pressure medication. Otherwise select No.',
                howToGetIt:
                    'You can confirm this from your medication bottles, prescription list, pharmacy app, or personal records.',
            },
            {
                label: 'Clinical ASCVD history',
                meaning:
                    'ASCVD stands for atherosclerotic cardiovascular disease. This refers to cardiovascular disease caused by plaque buildup inside the arteries.',
                howToAnswer:
                    'Select Yes only if you already know you have a clinical history of ASCVD or a related plaque-based condition. Otherwise select No.',
                howToGetIt:
                    'This usually comes from an existing diagnosis in your medical records. It is not something most people can accurately determine on their own without prior medical evaluation.',
            },
            {
                label: 'Heart attack history',
                meaning:
                    'This asks whether the person has previously had a heart attack. A past heart attack is a major cardiovascular event and is very important for understanding overall risk history.',
                howToAnswer:
                    'Select Yes if you have had a previous heart attack. Otherwise select No.',
                howToGetIt:
                    'This should come from your known medical history, discharge paperwork, or prior records. It is not something to guess at.',
            },
            {
                label: 'Stroke / TIA history',
                meaning:
                    'This asks whether the person has had a stroke or TIA. TIA stands for transient ischemic attack, sometimes called a mini-stroke.',
                howToAnswer:
                    'Select Yes if you have a known history of stroke or TIA. Otherwise select No.',
                howToGetIt:
                    'This should come from your known medical history or prior records, not from self-guessing.',
            },
            {
                label: 'Peripheral artery disease history',
                meaning:
                    'Peripheral artery disease, often called PAD, is reduced blood flow in arteries outside the heart and brain, often in the legs.',
                howToAnswer:
                    'Select Yes if you already know you have peripheral artery disease. Otherwise select No.',
                howToGetIt:
                    'This usually comes from an existing diagnosis or prior medical records. It is difficult to determine accurately without medical evaluation.',
            },
            {
                label: 'Recent cardio event (12 months)',
                meaning:
                    'This asks whether the person had a significant cardiovascular event within the past 12 months. Recent events can matter because they may indicate more active disease.',
                howToAnswer:
                    'Select Yes if you have had a major cardiovascular event in the last 12 months. Otherwise select No.',
                howToGetIt:
                    'Use your own recent health history, hospital discharge paperwork, or prior records to answer this.',
            },
            {
                label: 'Multi plaque disease',
                meaning:
                    'This field refers to plaque-related disease affecting more than one area or vascular region.',
                howToAnswer:
                    'Select Yes only if you already know plaque-related disease has been found in multiple areas. Otherwise select No.',
                howToGetIt:
                    'This usually comes from prior imaging results, specialist notes, or an existing diagnosis. It is not something most users can determine accurately at home.',
            },
        ],
    },
];

function InfoCard({ label, meaning, howToAnswer, howToGetIt, unit, }: FieldInfo) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900">{label}</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p><span className="font-bold text-slate-900">What it means:</span> {meaning}</p>
                <p><span className="font-bold text-slate-900">How to answer:</span> {howToAnswer}</p>
                {howToGetIt && (<p><span className="font-bold text-slate-900">How to get this value:</span> {howToGetIt}</p>)}
                {unit && <p><span className="font-bold text-slate-900">Unit:</span> {unit}</p>}
            </div>
        </div>
    );
}

export default function PredictorInfoPage() {
    const router = useRouter();
    const [pounds, setPounds] = useState('');
    const [feet, setFeet] = useState('');
    const [inches, setInches] = useState('');
    const [loginOpen, setLoginOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [id, setID] = useState<ID | null>(null);
    const [error, setError] = useState<string | null>(null);

    const kgValue = useMemo(() => {
        const lb = Number(pounds);
        if (!pounds.trim() || !Number.isFinite(lb) || lb < 0) return '';
        return (lb * 0.45359237).toFixed(1);
    }, [pounds]);

    const cmValue = useMemo(() => {
        const ft = Number(feet || '0');
        const inch = Number(inches || '0');
        if ((!feet.trim() && !inches.trim()) || !Number.isFinite(ft) || !Number.isFinite(inch) || ft < 0 || inch < 0) {
            return '';
        }
        const totalInches = ft * 12 + inch;
        return (totalInches * 2.54).toFixed(1);
    }, [feet, inches]);

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
                                    className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-white/25"
                                    onClick={() => router.push('/')}>
                                    Home
                                </button>
                                <button
                                    className="cursor-pointer rounded-2xl bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-100"
                                    onClick={() => router.push('/predictor')}>
                                    Predictor
                                </button>
                                {id ? (
                                    <button
                                        className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-red-800"
                                        onClick={() => setLogoutOpen(true)}>
                                        Logout
                                    </button>
                                ) : (
                                    <button
                                        className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-white/15"
                                        onClick={() => setLoginOpen(true)}>
                                        Login
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-extrabold text-white">
                                <h1 className="text-4xl font-extrabold text-white md:text-5xl">
                                    Information
                                </h1>
                            </div>
                            <div className="mt-3 text-sm font-semibold text-white/75">
                                Understand what antherosclerosis is
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
                        <button
                            className="cursor-pointer rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-slate-100"
                            onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </button>

                        <div className="mt-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Understanding Atherosclerosis
                                    </h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-700">
                                        Atherosclerosis is a chronic artery disease in which plaque builds up inside the
                                        inner lining of arteries. Over time, this plaque can make the artery narrower,
                                        stiffer, and less able to deliver oxygen-rich blood to the heart, brain, kidneys,
                                        digestive organs, and limbs. It is a common underlying cause of heart attacks, strokes, 
                                        peripheral artery disease, and other cardiovascular problems. 
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 xl:max-w-sm">
                                    <div className="text-sm font-extrabold text-rose-900">Why this matters</div>
                                    <p className="mt-2 text-sm leading-6 text-rose-900/90">
                                        Atherosclerosis often develops silently for years before symptoms appear. Cleveland
                                        Clinic notes that complications from plaque buildup, including heart attack and
                                        stroke, are among the leading causes of death worldwide.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2 space-y-4 text-sm leading-7 text-gray-700">
                                <div>
                                    <div className="text-xl font-bold text-slate-900">
                                        What plaque is made of
                                    </div>
                                    <p className="mt-2">
                                        Plaque is not just “fat.” Cleveland Clinic and Johns Hopkins describe it as a
                                        buildup that can include fat, cholesterol, calcium, cellular waste products,
                                        fibrin, and other substances. As this material collects inside the artery wall, the
                                        vessel gradually becomes thickened and less flexible.
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xl font-bold text-slate-900">
                                        How the disease develops over time
                                    </div>
                                    <p className="mt-2">
                                        The disease usually begins with injury or stress to the artery’s inner lining,
                                        often linked to high LDL cholesterol, high blood pressure, smoking, diabetes, and
                                        other long-term cardiovascular risk factors. Cleveland Clinic explains that early
                                        disease can begin as fatty streaks, where cholesterol-rich inflammatory cells build
                                        up in the vessel wall. Over time, these areas can grow into larger plaques that
                                        reduce blood flow and make the artery more rigid.
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xl font-bold text-slate-900">
                                        Why plaque becomes dangerous
                                    </div>
                                    <p className="mt-2">
                                        Atherosclerosis is dangerous not only because it narrows arteries, but because a
                                        plaque can rupture or erode. When that happens, a blood clot can form very quickly.
                                        Johns Hopkins notes that this can block circulation and cause a heart attack,
                                        stroke, aneurysm-related problems, or other blood-flow emergencies. In other words,
                                        a person may feel fine for years and then suddenly develop a life-threatening event
                                        when plaque becomes unstable.
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xl font-bold text-slate-900">
                                        Symptoms are often late and location-dependent
                                    </div>
                                    <p className="mt-2">
                                        One of the most important clinical features of atherosclerosis is that it may cause
                                        no symptoms until an artery is significantly narrowed or suddenly blocked. Symptoms
                                        depend on which arteries are affected.
                                    </p>

                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        <div>
                                            <div className="font-bold text-slate-900">Heart / coronary arteries</div>
                                            <p className="mt-1">
                                                Reduced blood flow to the heart can cause chest pain, pressure, shortness
                                                of breath, fatigue, discomfort in the arms, neck, shoulders, back, or
                                                stomach, and in some people the first sign may be a heart attack.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="font-bold text-slate-900">Brain / carotid arteries</div>
                                            <p className="mt-1">
                                                Disease in the carotid arteries can reduce oxygen flow to the brain and may
                                                cause a transient ischemic attack or stroke. Johns Hopkins lists warning
                                                signs such as sudden weakness, numbness, slurred speech, confusion,
                                                clumsiness, loss of coordination, and temporary vision loss.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="font-bold text-slate-900">Legs / peripheral arteries</div>
                                            <p className="mt-1">
                                                Reduced blood flow to the legs may lead to pain with walking, slower
                                                healing, weakness, or other symptoms of peripheral artery disease.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="font-bold text-slate-900">Other organs</div>
                                            <p className="mt-1">
                                                Atherosclerosis can also affect the kidneys, intestines, and aorta, leading
                                                to reduced organ blood supply, chronic vascular damage, or aneurysm-related
                                                complications.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xl font-bold text-slate-900">
                                        Major medical risk factors
                                    </div>
                                    <p className="mt-2">
                                        Cleveland Clinic and Johns Hopkins both identify several major risk factors:
                                        elevated LDL cholesterol, high triglycerides, high blood pressure, smoking, diabetes,
                                        obesity, low physical activity, unhealthy diet, and family history. Some risk factors
                                        are not changeable, but many are modifiable and are central to prevention.
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xl font-bold text-slate-900">
                                        How doctors evaluate it
                                    </div>
                                    <p className="mt-2">
                                        Evaluation usually starts with medical history, family history, symptom review,
                                        lifestyle review, and physical exam. Depending on the situation, Cleveland Clinic
                                        and Johns Hopkins describe testing such as cholesterol blood work, CT imaging,
                                        angiography, ultrasound, ankle-brachial index comparison, stress testing, cardiac
                                        catheterization, and other studies to find narrowing, calcification, or reduced
                                        blood flow.
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xl font-bold text-slate-900">
                                        Treatment and long-term management
                                    </div>
                                    <p className="mt-2">
                                        Treatment aims to slow plaque progression, reduce clot risk, improve blood flow,
                                        lower the chance of heart attack or stroke, and manage symptoms. Official guidance
                                        from these sources includes:
                                    </p>

                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                        <div>
                                            <div className="font-bold text-slate-900">Lifestyle changes</div>
                                            <p className="mt-1">
                                                Stop smoking, improve diet, increase physical activity, maintain a healthier
                                                weight, and control blood pressure, blood sugar, and cholesterol.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="font-bold text-slate-900">Medications</div>
                                            <p className="mt-1">
                                                These may include cholesterol-lowering drugs, blood pressure treatment,
                                                antiplatelet medicines, blood sugar control, and other therapy based on
                                                overall cardiovascular risk.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="font-bold text-slate-900">Procedures / surgery</div>
                                            <p className="mt-1">
                                                Severe blockages may require angioplasty, stenting, endarterectomy, bypass
                                                surgery, or other vascular procedures to restore or improve circulation.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                                    <div className="text-xl font-bold text-sky-900">Educational note</div>
                                    <p className="mt-2 text-sky-900/90">
                                        This explanation is for education only. It should support understanding of the
                                        disease process, not replace professional medical evaluation, diagnosis, or treatment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-12">
                {!id ? (
                    <div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {fieldGroups.map((group) => (
                            <section key={group.title}>
                                <div className="mb-4">
                                    <h2 className="text-2xl font-extrabold text-slate-900">{group.title}</h2>
                                    <p className="mt-2 text-sm font-semibold text-gray-600">{group.description}</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {group.fields.map((field) => (
                                        <InfoCard key={field.label} {...field} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </section>

            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSuccess={() => {
                    setLoginOpen(false);
                    process();
                }} />
            <LogoutConfirmModal
                open={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                onConfirm={logout} />
        </main>
    );
}