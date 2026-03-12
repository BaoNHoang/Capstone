'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function Welcome({
    open,
    firstName,
    onClose,
}: {
    open: boolean;
    firstName: string;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-extrabold text-gray-900">
                            Welcome, {firstName}!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            You can now access the dashboard.
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="absolute inset-0"
                                onClick={onClose}/>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}