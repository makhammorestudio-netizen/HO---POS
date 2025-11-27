import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentMethod, CommissionType } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, customerId, paymentMethod, note } = body;

        // 1. Create Transaction
        const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.price), 0);

        // Fetch staff details for commission calculation
        const staffIds = new Set<string>();
        items.forEach((item: any) => {
            if (item.primaryStaffId) staffIds.add(item.primaryStaffId);
            if (item.assistantStaffId) staffIds.add(item.assistantStaffId);
        });

        const staffMembers = await prisma.user.findMany({
            where: { id: { in: Array.from(staffIds) } },
        });

        const staffMap = new Map(staffMembers.map(s => [s.id, s]));

        const transaction = await prisma.transaction.create({
            data: {
                totalAmount,
                paymentMethod: paymentMethod as PaymentMethod,
                customerId,
                note,
                items: {
                    create: items.map((item: any) => {
                        const primaryStaff = staffMap.get(item.primaryStaffId);
                        let commissionAmount = 0;

                        // Calculate commission for primary staff
                        if (primaryStaff) {
                            if (primaryStaff.commissionType === CommissionType.PERCENT) {
                                commissionAmount = Number(item.price) * (Number(primaryStaff.commissionRate) / 100);
                            } else {
                                commissionAmount = Number(primaryStaff.commissionRate);
                            }
                        }

                        // Note: Currently only storing primary staff commission on the item. 
                        // If assistant commission is needed, we might need to split it or add another field.
                        // For now, following the prompt "Each TransactionItem must have... commissionAmount".
                        // Assuming this refers to the total commission or primary. 
                        // Given the prompt says "commissionAmount is calculated from the staff commission settings", 
                        // and a transaction item has one primary staff, we'll use that.

                        return {
                            serviceId: item.serviceId,
                            price: item.price,
                            primaryStaffId: item.primaryStaffId,
                            assistantStaffId: item.assistantStaffId || null,
                            commissionAmount: commissionAmount
                        };
                    }),
                },
            },
            include: {
                items: {
                    include: {
                        service: true,
                        primaryStaff: true,
                    },
                },
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Transaction error:', error);
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
    }
}
