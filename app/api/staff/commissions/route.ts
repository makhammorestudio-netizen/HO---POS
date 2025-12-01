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
            orderBy: { name: 'asc' },
            include: {
                primaryTransactions: {
                    where: {
                        transaction: dateFilter
                    },
                    include: {
                        service: true,
                        transaction: true
                    }
                }
            }
        });

        // Calculate aggregates for each staff
        const summary = staffMembers.map(staff => {
            const items = staff.primaryTransactions;

            const totalServices = items.length;
            const totalRevenue = items.reduce((sum, item) => sum + Number(item.price), 0);
            const totalCommission = items.reduce((sum, item) => sum + Number(item.commissionAmount), 0);

            // Group by category (optional breakdown)
            const byCategory: Record<string, { count: number, revenue: number, commission: number }> = {};

            items.forEach(item => {
                const cat = item.service.category;
                if (!byCategory[cat]) {
                    byCategory[cat] = { count: 0, revenue: 0, commission: 0 };
                }
                byCategory[cat].count++;
                byCategory[cat].revenue += Number(item.price);
                byCategory[cat].commission += Number(item.commissionAmount);
            });

            return {
                id: staff.id,
                name: staff.name,
                role: staff.role,
                totalServices,
                totalRevenue,
                totalCommission,
                byCategory,
                // Include raw items for detail view if needed, but maybe too heavy? 
                // Let's include a simplified version for the modal
                items: items.map(item => ({
                    id: item.id,
                    serviceName: item.service.name,
                    category: item.service.category,
                    price: Number(item.price),
                    commission: Number(item.commissionAmount),
                    date: item.transaction.createdAt
                }))
            };
        });

        return NextResponse.json(summary);

    } catch (error) {
        console.error('Staff commission summary error:', error);
        return NextResponse.json({ error: 'Failed to fetch commission summary' }, { status: 500 });
    }
}
