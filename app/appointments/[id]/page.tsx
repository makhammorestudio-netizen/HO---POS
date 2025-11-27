"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;
    const [appointment, setAppointment] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aptRes, servicesRes, staffRes] = await Promise.all([
                    fetch(`/api/appointments/${id}`),
                    fetch('/api/services'),
                    fetch('/api/staff')
                ]);

                if (aptRes.ok) {
                    const data = await aptRes.json();
                    setAppointment(data);
                }
                if (servicesRes.ok) setServices(await servicesRes.json());
                if (staffRes.ok) setStaff(await staffRes.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (data: any) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                router.push('/appointments');
                router.refresh();
            } else {
                alert('Failed to update appointment');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Error updating appointment');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.push('/appointments');
                router.refresh();
            } else {
                alert('Failed to delete appointment');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Error deleting appointment');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center text-muted-foreground">Loading...</div>;
    if (!appointment) return <div className="p-8 flex justify-center text-muted-foreground">Appointment not found</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Edit Appointment</h1>
            </div>

            <Card className="glass border-0">
                <CardContent className="p-6">
                    <AppointmentForm
                        initialData={appointment}
                        services={services}
                        staff={staff}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                        onCancel={() => router.back()}
                        isSubmitting={saving}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
