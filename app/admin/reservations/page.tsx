import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export default async function AdminReservationsPage() {
    const reservations = await prisma.reservation.findMany({
        include: {
            property: true,
            slot: true
        },
        orderBy: { created_at: 'desc' },
        take: 100
    });

    return (
        <div className="min-h-screen py-10 px-4">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">予約管理</h1>
                        <p className="text-muted-foreground mt-1">最新の予約状況（100件）</p>
                    </div>
                    <Link
                        href="/admin/dashboard"
                        className="bg-white/90 border border-border px-4 py-2 rounded-xl text-foreground hover:bg-white hover:shadow-sm transition-all text-sm font-medium"
                    >
                        ← ダッシュボードに戻る
                    </Link>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/80">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">物件</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">予約者</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">連絡先</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">内見日時</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">キーコード</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">鍵返却</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-white/30">
                                {reservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-white/90 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground" title={String(reservation.id)}>
                                            {reservation.id}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-foreground font-medium">{reservation.property?.name}</td>
                                        <td className="px-4 py-4 text-sm text-foreground">{reservation.name}</td>
                                        <td className="px-4 py-4 text-sm text-muted-foreground">
                                            <div>{reservation.email}</div>
                                            <div className="text-xs">{reservation.phone}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                                            {reservation.slot && new Date(reservation.slot.start_time).toLocaleString('ja-JP', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {reservation.key_code ? (
                                                <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{reservation.key_code}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">未発行</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {reservation.key_returned_at ? (
                                                <span className="text-green-600 bg-green-100 p-1 rounded-full inline-block">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {reservations.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground glass-panel mt-6 rounded-2xl">
                        予約がありません
                    </div>
                )}
            </div>
        </div>
    );
}
