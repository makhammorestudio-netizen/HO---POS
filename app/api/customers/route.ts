import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const customers = await prisma.customer.findMany({
            where: search ? {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ]
            } : {},
            orderBy: { fullName: 'asc' },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error('Fetch customers error:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, phone, notes, preferredLanguage, email, lineId, instagram, birthday, gender, tags, consentAllowPromo, consentAllowContact } = body;

        if (!fullName) {
            return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
        }

        const newCustomer = await prisma.customer.create({
            data: {
                fullName,
                phone,
                notes,
                preferredLanguage,
                email,
                lineId,
                instagram,
                birthday: birthday ? new Date(birthday) : null,
                gender,
                tags: tags || [],
                consentAllowPromo: !!consentAllowPromo,
                consentAllowContact: !!consentAllowContact,
                totalVisits: 0,
                lifetimeSpend: 0,
                avgTicket: 0,
            },
        });

        return NextResponse.json(newCustomer);
    } catch (error) {
        console.error('Create customer error:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
