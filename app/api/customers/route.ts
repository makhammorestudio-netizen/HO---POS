import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone } = body;

        const newCustomer = await prisma.customer.create({
            data: {
                name,
                phone,
                points: 0,
            },
        });

        return NextResponse.json(newCustomer);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
