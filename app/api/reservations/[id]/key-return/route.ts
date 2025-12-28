import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 401 });
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

        if (reservation.key_returned_at) {
            return NextResponse.json({
                error: 'Key already returned',
                message: '鍵は既に返却済みです'
            }, { status: 400 });
        }

        // Update key_returned_at
        const updatedReservation = await prisma.reservation.update({
            where: { id: parseInt(id) },
            data: {
                key_returned_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            key_returned_at: updatedReservation.key_returned_at
        });

    } catch (error) {
        console.error('Error recording key return:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
