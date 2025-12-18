import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.reservation.deleteMany();
    await prisma.viewingSlot.deleteMany();
    await prisma.keyBox.deleteMany();
    await prisma.property.deleteMany();

    // Create a property
    const property = await prisma.property.create({
        data: {
            name: 'サンプルマンション A棟 203号室',
            address: '東京都渋谷区神南1-1-1',
            description: '駅から徒歩5分、南向きで日当たり良好な1LDKです。オートロック完備。',
            image_url: 'https://placehold.co/600x400?text=Property+Image',
        }
    });

    console.log(`Created property: ${property.name}`);

    // Create a key box
    await prisma.keyBox.create({
        data: {
            property_id: property.id,
            location: 'ドアノブ',
            passcode: '0000' // This is the physical box code, not the dynamic key code
        }
    });

    // Create viewing slots for the next 30 days
    const slots = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // 10:00 to 18:00, every hour
        for (let hour = 10; hour < 18; hour++) {
            const startTime = new Date(date);
            startTime.setHours(hour, 0, 0, 0);

            const endTime = new Date(date);
            endTime.setHours(hour + 1, 0, 0, 0);

            slots.push({
                property_id: property.id,
                start_time: startTime,
                end_time: endTime,
                capacity: 1,
                reserved_count: 0
            });
        }
    }

    for (const slot of slots) {
        await prisma.viewingSlot.create({ data: slot });
    }

    console.log(`Created ${slots.length} viewing slots`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
