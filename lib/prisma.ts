import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient | null {
    try {
        return new PrismaClient({
            datasources: {
                db: {
                    // Vercel 本番では DATABASE_URL を設定するのが推奨。
                    // 未設定時は同梱の sqlite ファイルにフォールバックする。
                    url: process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'prisma/dev.db')}`,
                },
            },
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    } catch (error) {
        // ここで throw すると import 時点で全ページが落ちるため、null で継続する
        console.error('Failed to create Prisma client:', error);
        return null;
    }
}

const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

// prismaClient が null の場合でも、各ページ側の try/catch でフォールバックできるようにする
// ただし、実際に使用する前に null チェックが必要
export const prisma = prismaClient as unknown as PrismaClient;

// prismaが利用可能かどうかをチェックするヘルパー関数
export function isPrismaAvailable(): boolean {
    return prismaClient !== null && typeof prismaClient !== 'undefined';
}

if (process.env.NODE_ENV !== 'production' && prismaClient) globalForPrisma.prisma = prismaClient;
