import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, role, pin } = body;

        const updatedStaff = await prisma.user.update({
            where: { id: params.id },
            data: {
                name,
                role: role as Role,
                pin,
            },
        });

        return NextResponse.json(updatedStaff);
    } catch (error) {
        console.error('Failed to update staff:', error);
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.user.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete staff:', error);
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
    }
}
