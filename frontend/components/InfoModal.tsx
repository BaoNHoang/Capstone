'use client';

import { useMemo, useState } from 'react';

type InfoModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
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
                label: 'Recent cardio event',
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

export default function InfoModal({
    open,
    onClose,
}: InfoModalProps) {
    const [pounds, setPounds] = useState('');
    const [feet, setFeet] = useState('');
    const [inches, setInches] = useState('');

    const kgValue = useMemo(() => {
        const lb = Number(pounds);
        if (!pounds.trim() || !Number.isFinite(lb) || lb < 0) return '';
        return (lb * 0.45359237).toFixed(1);
    }, [pounds]);

    const cmValue = useMemo(() => {
        const ft = Number(feet || '0');
        const inch = Number(inches || '0');

        if (
            (!feet.trim() && !inches.trim()) ||
            !Number.isFinite(ft) ||
            !Number.isFinite(inch) ||
            ft < 0 ||
            inch < 0
        ) {
            return '';
        }

        const totalInches = ft * 12 + inch;
        return (totalInches * 2.54).toFixed(1);
    }, [feet, inches]);

    if (!open) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
            onClick={onClose}>
            <div 
                className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-slate-50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Predictor Information
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-gray-600">
                            Learn what each field means and how to enter it correctly.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-100">
                        Close
                    </button>
                </div>

                <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                Metric Conversion Helper
                            </h2>
                            <p className="mt-2 text-sm font-semibold text-gray-600">
                                Use these before entering values into the predictor.
                            </p>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        lbs to Kg
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Formula: pounds × 0.45359237
                                    </p>
                                    <input
                                        type="number"
                                        min="0"
                                        value={pounds}
                                        onChange={(e) => setPounds(e.target.value)}
                                        placeholder="Enter pounds"
                                        className="mt-4 w-full rounded-2xl border border-gray-200 bg-white p-3 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-400" />
                                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                                        <div className="text-sm font-bold text-gray-500">
                                            Kilograms
                                        </div>
                                        <div className="mt-1 text-2xl font-extrabold text-slate-900">
                                            {kgValue ? `${kgValue} kg` : '--'}
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs font-semibold text-gray-500">
                                        Example: 180 lb = 81.6 kg
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        In to Cm
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Formula: total inches × 2.54
                                    </p>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={feet}
                                            onChange={(e) => setFeet(e.target.value)}
                                            placeholder="Feet"
                                            className="w-full rounded-2xl border border-gray-200 bg-white p-3 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            value={inches}
                                            onChange={(e) => setInches(e.target.value)}
                                            placeholder="Inches"
                                            className="w-full rounded-2xl border border-gray-200 bg-white p-3 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-400" />
                                    </div>
                                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                                        <div className="text-sm font-bold text-gray-500">
                                            Centimeters
                                        </div>
                                        <div className="mt-1 text-2xl font-extrabold text-slate-900">
                                            {cmValue ? `${cmValue} cm` : '--'}
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs font-semibold text-gray-500">
                                        Example: 5&apos;9&quot; = 175.3 cm
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                Quick Notes
                            </h2>
                            <div className="mt-4 space-y-4 text-sm text-gray-700">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="font-bold text-slate-900">Height</div>
                                    <p className="mt-1">
                                        Enter height in centimeters, not inches.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="font-bold text-slate-900">Weight</div>
                                    <p className="mt-1">
                                        Enter weight in kilograms, not pounds.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="font-bold text-slate-900">Blood Pressure</div>
                                    <p className="mt-1">
                                        Your current form uses one numeric blood pressure field.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="font-bold text-slate-900">LDL</div>
                                    <p className="mt-1">
                                        This is usually entered as a lab value in mg/dL.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-10">
                        {fieldGroups.map((group) => (
                            <section key={group.title}>
                                <div className="mb-4">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        {group.title}
                                    </h2>
                                    <p className="mt-2 text-sm font-semibold text-gray-600">
                                        {group.description}
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {group.fields.map((field) => (
                                        <InfoCard key={field.label} {...field} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}