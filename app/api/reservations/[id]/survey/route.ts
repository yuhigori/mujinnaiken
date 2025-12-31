import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { token, survey } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 401 });
        }

        if (!survey) {
            return NextResponse.json({ error: 'Survey data is required' }, { status: 400 });
        }

        const reservation = await prisma.reservation.findFirst({
            where: {
                id: parseInt(id),
                token: token
            }
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
        }

        // Update survey
        const updatedReservation = await prisma.reservation.update({
            where: { id: parseInt(id) },
            data: {
                survey: typeof survey === 'string' ? survey : JSON.stringify(survey)
            }
        });

        return NextResponse.json({
            success: true,
            survey: updatedReservation.survey
        });

    } catch (error) {
        console.error('Error saving survey:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
