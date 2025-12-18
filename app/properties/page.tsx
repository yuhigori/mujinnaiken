import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export default async function PropertiesPage() {
    const properties = await prisma.property.findMany({
        orderBy: { created_at: 'desc' }
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">物件一覧</h1>

                {properties.length === 0 ? (
                    <p className="text-gray-600">現在、公開中の物件はありません。</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <Link
                                key={property.id}
                                href={`/properties/${property.id}`}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {property.image_url && (
                                    <img
                                        src={property.image_url}
                                        alt={property.name}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold mb-2 text-gray-900">{property.name}</h2>
                                    <p className="text-gray-600 text-sm mb-2">{property.address}</p>
                                    {property.description && (
                                        <p className="text-gray-700 text-sm line-clamp-2">{property.description}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
