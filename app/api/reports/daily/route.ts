import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        const date = dateParam ? new Date(dateParam) : new Date();
        const start = startOfDay(date);
        const end = endOfDay(date);

        // Fetch transactions for the day
        const transactions = await prisma.transaction.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                items: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        // Aggregations
        let totalSales = 0;
        const salesByPaymentMethod: Record<string, number> = {};
        const salesByCategory: Record<string, number> = {};

        for (const tx of transactions) {
            const amount = Number(tx.totalAmount);
            totalSales += amount;

            // By Payment Method
            salesByPaymentMethod[tx.paymentMethod] = (salesByPaymentMethod[tx.paymentMethod] || 0) + amount;

            // By Category (iterate items)
            for (const item of tx.items) {
                const itemPrice = Number(item.price);
                const category = item.service.category;
                salesByCategory[category] = (salesByCategory[category] || 0) + itemPrice;
            }
        }

        return NextResponse.json({
            date: date.toISOString(),
            totalSales,
            totalTransactions: transactions.length,
            salesByPaymentMethod,
            salesByCategory,
        });
    } catch (error) {
        console.error('Error fetching daily report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
