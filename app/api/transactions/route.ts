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
                        const cost = Number(item.cogs || 0); // COGS from payload
                        const hasMainStaff = !!item.mainStaffId;
                        const hasAssistant = !!item.assistantId;
                        const isHairService = item.category === 'HAIR';

                        // Calculate Profit
                        const profit = Math.max(0, price - cost);

                        // 1. Main Staff Item (STYLIST or TECHNICIAN)
                        if (hasMainStaff) {
                            createdItems.push({
                                serviceId: item.serviceId,
                                price: price,                    // Full price
                                cost: cost,                      // Store cost
                                primaryStaffId: item.mainStaffId,
                                assistantStaffId: null,
                                // 10% of Profit for Main Staff
                                commissionAmount: profit * 0.10
                            });
                        }

                        // 2. Assistant Item
                        if (hasAssistant && isHairService) {
                            // If Main Staff exists -> Assistant gets 5% of Profit (Helper)
                            // If NO Main Staff -> Assistant gets 10% of Profit (Solo)
                            const commissionRate = hasMainStaff ? 0.05 : 0.10;

                            createdItems.push({
                                serviceId: item.serviceId,
                                price: 0,                        // No revenue attributed to assistant if main exists (business rule: revenue stays with main/shop)
                                cost: 0,                         // Cost already accounted for in main item or shop
                                primaryStaffId: item.assistantId,
                                assistantStaffId: null,
                                commissionAmount: profit * commissionRate
                            });
                        } else if (!hasMainStaff && hasAssistant) {
                            // Edge Case: Assistant Solo on Non-Hair (Technically shouldn't happen via UI rules but good for safety)
                            // Treat as Solo
                            createdItems.push({
                                serviceId: item.serviceId,
                                price: price,
                                cost: cost,
                                primaryStaffId: item.assistantId,
                                assistantStaffId: null,
                                commissionAmount: profit * 0.10
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
