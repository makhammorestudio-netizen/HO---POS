"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Appointment {
    id: string;
    customerName: string;
    customerPhone: string;
    scheduledAt: string;
    deposit: number;
    service: {
        name: string;
        category: string;
        price: number;
        durationMin: number;
    };
    staff?: {
        name: string;
    } | null;
}

export function UpcomingAppointments() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

    const fetchAppointments = async () => {
        try {
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const res = await fetch(`/api/appointments?date=${selectedDate.toISOString().split('T')[0]}`);
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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'HAIR': return 'bg-purple-100 border-purple-200 hover:bg-purple-200';
            case 'NAIL': return 'bg-orange-100 border-orange-200 hover:bg-orange-200';
            case 'LASH': return 'bg-blue-100 border-blue-200 hover:bg-blue-200';
            default: return 'bg-gray-100 border-gray-200 hover:bg-gray-200';
        }
    };

    const getPriceColor = (category: string) => {
        return 'text-[#1F2A53]';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTimeRange = (scheduledAt: string, durationMin: number) => {
        const start = new Date(scheduledAt);
        const end = new Date(start.getTime() + durationMin * 60000);

        const formatTime = (date: Date) => {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        };

        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    // Generate week days around selected date
    const getWeekDays = () => {
        const days = [];
        const currentDay = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - currentDay);

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }

        return days;
    };

    const previousWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedDate(newDate);
    };

    const weekDays = getWeekDays();
    const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <Card className="bg-white border-0 rounded-friendly card-shadow h-full">
            <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Appointments
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {/* Compact Week Calendar */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white rounded-full" onClick={previousWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                            <span className="text-sm font-bold text-primary">{monthYear}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white rounded-full" onClick={nextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Week Days Horizontal */}
                    <div className="flex justify-between gap-1">
                        {weekDays.map((date, index) => {
                            const isSelected =
                                date.getDate() === selectedDate.getDate() &&
                                date.getMonth() === selectedDate.getMonth() &&
                                date.getFullYear() === selectedDate.getFullYear();
                            const isToday =
                                date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getFullYear() === new Date().getFullYear();
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "flex flex-col items-center justify-center rounded-xl p-2 min-w-[45px] transition-all duration-200",
                                        isSelected
                                            ? "bg-primary text-white shadow-md scale-105"
                                            : "hover:bg-white hover:shadow-sm text-muted-foreground",
                                        isToday && !isSelected && "bg-white text-primary font-bold border border-primary/20"
                                    )}
                                >
                                    <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">{dayName}</span>
                                    <span className="text-lg font-bold">{date.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {appointments.length > 0 ? (
                        appointments.map((apt) => (
                            <div
                                key={apt.id}
                                onClick={() => router.push(`/appointments/${apt.id}`)}
                                className={cn(
                                    "group flex items-center justify-between rounded-lg border p-4 transition-all cursor-pointer",
                                    getCategoryColor(apt.service.category)
                                )}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="font-semibold text-[16px] text-[#1F2A53] group-hover:text-primary transition-colors">
                                        {apt.customerName}
                                    </div>
                                    <div className="text-sm text-[#4B5675]">{apt.service.name}</div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-[#1F2A53] font-medium text-sm">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{formatTimeRange(apt.scheduledAt, apt.service.durationMin)}</span>
                                    </div>
                                    <div className="text-xs font-medium text-[#4B5675] opacity-75">
                                        ${apt.service.price}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Calendar className="h-10 w-10 opacity-20 mb-3" />
                            <p className="font-medium">No appointments</p>
                            <p className="text-xs opacity-60">Enjoy your free time!</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
