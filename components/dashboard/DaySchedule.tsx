"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Appointment {
    id: string;
    customerName: string;
    scheduledAt: string;
    service: {
        name: string;
        category: string;
        durationMin: number;
    };
    staff?: {
        name: string;
    } | null;
}

export function DaySchedule() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

    const fetchAppointments = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await fetch(`/api/appointments?date=${dateStr}`);
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
            case 'HAIR': return 'bg-pastel-lavender border-indigo-100 text-primary';
            case 'NAIL': return 'bg-pastel-peach border-orange-100 text-orange-800';
            case 'LASH': return 'bg-pastel-coral border-red-100 text-red-800';
            default: return 'bg-slate-100 border-slate-200 text-slate-700';
        }
    };

    const getAppointmentPosition = (scheduledAt: string, durationMin: number) => {
        const date = new Date(scheduledAt);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // Calculate position from 8:00 AM
        const startHour = 8;
        const totalMinutesFromStart = (hours - startHour) * 60 + minutes;
        const top = (totalMinutesFromStart / 60) * 60; // 60px per hour

        // Calculate height based on duration
        const height = (durationMin / 60) * 60;

        return { top: `${top}px`, height: `${height}px` };
    };

    const previousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const nextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Generate hours from 8 AM to 8 AM next day (24 hours)
    const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = (8 + i) % 24;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    const isToday = selectedDate.toDateString() === new Date().toDateString();

    return (
        <Card className="bg-white border-0 rounded-friendly card-shadow h-full">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Day Schedule
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={previousDay} className="h-8 w-8 hover:bg-slate-100 rounded-full">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={isToday ? "default" : "ghost"}
                            size="sm"
                            onClick={goToToday}
                            className={cn(
                                "min-w-[100px] rounded-full font-medium",
                                isToday ? "bg-primary text-white shadow-md hover:bg-primary/90" : "hover:bg-slate-100"
                            )}
                        >
                            {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextDay} className="h-8 w-8 hover:bg-slate-100 rounded-full">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium pl-4">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative h-[600px] overflow-y-auto custom-scrollbar">
                    {/* Timeline */}
                    <div className="space-y-0 pt-4">
                        {hours.map((hour, index) => (
                            <div key={hour} className="relative h-[60px] border-t border-slate-100">
                                <span className="absolute -top-2.5 left-4 text-xs font-medium text-muted-foreground bg-white px-1">
                                    {hour}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Appointments */}
                    <div className="absolute top-4 left-20 right-4 bottom-0">
                        {appointments.map((apt) => {
                            const position = getAppointmentPosition(apt.scheduledAt, apt.service.durationMin);
                            return (
                                <div
                                    key={apt.id}
                                    onClick={() => router.push(`/appointments/${apt.id}`)}
                                    className={cn(
                                        "absolute left-0 right-0 mx-1 rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group",
                                        getCategoryColor(apt.service.category)
                                    )}
                                    style={position}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-sm truncate">{apt.service.name}</div>
                                        <div className="text-[10px] font-bold opacity-70 bg-white/50 px-1.5 py-0.5 rounded-full">
                                            {apt.service.durationMin}m
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium opacity-90 truncate mt-0.5">{apt.customerName}</div>
                                    {apt.staff && (
                                        <div className="text-xs opacity-70 truncate mt-1 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {apt.staff.name}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
