"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

interface Service {
    id: string;
    name: string;
    category: string;
    price: number;
}

interface Staff {
    id: string;
    name: string;
}

interface AppointmentFormProps {
    initialData?: any;
    services: Service[];
    staff: Staff[];
    onSubmit: (data: any) => void;
    onDelete?: () => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    hideButtons?: boolean;
}

export function AppointmentForm({
    initialData,
    services,
    staff,
    onSubmit,
    onDelete,
    onCancel,
    isSubmitting = false,
    hideButtons = false
}: AppointmentFormProps) {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        serviceId: '',
        staffId: '',
        date: '',
        time: '',
        deposit: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            const date = new Date(initialData.scheduledAt);
            setFormData({
                customerName: initialData.customerName || '',
                customerPhone: initialData.customerPhone || '',
                serviceId: initialData.serviceId || initialData.service?.id || '',
                staffId: initialData.staffId || initialData.staff?.id || '',
                date: date.toISOString().split('T')[0],
                time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                deposit: initialData.deposit?.toString() || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData(prev => ({
                ...prev,
                date: new Date().toISOString().split('T')[0]
            }));
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const scheduledAt = new Date(`${formData.date}T${formData.time}`);

        let customerName = formData.customerName.trim();
        if (customerName && !customerName.toLowerCase().startsWith('khun ')) {
            customerName = `Khun ${customerName}`;
        }

        const payload = {
            customerName,
            customerPhone: formData.customerPhone,
            serviceId: formData.serviceId,
            staffId: formData.staffId || null,
            scheduledAt: scheduledAt.toISOString(),
            deposit: parseFloat(formData.deposit) || 0,
            notes: formData.notes
        };

        onSubmit(payload);
    };

    return (
        <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#1F2A53]">Customer Name</label>
                    <Input
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Enter name (Khun will be added automatically)"
                        className="border-slate-200 focus:border-primary focus:ring-primary/20 text-[#1F2A53]"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#1F2A53]">Phone Number</label>
                    <Input
                        required
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="Enter phone number"
                        className="border-slate-200 focus:border-primary focus:ring-primary/20 text-[#1F2A53]"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#1F2A53]">Service</label>
                    <select
                        required
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-[#1F2A53] focus:border-primary focus:ring-primary/20 focus:outline-none"
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    >
                        <option value="">Select service</option>
                        {services.map(service => (
                            <option key={service.id} value={service.id}>
                                {service.name} - ฿{Number(service.price).toFixed(0)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#1F2A53]">Staff (Optional)</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-[#1F2A53] focus:border-primary focus:ring-primary/20 focus:outline-none"
                        value={formData.staffId}
                        onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    >
                        <option value="">No preference</option>
                        {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-semibold text-[#1F2A53]">Date</label>
                        <Input
                            required
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="border-slate-200 focus:border-primary focus:ring-primary/20 text-[#1F2A53]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-semibold text-[#1F2A53]">Time</label>
                        <Input
                            required
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="border-slate-200 focus:border-primary focus:ring-primary/20 text-[#1F2A53]"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#1F2A53]">Deposit (฿)</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={formData.deposit}
                        onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                        placeholder="0.00"
                        className="border-slate-200 focus:border-primary focus:ring-primary/20 text-[#1F2A53]"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#1F2A53]">Notes</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-[#1F2A53] focus:border-primary focus:ring-primary/20 focus:outline-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes..."
                    />
                </div>
            </div>

            {!hideButtons && (
                <div className="flex justify-between gap-2 pt-4">
                    {initialData && onDelete && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={onDelete}
                            disabled={isSubmitting}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-[#1F2A53] hover:bg-slate-50"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {initialData ? 'Save Changes' : 'Create Appointment'}
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
