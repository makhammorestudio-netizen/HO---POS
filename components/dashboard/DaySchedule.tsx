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
    };
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
            case 'HAIR': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
            case 'NAIL': return 'bg-pink-500/20 border-pink-500/50 text-pink-300';
            case 'LASH': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
            default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
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
        <Card className="glass border-0">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Day Schedule</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={previousDay}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={isToday ? "default" : "outline"}
                            size="sm"
                            onClick={goToToday}
                            className="min-w-[80px]"
                        >
                            {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Button>
                        <Button variant="outline" size="sm" onClick={nextDay}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline */}
                    <div className="space-y-0">
                        {hours.map((hour, index) => (
                            <div key={hour} className="relative h-[60px] border-t border-white/5">
                                <span className="absolute -top-2 left-0 text-xs text-muted-foreground bg-background px-1">
                                    {hour}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Appointments */}
                    <div className="absolute top-0 left-16 right-0 bottom-0">
                        {appointments.map((apt) => {
                            const position = getAppointmentPosition(apt.scheduledAt, apt.service.durationMin);
                            return (
                                <div
                                    key={apt.id}
                                    onClick={() => router.push(`/appointments/${apt.id}`)}
                                    className={cn(
                                        "absolute left-0 right-0 mx-1 rounded-lg border p-2 cursor-pointer transition-all hover:brightness-110",
                                        getCategoryColor(apt.service.category)
                                    )}
                                    style={position}
                                >
                                    <div className="text-sm font-medium truncate">{apt.service.name}</div>
                                    <div className="text-xs opacity-80 truncate">{apt.customerName}</div>
                                    {apt.staff && (
                                        <div className="text-xs opacity-60 truncate">{apt.staff.name}</div>
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
