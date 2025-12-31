import { NextRequest, NextResponse } from 'next/server';
import { prisma, isPrismaAvailable } from '@/lib/prisma';

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

        // 物件情報を取得（Prismaが利用できない場合でもフォールバック）
        let property;
        if (isPrismaAvailable() && prisma) {
            try {
                property = await prisma.property.findUnique({
                    where: { id: propertyId }
                });
            } catch (dbError) {
                console.error('Database query error:', dbError);
            }
        }

        // 物件が見つからない場合、フォールバック情報を使用
        if (!property) {
            property = {
                id: propertyId,
                name: `物件 #${propertyId}`,
                address: '住所情報を取得できませんでした',
                description: null,
                image_url: null
            };
        }

        let slots: any[] = [];

        if (isPrismaAvailable() && prisma) {
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

                        newSlots.push({
                            property_id: propertyId,
                            start_time: startTime,
                            end_time: endTime,
                            capacity: 1,
                            reserved_count: 0
                        });
                    }

                    if (newSlots.length > 0) {
                        await prisma.$transaction(
                            newSlots.map(slot => prisma.viewingSlot.create({ data: slot }))
                        );

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
                // Default behavior: fetch future slots
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
        } else {
            // Prismaが使えない場合は日付分のスロットをフォールバック生成
            const targetDate = dateParam ? new Date(dateParam) : new Date();
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);

            for (let hour = 10; hour < 18; hour++) {
                const startTime = new Date(startOfDay);
                startTime.setHours(hour, 0, 0, 0);
                const endTime = new Date(startOfDay);
                endTime.setHours(hour + 1, 0, 0, 0);
                const tempId = propertyId * 1000000 + hour * 1000 + Math.floor(startTime.getTime() / 1000) % 1000;
                slots.push({
                    id: tempId,
                    property_id: propertyId,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    capacity: 1,
                    reserved_count: 0
                });
            }
        }

        return NextResponse.json({ property, slots });

    } catch (error) {
        console.error('Error fetching property:', error);
        // エラー時でもフォールバックスロットを生成して返す
        const { id } = await params;
        const errorPropertyId = parseInt(id) || 1;
        const fallbackSlots: any[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let hour = 10; hour < 18; hour++) {
            const startTime = new Date(today);
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(today);
            endTime.setHours(hour + 1, 0, 0, 0);
            const tempId = errorPropertyId * 1000000 + hour * 1000 + Math.floor(startTime.getTime() / 1000) % 1000;
            fallbackSlots.push({
                id: tempId,
                property_id: errorPropertyId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                capacity: 1,
                reserved_count: 0
            });
        }
        return NextResponse.json({ 
            property: { id: errorPropertyId, name: `物件 #${id}`, address: '', description: null, image_url: null },
            slots: fallbackSlots 
        });
    }
}
