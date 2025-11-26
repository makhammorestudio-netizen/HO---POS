"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
    };
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
            case 'HAIR': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
            case 'NAIL': return 'bg-pink-500/20 border-pink-500/50 text-pink-300';
            case 'LASH': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
            default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
        }
    };

    const getPriceColor = (category: string) => {
        switch (category) {
            case 'HAIR': return 'text-blue-400';
            case 'NAIL': return 'text-pink-400';
            case 'LASH': return 'text-purple-400';
            default: return 'text-yellow-400';
        }
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

    // Generate calendar days for current month
    const getDaysInMonth = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
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

    const previousMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
    };

    const nextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate);
    };

    const days = getDaysInMonth();
    const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <Card className="glass border-0">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mini Calendar */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={previousMonth}>
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">{monthYear}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMonth}>
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[10px] text-muted-foreground py-1">
                                {day}
                            </div>
                        ))}
                        {days.map((date, index) => {
                            const isSelected = date &&
                                date.getDate() === selectedDate.getDate() &&
                                date.getMonth() === selectedDate.getMonth() &&
                                date.getFullYear() === selectedDate.getFullYear();
                            const isToday = date &&
                                date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getFullYear() === new Date().getFullYear();

                            return (
                                <button
                                    key={index}
                                    onClick={() => date && setSelectedDate(date)}
                                    disabled={!date}
                                    className={cn(
                                        "aspect-square text-[10px] rounded transition-colors",
                                        !date && "invisible",
                                        date && !isSelected && "hover:bg-white/10",
                                        isSelected && "bg-primary text-primary-foreground font-medium",
                                        isToday && !isSelected && "border border-primary/50"
                                    )}
                                >
                                    {date?.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {appointments.length > 0 ? (
                        appointments.map((apt) => (
                            <div
                                key={apt.id}
                                onClick={() => router.push(`/appointments/${apt.id}`)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-white/5 cursor-pointer",
                                    getCategoryColor(apt.service.category)
                                )}
                            >
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        {getInitials(apt.customerName)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{apt.customerName}</div>
                                    <div className="text-sm opacity-80 truncate">{apt.service.name}</div>
                                    <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatTimeRange(apt.scheduledAt, apt.service.durationMin)}</span>
                                        {apt.staff && (
                                            <>
                                                <span>•</span>
                                                <span>{apt.staff.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={cn("font-bold text-lg shrink-0", getPriceColor(apt.service.category))}>
                                    ${apt.service.price}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No appointments for this day
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
