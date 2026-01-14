import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { pin, reason, note } = await request.json();

        if (!reason) {
            return NextResponse.json({ error: 'Void reason is required.' }, { status: 400 });
        }

        // 1. Verify PIN and Role (ADMIN or MANAGER)
        const manager = await prisma.user.findFirst({
            where: {
                pin,
                role: { in: ['ADMIN', 'MANAGER'] }
            }
        });

        if (!manager) {
            return NextResponse.json({ error: 'Invalid PIN or insufficient permission.' }, { status: 403 });
        }

        // 2. Fetch Transaction
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                customer: true
            }
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
        }

        if (transaction.status === 'VOID') {
            return NextResponse.json({ error: 'Transaction is already voided.' }, { status: 400 });
        }

        // 3. Process Void in a Transaction
        await prisma.$transaction(async (tx) => {
            // Update Transaction status and audit info
            await tx.transaction.update({
                where: { id },
                data: {
                    status: 'VOID',
                    voidedAt: new Date(),
                    voidedByStaffId: manager.id,
                    voidReason: reason,
                    voidNote: note
                }
            });

            // Update Customer Stats (Rollback spend/visits)
            if (transaction.customerId && transaction.customer) {
                const totalAmount = Number(transaction.totalAmount);
                const totalVisits = Math.max(0, transaction.customer.totalVisits - 1);
                const lifetimeSpend = Math.max(0, Number(transaction.customer.lifetimeSpend) - totalAmount);
                const avgTicket = totalVisits > 0 ? lifetimeSpend / totalVisits : 0;

                await tx.customer.update({
                    where: { id: transaction.customerId },
                    data: {
                        totalVisits,
                        lifetimeSpend,
                        avgTicket
                    }
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Transaction voided successfully.'
        });
    } catch (error) {
        console.error('Void transaction error:', error);
        return NextResponse.json({ error: 'Failed to void transaction.' }, { status: 500 });
    }
}
