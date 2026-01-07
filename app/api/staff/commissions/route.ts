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
                transaction: dateFilter
            },
            include: {
                service: true,
                transaction: true,
                primaryStaff: true,
                assistantStaff: true
            }
        });

        // Calculate aggregates for each staff
        const summary = staffMembers.map(staff => {
            let mainServices = 0;
            let assistServices = 0;
            let totalRevenue = 0;
            let totalCommission = 0;
            const items: any[] = [];

            allItems.forEach(item => {
                const isOwner = item.primaryStaffId === staff.id;
                const isAssistant = item.assistantStaffId === staff.id;

                if (isOwner && Number(item.price) > 0) { // Only count as main service if price > 0
                    // This staff is the main owner of this service
                    mainServices++;
                    totalRevenue += Number(item.price);
                    totalCommission += Number(item.commissionAmount);

                    items.push({
                        id: item.id,
                        serviceName: item.service.name,
                        category: item.service.category,
                        price: Number(item.price),
                        commission: Number(item.commissionAmount),
                        date: item.transaction.createdAt,
                        type: 'main'
                    });
                } else if (isAssistant) {
                    // This staff is assisting on this service
                    // Note: We need to find the corresponding commission item for this assistant
                    // Since we split items, we need to find items where this staff is primaryStaff
                    // but the price is 0 (assistant items)
                }
            });

            // Also check for items where this staff is listed as primaryStaff with price=0
            // These are assistant commission records
            allItems.forEach(item => {
                if (item.primaryStaffId === staff.id && Number(item.price) === 0) {
                    // This is an assistant commission record
                    assistServices++;
                    totalCommission += Number(item.commissionAmount);

                    items.push({
                        id: item.id,
                        serviceName: item.service.name,
                        category: item.service.category,
                        price: 0,
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
