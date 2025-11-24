import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateCommission } from '@/lib/commission';
import { PaymentMethod } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, customerId, paymentMethod, note } = body;

        // 1. Create Transaction
        const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);

        const transaction = await prisma.transaction.create({
            data: {
                totalAmount,
                paymentMethod: paymentMethod as PaymentMethod,
                customerId,
                note,
                items: {
                    create: items.map((item: any) => ({
                        serviceId: item.serviceId,
                        price: item.price,
                        primaryStaffId: item.primaryStaffId,
                        assistantStaffId: item.assistantStaffId || null,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        service: true,
                        primaryStaff: true,
                        assistantStaff: true,
                    },
                },
            },
        });

        // 2. Calculate Commissions
        for (const item of transaction.items) {
            // Primary Staff Commission
            const primaryCommission = calculateCommission({
                servicePrice: Number(item.price),
                serviceCategory: item.service.category,
                staffRole: item.primaryStaff.role,
                isAssistant: false,
            });

            if (primaryCommission > 0) {
                await prisma.commissionLog.create({
                    data: {
                        amount: primaryCommission,
                        staffId: item.primaryStaffId,
                        transactionItemId: item.id,
                        reason: `Commission for ${item.service.name}`,
                    },
                });
            }

            // Assistant Staff Commission (if exists)
            if (item.assistantStaff && item.assistantStaffId) {
                const assistantCommission = calculateCommission({
                    servicePrice: Number(item.price),
                    serviceCategory: item.service.category,
                    staffRole: item.assistantStaff.role,
                    isAssistant: true,
                });

                if (assistantCommission > 0) {
                    await prisma.commissionLog.create({
                        data: {
                            amount: assistantCommission,
                            staffId: item.assistantStaffId,
                            transactionItemId: item.id,
                            reason: `Assistant Commission for ${item.service.name}`,
                        },
                    });
                }
            }
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Transaction error:', error);
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
    }
}
