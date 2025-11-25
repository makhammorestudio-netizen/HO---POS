import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Monthly Revenue
        const monthlyTransactions = await prisma.transaction.aggregate({
            where: {
                createdAt: {
                    gte: startOfMonth
                }
            },
            _sum: {
                totalAmount: true
            }
        });

        // Today's Transactions Count
        const todayCount = await prisma.transaction.count({
            where: {
                createdAt: {
                    gte: startOfToday
                }
            }
        });

        // Total Staff
        const staffCount = await prisma.user.count();

        // Total Customers
        const customerCount = await prisma.customer.count();

        // Recent Transactions (for activity feed)
        const recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                items: {
                    include: {
                        service: true,
                        primaryStaff: true
                    }
                },
                customer: true
            }
        });

        return NextResponse.json({
            monthlyRevenue: Number(monthlyTransactions._sum.totalAmount || 0),
            todayTransactions: todayCount,
            totalStaff: staffCount,
            totalCustomers: customerCount,
            recentTransactions
        });
    } catch (error) {
        console.error('Dashboard metrics error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
    }
}
