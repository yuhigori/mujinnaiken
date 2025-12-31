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

            // 過去の日付は除外
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startOfDay < today) {
                return NextResponse.json({ property, slots: [] });
            }

            if (isPrismaAvailable() && prisma) {
                try {
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
                        const now = new Date();
                        // 10:00 to 18:00
                        for (let hour = 10; hour < 18; hour++) {
                            const startTime = new Date(startOfDay);
                            startTime.setHours(hour, 0, 0, 0);

                            const endTime = new Date(startOfDay);
                            endTime.setHours(hour + 1, 0, 0, 0);

                            // 今日の場合は過去の時間をスキップ
                            if (startOfDay.getTime() === today.getTime() && startTime < now) {
                                continue;
                            }

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
                } catch (dbError) {
                    console.error('Database error when fetching slots:', dbError);
                    // データベースエラー時はフォールバックスロットを生成
                }
            }

            // Prismaが利用できない場合やスロットが生成されなかった場合、フォールバックスロットを返す
            if (slots.length === 0) {
                const now = new Date();
                // 10:00 to 18:00 のスロットを生成（IDは仮の値）
                for (let hour = 10; hour < 18; hour++) {
                    const startTime = new Date(startOfDay);
                    startTime.setHours(hour, 0, 0, 0);

                    const endTime = new Date(startOfDay);
                    endTime.setHours(hour + 1, 0, 0, 0);

                    // 今日の場合は過去の時間をスキップ
                    if (startOfDay.getTime() === today.getTime() && startTime < now) {
                        continue;
                    }

                    // 一時的なIDを数値として生成（propertyId + hour * 1000 + 日付のタイムスタンプ）
                    const tempId = propertyId * 1000000 + hour * 1000 + Math.floor(startTime.getTime() / 1000) % 1000;
                    slots.push({
                        id: tempId, // 数値IDとして生成
                        property_id: propertyId,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        capacity: 1,
                        reserved_count: 0
                    });
                }
            }
        } else {
            // 日付パラメータがない場合、未来のスロットのみを取得
            if (isPrismaAvailable() && prisma) {
                try {
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
                } catch (dbError) {
                    console.error('Database error when fetching future slots:', dbError);
                }
            }
        }

        return NextResponse.json({ property, slots });

    } catch (error) {
        console.error('Error fetching property:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
