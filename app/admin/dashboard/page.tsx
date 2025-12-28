import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export default async function AdminDashboardPage() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today's reservations
    const todayReservations = await prisma.reservation.findMany({
        where: {
            slot: {
                start_time: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        },
        include: {
            property: true,
            slot: true
        }
    });

    // Un-returned keys
    const unreturnedKeys = await prisma.reservation.findMany({
        where: {
            key_code: { not: null },
            key_returned_at: null,
            slot: {
                end_time: { lt: now }
            }
        },
        include: {
            property: true,
            slot: true
        }
    });

    // Total stats
    const totalProperties = await prisma.property.count();
    const totalReservations = await prisma.reservation.count();

    return (
        <div className="min-h-screen py-10 px-4">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">管理ダッシュボード</h1>
                        <p className="text-muted-foreground mt-1">システムの状況を一目で確認できます</p>
                    </div>
                    <div className="mt-4 md:mt-0 px-4 py-2 bg-white/50 rounded-full border border-border text-sm font-medium text-muted-foreground">
                        {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                        </div>
                        <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">本日の予約</div>
                        <div className="text-4xl font-bold text-primary">{todayReservations.length}</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-red-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">未返却キー</div>
                        <div className="text-4xl font-bold text-red-600">{unreturnedKeys.length}</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-16 h-16 text-foreground" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                        </div>
                        <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">物件数</div>
                        <div className="text-4xl font-bold text-foreground">{totalProperties}</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-16 h-16 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">総予約数</div>
                        <div className="text-4xl font-bold text-foreground">{totalReservations}</div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <Link
                        href="/admin/properties"
                        className="glass-panel p-6 rounded-2xl group hover:border-primary/50 transition-colors duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">物件管理</h2>
                                <p className="text-muted-foreground text-sm">物件の追加・編集・削除</p>
                            </div>
                            <div className="ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                    </Link>
                    <Link
                        href="/admin/reservations"
                        className="glass-panel p-6 rounded-2xl group hover:border-primary/50 transition-colors duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">予約管理</h2>
                                <p className="text-muted-foreground text-sm">予約一覧・詳細確認</p>
                            </div>
                            <div className="ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                    </Link>
                </div>

                {/* Today's Reservations */}
                <div className="glass-panel rounded-2xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-white/40">
                        <h2 className="text-xl font-bold text-foreground">本日の予約</h2>
                        {todayReservations.length === 0 && <span className="text-sm text-muted-foreground">予約はありません</span>}
                    </div>
                    {todayReservations.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">時間</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">物件</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">予約者</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">ステータス</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-white/30">
                                    {todayReservations.map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-white/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                {new Date(reservation.slot!.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{reservation.property?.name}</td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                <div className="font-medium">{reservation.name}</div>
                                                <div className="text-xs text-muted-foreground">{reservation.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {reservation.key_returned_at ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        返却済
                                                    </span>
                                                ) : reservation.key_code ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        キー発行済
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        予約済
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Un-returned Keys Alert */}
                {unreturnedKeys.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-pulse border-l-4 border-l-red-500 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full text-red-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-red-900">未返却キー（要確認）</h2>
                        </div>
                        <div className="space-y-3">
                            {unreturnedKeys.map((reservation) => (
                                <div key={reservation.id} className="text-sm bg-white/60 p-3 rounded-lg border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between text-red-800">
                                    <div className="font-medium">
                                        {reservation.property?.name} <span className="mx-2 text-red-400">|</span> {reservation.name}
                                    </div>
                                    <div className="text-red-600 font-mono mt-1 sm:mt-0">
                                        終了: {new Date(reservation.slot!.end_time).toLocaleString('ja-JP')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
