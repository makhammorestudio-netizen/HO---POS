import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, customerId, paymentMethod, note } = body;

        // 1. Create Transaction
        const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.price), 0);

        // Fetch customer name for snapshot if customerId exists
        let customerNameSnapshot = body.customerNameSnapshot;
        if (customerId && !customerNameSnapshot) {
            const customer = await prisma.customer.findUnique({ where: { id: customerId } });
            if (customer) {
                customerNameSnapshot = customer.fullName;
            }
        }

        // Fetch staff details for commission calculation
        const staffIds = new Set<string>();
        items.forEach((item: any) => {
            if (item.mainStaffId) staffIds.add(item.mainStaffId);
            if (item.assistantId) staffIds.add(item.assistantId);
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
                customerNameSnapshot,
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
                            // Solo Assistant on non-hair service (fallback)
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
            } as any,
            include: {
                items: {
                    include: {
                        service: true,
                        primaryStaff: true,
                    },
                },
            },
        });

        // 2. Update Customer Stats
        if (customerId) {
            const customer = await prisma.customer.findUnique({ where: { id: customerId } });
            if (customer) {
                const totalVisits = customer.totalVisits + 1;
                const lifetimeSpend = Number(customer.lifetimeSpend) + totalAmount;
                const avgTicket = lifetimeSpend / totalVisits;

                await prisma.customer.update({
                    where: { id: customerId },
                    data: {
                        totalVisits,
                        lifetimeSpend,
                        avgTicket,
                        lastVisitAt: new Date(),
                    }
                });
            }
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Transaction error:', error);
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
    }
}
