import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export default async function AdminPropertiesPage() {
    const properties = await prisma.property.findMany({
        include: {
            _count: {
                select: {
                    reservations: true,
                    viewing_slots: true
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });

    return (
        <div className="min-h-screen py-10 px-4">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">物件管理</h1>
                        <p className="text-muted-foreground mt-1">管理物件の状況確認</p>
                    </div>
                    <Link
                        href="/admin/dashboard"
                        className="bg-white/50 border border-border px-4 py-2 rounded-xl text-foreground hover:bg-white hover:shadow-sm transition-all text-sm font-medium"
                    >
                        ← ダッシュボードに戻る
                    </Link>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">物件名</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">住所</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">内見枠数</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">予約数</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-white/30">
                                {properties.map((property) => (
                                    <tr key={property.id} className="hover:bg-white/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">{property.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-foreground">{property.name}</td>
                                        <td className="px-6 py-4 text-sm text-foreground">{property.address}</td>
                                        <td className="px-6 py-4 text-sm text-foreground">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {property._count.viewing_slots}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {property._count.reservations}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {properties.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground glass-panel mt-6 rounded-2xl">
                        登録されている物件はありません
                    </div>
                )}

                <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        物件のCRUD機能はMVPのため簡易実装です。直接データベースから操作するか、APIを利用してください。
                    </p>
                </div>
            </div>
        </div>
    );
}
