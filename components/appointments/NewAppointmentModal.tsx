"use client";

import React from "react";

interface NewAppointmentModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
    title?: string;
    submitLabel?: string;
    children: React.ReactNode;
}

export function NewAppointmentModal({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    title = "New Appointment",
    submitLabel = "Create Appointment",
    children,
}: NewAppointmentModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* modal */}
            <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-blue-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 w-9 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-500"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* body (scrollable) */}
                <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
                    {children}
                </div>

                {/* footer (sticky buttons always visible) */}
                <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 px-6 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-white transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="appointment-form"
                        disabled={isSubmitting}
                        className="h-11 px-8 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 disabled:opacity-60 transition-all shadow-lg active:scale-95"
                    >
                        {isSubmitting ? "Saving..." : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
