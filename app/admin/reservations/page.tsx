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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">予約管理</h1>
                    <Link
                        href="/admin/dashboard"
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                    >
                        ダッシュボードに戻る
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">物件</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">予約者</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">連絡先</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">内見日時</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">キーコード</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">鍵返却</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.id}</td>
                                        <td className="px-4 py-4 text-sm text-gray-900">{reservation.property?.name}</td>
                                        <td className="px-4 py-4 text-sm text-gray-900">{reservation.name}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            <div>{reservation.email}</div>
                                            <div className="text-xs">{reservation.phone}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {reservation.slot && new Date(reservation.slot.start_time).toLocaleString('ja-JP', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {reservation.key_code ? (
                                                <span className="font-mono font-bold text-green-600">{reservation.key_code}</span>
                                            ) : (
                                                <span className="text-gray-400">未発行</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {reservation.key_returned_at ? (
                                                <span className="text-green-600">✓</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {reservations.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                        予約がありません
                    </div>
                )}

                <div className="mt-4 text-sm text-gray-600">
                    ※ 最新100件を表示しています
                </div>
            </div>
        </div>
    );
}
