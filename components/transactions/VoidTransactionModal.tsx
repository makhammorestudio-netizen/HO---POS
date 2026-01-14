"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Loader2 } from 'lucide-react';

const VOID_REASONS = [
    'Wrong service',
    'Wrong staff',
    'Duplicate transaction',
    'Payment mistake',
    'Other'
];

interface VoidTransactionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transactionId: string;
    paymentMethod: string;
}

export function VoidTransactionModal({
    open,
    onClose,
    onSuccess,
    transactionId,
    paymentMethod
}: VoidTransactionModalProps) {
    const [pin, setPin] = useState('');
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isNonCash = ['CREDIT_CARD', 'TRANSFER', 'GOWABI'].includes(paymentMethod);

    const handleVoid = async () => {
        if (!pin || !reason) {
            setError('PIN and Reason are required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/transactions/${transactionId}/void`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, reason, note })
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError(data.error || 'Failed to void transaction');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Void Transaction
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-100">
                        <p className="font-semibold mb-1">Warning: This action cannot be undone.</p>
                        {isNonCash && (
                            <p className="mt-2 text-xs opacity-90">
                                Voiding in POS does not automatically refund the payment ({paymentMethod.replace('_', ' ')}).
                                Please refund separately.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#1F2A53]">Reason <span className="text-red-500">*</span></label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-[#1F2A53] focus:border-primary focus:ring-primary/20 focus:outline-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="">Select a reason</option>
                            {VOID_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#1F2A53]">Additional Note (Optional)</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-[#1F2A53] focus:border-primary focus:ring-primary/20 focus:outline-none"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add more details..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#1F2A53]">Manager PIN <span className="text-red-500">*</span></label>
                        <Input
                            type="password"
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="text-center text-lg tracking-widest border-slate-200"
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-[#4B5675]">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleVoid}
                        disabled={isSubmitting || !pin || !reason}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Voiding...
                            </>
                        ) : 'Confirm Void'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
