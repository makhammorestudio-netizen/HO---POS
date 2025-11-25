import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // 1. Seed Staff
        const staffCount = await prisma.user.count();
        if (staffCount === 0) {
            await prisma.user.createMany({
                data: [
                    { name: 'Alice (Stylist)', role: 'STYLIST', pin: '1111' },
                    { name: 'Bob (Assistant)', role: 'ASSISTANT', pin: '2222' },
                    { name: 'Charlie (Manager)', role: 'ADMIN', pin: '3333' },
                ]
            });
        }

        // 2. Seed Services
        const serviceCount = await prisma.service.count();
        if (serviceCount === 0) {
            await prisma.service.createMany({
                data: [
                    // Hair
                    { name: 'Women\'s Haircut', category: 'HAIR', price: 50.00, durationMin: 60 },
                    { name: 'Men\'s Haircut', category: 'HAIR', price: 30.00, durationMin: 45 },
                    { name: 'Hair Coloring', category: 'HAIR', price: 120.00, durationMin: 120 },
                    // Nail
                    { name: 'Gel Manicure', category: 'NAIL', price: 40.00, durationMin: 60 },
                    { name: 'Pedicure', category: 'NAIL', price: 45.00, durationMin: 60 },
                    // Lash
                    { name: 'Classic Lash Extensions', category: 'LASH', price: 80.00, durationMin: 90 },
                    { name: 'Lash Lift', category: 'LASH', price: 60.00, durationMin: 60 },
                    // Product
                    { name: 'Shampoo Bottle', category: 'PRODUCT', price: 25.00, durationMin: 0 },
                ]
            });
        }

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
