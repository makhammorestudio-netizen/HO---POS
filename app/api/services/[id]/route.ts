import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, category, price, cogs, durationMin } = body;

        const updatedService = await prisma.service.update({
            where: { id: params.id },
            data: {
                name,
                category,
                price: Number(price),
                cogs: Number(cogs || 0),
                durationMin: Number(durationMin),
            } as any,
        });

        return NextResponse.json(updatedService);
    } catch (error) {
        console.error('Failed to update service:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.service.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete service:', error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
