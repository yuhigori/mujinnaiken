import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { sendReservationConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slot_id, name, email, phone, staff_required } = body;

        if (!slot_id || !name || !email || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get viewing slot and check availability
        const slot = await prisma.viewingSlot.findUnique({
            where: { id: parseInt(slot_id) },
            include: { property: true }
        });

        if (!slot) {
            return NextResponse.json({ error: 'Viewing slot not found' }, { status: 404 });
        }

        // TEST MODE: allow reservations even when capacity is reached.
        // if (slot.reserved_count >= slot.capacity) {
        //     return NextResponse.json({ error: 'Viewing slot is full' }, { status: 400 });
        // }

        // Create reservation with token
        const token = generateToken();

        const reservation = await prisma.$transaction(async (tx) => {
            // Create reservation
            const newReservation = await tx.reservation.create({
                data: {
                    property_id: slot.property_id,
                    slot_id: slot.id,
                    name,
                    email,
                    phone,
                    token,
                    status: 'confirmed',
                    staff_required: staff_required === true || staff_required === 'true'
                },
                include: {
                    property: true,
                    slot: true
                }
            });

            // Increment reserved_count
            await tx.viewingSlot.update({
                where: { id: slot.id },
                data: {
                    reserved_count: {
                        increment: 1
                    }
                }
            });

            return newReservation;
        });

        // Send confirmation email (console.log for MVP)
        sendReservationConfirmation(email, reservation);

        return NextResponse.json({
            success: true,
            reservation: {
                id: reservation.id,
                token: reservation.token
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating reservation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
