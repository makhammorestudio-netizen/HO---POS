import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build date filter for TransactionItems
        // We filter items based on their parent Transaction's createdAt date
        const dateFilter: any = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                dateFilter.createdAt.gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.createdAt.lte = end;
            }
        }

        // Fetch all staff
        const staffMembers = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        });

        // Fetch all transaction items in the date range
        const allItems = await prisma.transactionItem.findMany({
            where: {
                transaction: {
                    ...dateFilter,
                    status: 'COMPLETED'
                }
            },
            include: {
                service: true,
                transaction: true,
                primaryStaff: true,
                assistantStaff: true
            }
        });


        // Calculate aggregates for each staff
        const summary = staffMembers.map((staff: any) => {
            let mainServices = 0;
            let assistServices = 0;
            let totalRevenue = 0;
            let totalCost = 0;
            let totalProfit = 0;
            let totalCommission = 0;

            interface SummaryItem {
                id: string;
                serviceName: string;
                category: string;
                price: number;
                cost: number;
                profit: number;
                commission: number;
                date: Date;
                type: 'main' | 'assist';
            }

            const items: SummaryItem[] = [];

            allItems.forEach((item: any) => {
                const isOwner = item.primaryStaffId === staff.id;
                // Check if this is an assistant "commission-only" record (price 0)
                const isAssistRecord = isOwner && Number(item.price) === 0;

                if (isOwner && Number(item.price) > 0) {
                    // Main Service (Revenue generating)
                    mainServices++;
                    const price = Number(item.price);
                    const cost = Number(item.cost || 0); // Need to ensure schema has cost
                    const profit = Math.max(0, price - cost);

                    totalRevenue += price;
                    totalCost += cost;
                    totalProfit += profit;
                    totalCommission += Number(item.commissionAmount);

                    items.push({
                        id: item.id,
                        serviceName: item.service.name,
                        category: item.service.category,
                        price: price,
                        cost: cost,
                        profit: profit,
                        commission: Number(item.commissionAmount),
                        date: item.transaction.createdAt,
                        type: 'main'
                    });
                } else if (isAssistRecord) {
                    // Assistant Commission Record
                    assistServices++;
                    totalCommission += Number(item.commissionAmount);

                    items.push({
                        id: item.id,
                        serviceName: item.service.name,
                        category: item.service.category,
                        price: 0,
                        cost: 0,
                        profit: 0,
                        commission: Number(item.commissionAmount),
                        date: item.transaction.createdAt,
                        type: 'assist'
                    });
                }
            });

            return {
                id: staff.id,
                name: staff.name,
                role: staff.role,
                avatar: staff.avatar,
                mainServices,
                assistServices,
                totalRevenue,
                totalCost,
                totalProfit,
                totalCommission,
                items
            };
        });

        return NextResponse.json(summary);

    } catch (error) {
        console.error('Staff commission summary error:', error);
        return NextResponse.json({ error: 'Failed to fetch commission summary' }, { status: 500 });
    }
}
