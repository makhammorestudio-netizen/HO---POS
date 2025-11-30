import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentMethod, ServiceCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const paymentMethod = searchParams.get('paymentMethod');

        // Build where clause
        const where: any = {};

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                where.createdAt.gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        if (paymentMethod && paymentMethod !== 'ALL') {
            where.paymentMethod = paymentMethod as PaymentMethod;
        }

        // Fetch transactions
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                items: {
                    include: {
                        service: true,
                        primaryStaff: true
                    }
                },
                customer: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate Summary Metrics
        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);

        // Today's Revenue (if within filtered range, otherwise 0 or separate query? 
        // The prompt asks for "Today's Revenue" card. It usually implies "Today" regardless of filter, 
        // OR "Today" relative to the filter. Let's assume "Today" means actual today for the summary card.)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayTransactions = await prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd
                }
            }
        });
        const todayRevenue = todayTransactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);

        // Revenue by Payment Method (based on filtered transactions)
        const revenueByMethod = {
            CASH: 0,
            CREDIT_CARD: 0,
            TRANSFER: 0,
            GOWABI: 0
        };

        transactions.forEach(t => {
            if (revenueByMethod[t.paymentMethod] !== undefined) {
                revenueByMethod[t.paymentMethod] += Number(t.totalAmount);
            }
        });

        // Revenue by Category (based on filtered transactions)
        const revenueByCategory: Record<string, number> = {
            HAIR: 0,
            NAIL: 0,
            LASH: 0,
            PRODUCT: 0
        };

        transactions.forEach(t => {
            t.items.forEach(item => {
                if (item.service && revenueByCategory[item.service.category] !== undefined) {
                    revenueByCategory[item.service.category] += Number(item.price);
                }
            });
        });

        return NextResponse.json({
            transactions,
            summary: {
                totalRevenue,
                todayRevenue,
                revenueByMethod,
                revenueByCategory
            }
        });

    } catch (error) {
        console.error('Transactions list error:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
