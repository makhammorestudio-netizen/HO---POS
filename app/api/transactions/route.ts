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
                        const hasStylist = !!item.primaryStaffId;
                        const hasAssistant = !!item.assistantStaffId;

                        // 1. Stylist Item (or Main Item if no staff)
                        if (hasStylist || !hasAssistant) {
                            let commission = 0;
                            if (hasStylist) {
                                commission = price * 0.10; // 10% for Stylist
                            }

                            createdItems.push({
                                serviceId: item.serviceId,
                                price: price, // Full price attributed here
                                primaryStaffId: item.primaryStaffId || null, // Can be null now
                                assistantStaffId: null, // We don't use this relation for commission tracking anymore
                                commissionAmount: commission
                            });
                        }

                        // 2. Assistant Item (if present)
                        if (hasAssistant) {
                            let commission = 0;
                            if (hasStylist) {
                                commission = price * 0.05; // 5% if helping stylist
                            } else {
                                commission = price * 0.10; // 10% if solo (no stylist)
                            }

                            createdItems.push({
                                serviceId: item.serviceId,
                                price: 0, // 0 revenue attributed to assistant to avoid double counting
                                primaryStaffId: item.assistantStaffId, // Assistant becomes "primary" for this record
                                assistantStaffId: null,
                                commissionAmount: commission
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
