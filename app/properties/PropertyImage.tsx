'use client';

interface PropertyImageProps {
    imageUrl: string | null;
    alt: string;
}

export default function PropertyImage({ imageUrl, alt }: PropertyImageProps) {
    return (
        <div className="relative h-64 overflow-hidden">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={alt}
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
                style={{ display: imageUrl ? 'none' : 'flex' }}
            >
                No Image
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    );
}
