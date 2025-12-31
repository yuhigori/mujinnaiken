import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const dateParam = request.nextUrl.searchParams.get('date');

        const propertyId = parseInt(id);
        if (isNaN(propertyId)) {
            return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
        }

        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        let slots = [];

        if (dateParam) {
            // Fetch slots for specific date
            const targetDate = new Date(dateParam);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            slots = await prisma.viewingSlot.findMany({
                where: {
                    property_id: propertyId,
                    start_time: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                orderBy: {
                    start_time: 'asc'
                }
            });

            // If no slots exist for this date, generate them on the fly
            if (slots.length === 0) {
                const newSlots = [];
                // 10:00 to 18:00
                for (let hour = 10; hour < 18; hour++) {
                    const startTime = new Date(startOfDay);
                    startTime.setHours(hour, 0, 0, 0);

                    const endTime = new Date(startOfDay);
                    endTime.setHours(hour + 1, 0, 0, 0);

                    // Skip past times if date is today
                    // if (startTime < new Date()) continue; // Disabled for TEST MODE

                    newSlots.push({
                        property_id: propertyId,
                        start_time: startTime,
                        end_time: endTime,
                        capacity: 1,
                        reserved_count: 0
                    });
                }

                if (newSlots.length > 0) {
                    // Use transaction to create slots and return them
                    await prisma.$transaction(
                        newSlots.map(slot => prisma.viewingSlot.create({ data: slot }))
                    );

                    // Re-fetch to get IDs
                    slots = await prisma.viewingSlot.findMany({
                        where: {
                            property_id: propertyId,
                            start_time: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        },
                        orderBy: {
                            start_time: 'asc'
                        }
                    });
                }
            }
        } else {
            // Default behavior: fetch future slots (existing logic)
            const now = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            slots = await prisma.viewingSlot.findMany({
                where: {
                    property_id: propertyId,
                    start_time: {
                        gte: now,
                        lte: endDate
                    }
                },
                orderBy: {
                    start_time: 'asc'
                }
            });
        }

        return NextResponse.json({ property, slots });

    } catch (error) {
        console.error('Error fetching property:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
