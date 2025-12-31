import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { generateKeyCode } from '../lib/keyCode';
import { sendKeyCodeIssued } from '../lib/email';

const adapter = new PrismaLibSQL({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
});

const prisma = new PrismaClient({ adapter });

async function issueKeyCodes() {
    console.log('Starting key code issuance job...');

    const beforeMin = parseInt(process.env.KEY_BEFORE_MIN || '30');
    const now = new Date();
    const targetTime = new Date(now.getTime() + beforeMin * 60 * 1000);

    try {
        // Find reservations where:
        // - start_time is within KEY_BEFORE_MIN minutes from now
        // - key_code is not yet issued
        // - status is confirmed
        const reservationsToIssue = await prisma.reservation.findMany({
            where: {
                key_code: null,
                status: 'confirmed',
                slot: {
                    start_time: {
                        lte: targetTime,
                        gte: now
                    }
                }
            },
            include: {
                slot: true,
                property: true
            }
        });

        console.log(`Found ${reservationsToIssue.length} reservations requiring key code issuance`);

        for (const reservation of reservationsToIssue) {
            const keyCode = generateKeyCode();

            await prisma.reservation.update({
                where: { id: reservation.id },
                data: {
                    key_code: keyCode,
                    key_code_issued_at: now
                }
            });

            // Send notification (console.log for MVP)
            sendKeyCodeIssued(reservation.email, reservation, keyCode);

            console.log(`Issued key code ${keyCode} for reservation #${reservation.id} (${reservation.name})`);
        }

        console.log('Key code issuance job completed successfully!');
    } catch (error) {
        console.error('Error issuing key codes:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

issueKeyCodes();
