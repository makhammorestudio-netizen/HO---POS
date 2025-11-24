import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
    try {
        const staff = await prisma.user.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(staff);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, role, pin } = body;

        const newStaff = await prisma.user.create({
            data: {
                name,
                role: role as Role,
                pin,
            },
        });

        return NextResponse.json(newStaff);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
    }
}
