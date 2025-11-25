import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Format: YYYY-MM

        let whereClause = {};

        if (month) {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

            whereClause = {
                scheduledAt: {
                    gte: startDate,
                    lte: endDate
                }
            };
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                service: true,
                staff: true
            },
            orderBy: {
                scheduledAt: 'asc'
            }
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error('Appointments fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerName, customerPhone, scheduledAt, serviceId, staffId, deposit, notes } = body;

        const appointment = await prisma.appointment.create({
            data: {
                customerName,
                customerPhone,
                scheduledAt: new Date(scheduledAt),
                serviceId,
                staffId: staffId || null,
                deposit: deposit || 0,
                notes: notes || null
            },
            include: {
                service: true,
                staff: true
            }
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error('Appointment creation error:', error);
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }
}
