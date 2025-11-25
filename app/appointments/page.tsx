"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
    id: string;
    customerName: string;
    customerPhone: string;
    scheduledAt: string;
    deposit: number;
    notes?: string;
    status: string;
    service: {
        id: string;
        name: string;
        category: string;
        price: number;
    };
    staff?: {
        id: string;
        name: string;
    };
}

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

export default function AppointmentsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
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
        fetchAppointments();
        fetchServices();
        fetchStaff();
    }, [currentDate]);

    const fetchAppointments = async () => {
        try {
            const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const res = await fetch(`/api/appointments?month=${month}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setAppointments(data);
            }
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setServices(data);
            }
        } catch (error) {
            console.error('Failed to fetch services', error);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setStaff(data);
            }
        } catch (error) {
            console.error('Failed to fetch staff', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const scheduledAt = new Date(`${formData.date}T${formData.time}`);

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.customerName,
                    customerPhone: formData.customerPhone,
                    serviceId: formData.serviceId,
                    staffId: formData.staffId || null,
                    scheduledAt: scheduledAt.toISOString(),
                    deposit: parseFloat(formData.deposit) || 0,
                    notes: formData.notes
                })
            });

            if (res.ok) {
                setIsDialogOpen(false);
                setFormData({
                    customerName: '',
                    customerPhone: '',
                    serviceId: '',
                    staffId: '',
                    date: '',
                    time: '',
                    deposit: '',
                    notes: ''
                });
                fetchAppointments();
            } else {
                alert('Failed to create appointment');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Error creating appointment');
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getAppointmentsForDay = (date: Date | null) => {
        if (!date) return [];

        return appointments.filter(apt => {
            const aptDate = new Date(apt.scheduledAt);
            return aptDate.getDate() === date.getDate() &&
                aptDate.getMonth() === date.getMonth() &&
                aptDate.getFullYear() === date.getFullYear();
        });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'HAIR': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
            case 'NAIL': return 'bg-pink-500/20 border-pink-500/50 text-pink-300';
            case 'LASH': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
            default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = getDaysInMonth();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
                    <p className="text-muted-foreground">Manage your salon bookings</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>New Appointment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <Input
                                        required
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        placeholder="Enter customer name"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input
                                        required
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Service</label>
                                    <select
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                                    <label className="text-sm font-medium">Staff (Optional)</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                                        <label className="text-sm font-medium">Date</label>
                                        <Input
                                            required
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Time</label>
                                        <Input
                                            required
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Deposit (฿)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.deposit}
                                        onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Additional notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Appointment</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Calendar */}
            <Card className="glass border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{monthYear}</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={previousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((date, index) => {
                            const dayAppointments = getAppointmentsForDay(date);
                            const isToday = date &&
                                date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getFullYear() === new Date().getFullYear();

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "min-h-[120px] rounded-lg border border-white/10 bg-white/5 p-2",
                                        !date && "opacity-0",
                                        isToday && "border-primary bg-primary/5"
                                    )}
                                >
                                    {date && (
                                        <>
                                            <div className={cn(
                                                "text-sm font-medium mb-2",
                                                isToday && "text-primary"
                                            )}>
                                                {date.getDate()}
                                            </div>
                                            <div className="space-y-1">
                                                {dayAppointments.slice(0, 3).map(apt => (
                                                    <div
                                                        key={apt.id}
                                                        className={cn(
                                                            "rounded border p-1 text-xs",
                                                            getCategoryColor(apt.service.category)
                                                        )}
                                                    >
                                                        <div className="font-medium truncate">{apt.customerName}</div>
                                                        <div className="flex items-center gap-1 text-[10px] opacity-80">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                                {dayAppointments.length > 3 && (
                                                    <div className="text-[10px] text-muted-foreground text-center">
                                                        +{dayAppointments.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
