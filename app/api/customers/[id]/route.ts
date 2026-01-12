import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { fullName, phone, notes, preferredLanguage, email, lineId, instagram, birthday, gender, tags, consentAllowPromo, consentAllowContact } = body;

        const updatedCustomer = await prisma.customer.update({
            where: { id: params.id },
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
                tags,
                consentAllowPromo,
                consentAllowContact,
            },
        });

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.customer.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete customer error:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
