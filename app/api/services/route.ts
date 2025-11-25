import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { category: 'asc' },
        });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, price, durationMin } = body;

        const newService = await prisma.service.create({
            data: {
                name,
                category,
                price: Number(price),
                durationMin: Number(durationMin),
            },
        });

        return NextResponse.json(newService);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}
