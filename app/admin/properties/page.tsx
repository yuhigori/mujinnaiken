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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">物件管理</h1>
                    <Link
                        href="/admin/dashboard"
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                    >
                        ダッシュボードに戻る
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">物件名</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">住所</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">内見枠数</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">予約数</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {properties.map((property) => (
                                <tr key={property.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{property.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{property.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{property.address}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{property._count.viewing_slots}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{property._count.reservations}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {properties.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                        登録されている物件はありません
                    </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                        ※ 物件のCRUD機能はMVPのため簡易実装です。直接データベースから操作するか、APIを利用してください。
                    </p>
                </div>
            </div>
        </div>
    );
}
