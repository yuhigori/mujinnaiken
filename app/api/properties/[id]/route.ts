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

        // Prismaが利用可能かチェック
        if (!isPrismaAvailable() || !prisma) {
            // データベースが利用できない場合でも、最低限の物件情報を返す
            // これにより、予約ページは表示できる
            return NextResponse.json({ 
                property: {
                    id: propertyId,
                    name: `物件 #${propertyId}`,
                    address: '住所情報を取得できませんでした',
                    description: null,
                    image_url: null
                },
                slots: []
            });
        }

        let property;
        try {
            property = await prisma.property.findUnique({
                where: { id: propertyId }
            });
        } catch (dbError) {
            console.error('Database query error:', dbError);
            // データベースエラーでも最低限の情報を返す
            return NextResponse.json({ 
                property: {
                    id: propertyId,
                    name: `物件 #${propertyId}`,
                    address: '住所情報を取得できませんでした',
                    description: null,
                    image_url: null
                },
                slots: []
            });
        }

        if (!property) {
            // 物件が見つからない場合でも、IDから最低限の情報を返す
            return NextResponse.json({ 
                property: {
                    id: propertyId,
                    name: `物件 #${propertyId}`,
                    address: '住所情報を取得できませんでした',
                    description: null,
                    image_url: null
                },
                slots: []
            });
        }

        let slots: any[] = [];

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
            // テスト用: 過去・未来すべてのスロットを取得
            slots = await prisma.viewingSlot.findMany({
                where: {
                    property_id: propertyId
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
