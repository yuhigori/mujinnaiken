import Link from 'next/link';
import { prisma, isPrismaAvailable } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export default async function PropertiesPage() {
    let properties: any[] = [];
    
    try {
        // prismaが利用可能かチェック
        if (isPrismaAvailable() && prisma) {
            properties = await prisma.property.findMany({
                orderBy: { created_at: 'desc' }
            });
        } else {
            console.warn('Prisma client is not available - showing empty list');
        }
    } catch (error: any) {
        console.error('Error fetching properties:', error);
        // エラーが発生しても空配列で続行
        properties = [];
    }

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col items-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-cyan-500">
                        Select a Property
                    </h1>
                    <p className="text-muted-foreground text-lg text-center max-w-2xl">
                        24時間、あなたのペースで。無人内見予約システム
                    </p>
                </div>

                {properties.length === 0 ? (
                    <div className="glass-panel text-center py-20 rounded-3xl">
                        <p className="text-xl text-muted-foreground">現在、公開中の物件はありません。</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property) => (
                            <Link
                                key={property.id}
                                href={`/properties/${property.id}`}
                                className="group relative block h-full"
                            >
                                <div className="glass-panel h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ring-1 ring-white/20">
                                    <div className="relative h-64 overflow-hidden">
                                        {property.image_url ? (
                                            <img
                                                src={property.image_url}
                                                alt={property.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const fallback = target.nextElementSibling as HTMLElement;
                                                    if (fallback) {
                                                        fallback.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-300"
                                            style={{ display: property.image_url ? 'none' : 'flex' }}
                                        >
                                            No Image
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                            {property.name}
                                        </h2>
                                        <div className="flex items-start gap-2 mb-4 text-sm text-muted-foreground">
                                            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="line-clamp-2">{property.address}</span>
                                        </div>
                                        {property.description && (
                                            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed border-t border-dashed border-orange-100 pt-4 mt-4">
                                                {property.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
