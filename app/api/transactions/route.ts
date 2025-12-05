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
                    create: items.flatMap((item: any) => {
                        const createdItems = [];
                        const price = Number(item.price);
                        const hasMainStaff = !!item.mainStaffId;
                        const hasAssistant = !!item.assistantId;
                        const isHairService = item.category === 'HAIR';

                        // 1. Main Staff Item (STYLIST or TECHNICIAN)
                        if (hasMainStaff) {
                            createdItems.push({
                                serviceId: item.serviceId,
                                price: price,                    // Full price
                                primaryStaffId: item.mainStaffId,
                                assistantStaffId: null,
                                commissionAmount: price * 0.10   // Always 10%
                            });
                        }

                        // 2. Assistant Item (ASSISTANT role, HAIR services only)
                        if (hasAssistant && isHairService) {
                            createdItems.push({
                                serviceId: item.serviceId,
                                price: 0,                        // No revenue for assistant
                                primaryStaffId: item.assistantId,
                                assistantStaffId: null,
                                commissionAmount: price * 0.05   // Always 5%
                            });
                        }

                        return createdItems;
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
