import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                service: true,
                staff: true
            }
        });

        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error('Appointment fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
    }
}


export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { customerName, customerPhone, scheduledAt, serviceId, staffId, deposit, notes, status } = body;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                customerName,
                customerPhone,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                serviceId,
                staffId: staffId || null,
                deposit: deposit !== undefined ? parseFloat(deposit) : undefined,
                notes,
                status
            },
            include: {
                service: true,
                staff: true
            }
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error('Appointment update error:', error);
        return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        await prisma.appointment.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Appointment deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
    }
}
