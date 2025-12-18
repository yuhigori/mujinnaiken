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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">管理ダッシュボード</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm mb-1">本日の予約</div>
                        <div className="text-3xl font-bold text-blue-600">{todayReservations.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm mb-1">未返却キー</div>
                        <div className="text-3xl font-bold text-red-600">{unreturnedKeys.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm mb-1">物件数</div>
                        <div className="text-3xl font-bold text-gray-900">{totalProperties}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-600 text-sm mb-1">総予約数</div>
                        <div className="text-3xl font-bold text-gray-900">{totalReservations}</div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link
                        href="/admin/properties"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                    >
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">物件管理</h2>
                        <p className="text-gray-600">物件の追加・編集・削除</p>
                    </Link>
                    <Link
                        href="/admin/reservations"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                    >
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">予約管理</h2>
                        <p className="text-gray-600">予約一覧・詳細確認</p>
                    </Link>
                </div>

                {/* Today's Reservations */}
                {todayReservations.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-900">本日の予約</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">物件</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">予約者</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {todayReservations.map((reservation) => (
                                        <tr key={reservation.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(reservation.slot!.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{reservation.property?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{reservation.name}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {reservation.key_returned_at ? (
                                                    <span className="text-green-600">返却済</span>
                                                ) : reservation.key_code ? (
                                                    <span className="text-blue-600">キー発行済</span>
                                                ) : (
                                                    <span className="text-gray-600">予約済</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Un-returned Keys Alert */}
                {unreturnedKeys.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-900 mb-4">未返却キー（要確認）</h2>
                        <div className="space-y-2">
                            {unreturnedKeys.map((reservation) => (
                                <div key={reservation.id} className="text-sm text-red-800">
                                    {reservation.property?.name} - {reservation.name} ({reservation.phone})
                                    - 終了: {new Date(reservation.slot!.end_time).toLocaleString('ja-JP')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
