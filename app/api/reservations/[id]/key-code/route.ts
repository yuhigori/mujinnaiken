import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canAccessKeyCode, generateKeyCode } from '@/lib/keyCode';
import { sendKeyCodeIssued } from '@/lib/email';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 401 });
        }

        const reservation = await prisma.reservation.findFirst({
            where: {
                id: parseInt(id),
                token: token
            },
            include: {
                slot: true,
                property: true
            }
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
        }

        if (!reservation.slot) {
            return NextResponse.json({ error: 'Viewing slot not found' }, { status: 404 });
        }

        // Check if current time is within access window
        if (!canAccessKeyCode(reservation.slot.start_time, reservation.slot.end_time)) {
            return NextResponse.json({
                error: 'Key code is not available yet',
                message: `キーコードは内見開始の${process.env.KEY_BEFORE_MIN || '30'}分前から内見終了の${process.env.KEY_AFTER_MIN || '30'}分後まで表示可能です`
            }, { status: 403 });
        }

        // If key code is not issued yet, issue it now (On-demand issuance)
        if (!reservation.key_code) {
            const keyCode = generateKeyCode();

            const updatedReservation = await prisma.reservation.update({
                where: { id: reservation.id },
                data: {
                    key_code: keyCode,
                    key_code_issued_at: new Date()
                },
                include: {
                    property: true,
                    slot: true
                }
            });

            // Send notification (mock)
            sendKeyCodeIssued(updatedReservation);

            return NextResponse.json({
                key_code: updatedReservation.key_code,
                issued_at: updatedReservation.key_code_issued_at
            });
        }

        return NextResponse.json({
            key_code: reservation.key_code,
            issued_at: reservation.key_code_issued_at
        });

    } catch (error) {
        console.error('Error fetching key code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
