import { PrismaClient, Role, ServiceCategory } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // 1. Create Staff
    const stylist = await prisma.user.upsert({
        where: { id: 'stylist-1' },
        update: {},
        create: {
            id: 'stylist-1',
            name: 'Alice (Stylist)',
            role: Role.STYLIST,
            pin: '1234',
        },
    })

    const assistant = await prisma.user.upsert({
        where: { id: 'assistant-1' },
        update: {},
        create: {
            id: 'assistant-1',
            name: 'Bob (Assistant)',
            role: Role.ASSISTANT,
            pin: '5678',
        },
    })

    // 2. Create Services
    const services = [
        { name: 'Women Haircut', category: ServiceCategory.HAIR, price: 50.00 },
        { name: 'Men Haircut', category: ServiceCategory.HAIR, price: 30.00 },
        { name: 'Gel Manicure', category: ServiceCategory.NAIL, price: 40.00 },
        { name: 'Lash Extension', category: ServiceCategory.LASH, price: 80.00 },
    ]

    for (const s of services) {
        await prisma.service.create({
            data: {
                name: s.name,
                category: s.category,
                price: s.price,
            }
        })
    }

    console.log('Seed data created.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
