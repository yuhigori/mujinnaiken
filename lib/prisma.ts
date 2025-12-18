import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
        db: {
            url: 'file:/Users/fumoriyuuhi/.gemini/antigravity/scratch/viewing-reservation/prisma/dev.db',
        },
    },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
