"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';

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
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');

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

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setViewMode('list');
        setIsDialogOpen(true);
    };

    const handleAppointmentClick = (e: React.MouseEvent, apt: Appointment) => {
        e.stopPropagation();
        router.push(`/appointments/${apt.id}`);
    };

    const handleCreate = async (data: any) => {
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsDialogOpen(false);
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

        return appointments
            .filter(apt => {
                const aptDate = new Date(apt.scheduledAt);
                return aptDate.getDate() === date.getDate() &&
                    aptDate.getMonth() === date.getMonth() &&
                    aptDate.getFullYear() === date.getFullYear();
            })
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
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
    const selectedDateAppointments = getAppointmentsForDay(selectedDate);

    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
                    <p className="text-muted-foreground">Manage your salon bookings</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => {
                            setSelectedDate(new Date());
                            setViewMode('create');
                        }}>
                            <Plus className="h-4 w-4" />
                            Add Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {viewMode === 'create' ? 'New Appointment' :
                                    selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </DialogTitle>
                        </DialogHeader>

                        {viewMode === 'list' ? (
                            <div className="space-y-4">
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {selectedDateAppointments.length > 0 ? (
                                        selectedDateAppointments.map(apt => (
                                            <div
                                                key={apt.id}
                                                onClick={() => router.push(`/appointments/${apt.id}`)}
                                                className={cn(
                                                    "flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer",
                                                    getCategoryColor(apt.service.category)
                                                )}
                                            >
                                                <div>
                                                    <div className="font-medium">{apt.customerName}</div>
                                                    <div className="text-sm opacity-80">{apt.service.name}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-sm opacity-80">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No appointments for this day
                                        </div>
                                    )}
                                </div>
                                <Button className="w-full" onClick={() => setViewMode('create')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Appointment
                                </Button>
                            </div>
                        ) : (
                            <AppointmentForm
                                initialData={{ scheduledAt: selectedDate.toISOString() }}
                                services={services}
                                staff={staff}
                                onSubmit={handleCreate}
                                onCancel={() => {
                                    if (selectedDate) {
                                        setViewMode('list');
                                    } else {
                                        setIsDialogOpen(false);
                                    }
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Calendar */}
            <Card className="glass border-0 flex-1 flex flex-col min-h-0">
                <CardHeader className="shrink-0 py-4">
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
                <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2 shrink-0">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1 min-h-0">
                        {days.map((date, index) => {
                            const dayAppointments = getAppointmentsForDay(date);
                            const isToday = date &&
                                date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getFullYear() === new Date().getFullYear();

                            return (
                                <div
                                    key={index}
                                    onClick={() => date && handleDateClick(date)}
                                    className={cn(
                                        "relative flex flex-col rounded-lg border border-white/10 bg-white/5 p-1 transition-all overflow-hidden",
                                        !date && "opacity-0 pointer-events-none",
                                        date && "cursor-pointer hover:bg-white/10 hover:border-primary/50",
                                        isToday && "border-primary bg-primary/5"
                                    )}
                                >
                                    {date && (
                                        <>
                                            <div className={cn(
                                                "text-xs font-medium mb-1 shrink-0 px-1",
                                                isToday && "text-primary"
                                            )}>
                                                {date.getDate()}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1 min-h-0 px-1 pb-1">
                                                {dayAppointments.slice(0, 2).map(apt => (
                                                    <div
                                                        key={apt.id}
                                                        onClick={(e) => handleAppointmentClick(e, apt)}
                                                        className={cn(
                                                            "shrink-0 rounded border p-1 text-[10px] transition-colors hover:brightness-110 cursor-pointer z-10",
                                                            getCategoryColor(apt.service.category)
                                                        )}
                                                    >
                                                        <div className="font-medium truncate">{apt.customerName}</div>
                                                        <div className="flex items-center gap-1 opacity-80">
                                                            <Clock className="h-2 w-2" />
                                                            {new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                                {dayAppointments.length > 2 && (
                                                    <div className="text-[10px] text-muted-foreground text-center font-medium mt-auto">
                                                        +{dayAppointments.length - 2} more
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
