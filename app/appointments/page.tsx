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
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from 'lucide-react';
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
            case 'HAIR': return 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200';
            case 'NAIL': return 'bg-orange-100 text-orange-900 border-orange-200 hover:bg-orange-200';
            case 'LASH': return 'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200';
            default: return 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200';
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
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>
                                {viewMode === 'create' ? 'New Appointment' :
                                    selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </DialogTitle>
                        </DialogHeader>

                        {viewMode === 'list' ? (
                            <div className="flex-1 overflow-hidden flex flex-col gap-4">
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                    {selectedDateAppointments.length > 0 ? (
                                        selectedDateAppointments.map(apt => (
                                            <div
                                                key={apt.id}
                                                className="group flex items-center justify-between rounded-lg border border-[rgba(31,60,136,0.12)] bg-[#E7EEFF] p-5 transition-all hover:border-[rgba(31,60,136,0.25)]"
                                            >
                                                <div className="flex flex-1 items-center justify-between mr-4">
                                                    {/* Left Side: Name & Service */}
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[18px] font-semibold text-[#1F2A53]">
                                                                {apt.customerName}
                                                            </span>
                                                            {/* Status Badge - Optional, keeping small */}
                                                            {apt.status !== 'SCHEDULED' && (
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                                    apt.status === 'COMPLETED' && "bg-green-100 text-green-700",
                                                                    apt.status === 'CANCELLED' && "bg-red-100 text-red-700",
                                                                    apt.status === 'NO_SHOW' && "bg-orange-100 text-orange-700"
                                                                )}>
                                                                    {apt.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[15px] font-normal text-[#4B5675]">
                                                            {apt.service.name} {apt.staff && <span className="text-sm opacity-75">• {apt.staff.name}</span>}
                                                        </div>
                                                    </div>

                                                    {/* Right Side: Time */}
                                                    <div className="flex items-center gap-2 text-[#1F2A53] font-medium text-[15px]">
                                                        <Clock className="h-4 w-4" />
                                                        {new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-white/50 text-[#1F2A53]"
                                                        onClick={() => router.push(`/appointments/${apt.id}`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Are you sure you want to delete this appointment?')) {
                                                                try {
                                                                    const res = await fetch(`/api/appointments/${apt.id}`, { method: 'DELETE' });
                                                                    if (res.ok) {
                                                                        fetchAppointments();
                                                                    } else {
                                                                        alert('Failed to delete appointment');
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('Error deleting appointment');
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No appointments for this day
                                        </div>
                                    )}
                                </div>
                                <Button className="w-full shrink-0" onClick={() => setViewMode('create')}>
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
            <Card className="glass border-0 flex-1 flex flex-col min-h-0 shadow-none bg-white/50 backdrop-blur-sm">
                <CardHeader className="shrink-0 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl text-slate-800">{monthYear}</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={previousMonth} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-slate-500 py-3 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0 bg-slate-100 gap-px border-b border-slate-100">
                        {days.map((date, index) => {
                            const dayAppointments = getAppointmentsForDay(date);
                            const isToday = date &&
                                date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getFullYear() === new Date().getFullYear();

                            const count = dayAppointments.length;
                            // Determine display mode
                            const mode = count <= 3 ? 'detailed' : count <= 8 ? 'compact' : 'dense';

                            return (
                                <div
                                    key={index}
                                    onClick={() => date && handleDateClick(date)}
                                    className={cn(
                                        "relative flex flex-col bg-white p-2 transition-all overflow-hidden group hover:bg-slate-50",
                                        !date && "bg-slate-50/30 pointer-events-none",
                                        date && "cursor-pointer",
                                        isToday && "bg-blue-50/30"
                                    )}
                                >
                                    {date && (
                                        <>
                                            <div className={cn(
                                                "text-sm font-medium mb-2 shrink-0 flex justify-between items-center",
                                                isToday ? "text-blue-600" : "text-slate-700"
                                            )}>
                                                <span className={cn(
                                                    "h-7 w-7 flex items-center justify-center rounded-full",
                                                    isToday && "bg-blue-100"
                                                )}>{date.getDate()}</span>
                                                {count > 0 && (
                                                    <span className="text-[10px] text-slate-400 font-normal">{count} bookings</span>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                                                {/* MODE: DETAILED (1-3 items) */}
                                                {mode === 'detailed' && dayAppointments.map(apt => (
                                                    <div
                                                        key={apt.id}
                                                        onClick={(e) => handleAppointmentClick(e, apt)}
                                                        title={`${new Date(apt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${apt.customerName} (${apt.service.name})`}
                                                        className={cn(
                                                            "shrink-0 rounded-md border px-2 py-1.5 text-xs transition-all hover:brightness-95 hover:shadow-sm cursor-pointer",
                                                            getCategoryColor(apt.service.category)
                                                        )}
                                                    >
                                                        <div className="font-bold text-[#1F2A53] truncate">{apt.customerName}</div>
                                                        <div className="flex justify-between items-center mt-0.5 opacity-90">
                                                            <span className="font-medium">
                                                                {new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: false
                                                                })}
                                                            </span>
                                                            <span className="truncate max-w-[60%]">{apt.service.name}</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* MODE: COMPACT (4-8 items) */}
                                                {mode === 'compact' && dayAppointments.map(apt => (
                                                    <div
                                                        key={apt.id}
                                                        onClick={(e) => handleAppointmentClick(e, apt)}
                                                        title={`${new Date(apt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${apt.customerName} (${apt.service.name})`}
                                                        className="shrink-0 flex items-center gap-2 text-xs hover:bg-slate-100 rounded px-1 py-0.5 cursor-pointer"
                                                    >
                                                        <div className={cn(
                                                            "h-2 w-2 rounded-sm shrink-0",
                                                            getCategoryColor(apt.service.category).split(' ')[0] // Get just the bg color
                                                        )} />
                                                        <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                                            {new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false
                                                            })}
                                                        </span>
                                                        <span className="truncate font-medium text-slate-700">{apt.customerName}</span>
                                                    </div>
                                                ))}

                                                {/* MODE: DENSE (9+ items) */}
                                                {mode === 'dense' && (
                                                    <>
                                                        {dayAppointments.slice(0, 4).map(apt => (
                                                            <div
                                                                key={apt.id}
                                                                title={`${new Date(apt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${apt.customerName} (${apt.service.name})`}
                                                                className="shrink-0 flex items-center gap-2 text-xs"
                                                            >
                                                                <div className={cn(
                                                                    "h-2 w-2 rounded-sm shrink-0",
                                                                    getCategoryColor(apt.service.category).split(' ')[0]
                                                                )} />
                                                                <span className="truncate font-medium text-slate-700">{apt.customerName}</span>
                                                            </div>
                                                        ))}
                                                        <div className="mt-auto pt-1 text-center">
                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-600 group-hover:bg-slate-200 transition-colors">
                                                                +{count - 4} more
                                                            </span>
                                                        </div>
                                                    </>
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
