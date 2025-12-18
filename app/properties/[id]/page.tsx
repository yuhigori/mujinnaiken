'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ViewingSlot {
    id: number;
    start_time: string;
    end_time: string;
    capacity: number;
    reserved_count: number;
}

interface Property {
    id: number;
    name: string;
    address: string;
    description: string | null;
    image_url: string | null;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
    const [property, setProperty] = useState<Property | null>(null);
    const [slots, setSlots] = useState<ViewingSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [showSlots, setShowSlots] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [checkingSlots, setCheckingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const [propertyId, setPropertyId] = useState<string>('');

    useEffect(() => {
        params.then(p => setPropertyId(p.id));
    }, [params]);

    useEffect(() => {
        if (!propertyId) return;

        // Initial fetch for property details
        fetch(`/api/properties/${propertyId}`)
            .then(res => res.json())
            .then(data => {
                setProperty(data.property);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [propertyId]);

    useEffect(() => {
        if (!selectedDate) {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);
        }
    }, [selectedDate]);

    const handleCheckAvailability = async () => {
        if (!selectedDate || !propertyId) return;

        setCheckingSlots(true);
        setShowSlots(true);
        setSelectedSlotId(null);

        try {
            const res = await fetch(`/api/properties/${propertyId}?date=${selectedDate}`);
            const data = await res.json();
            setSlots(data.slots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
            alert('空き状況の取得に失敗しました');
        } finally {
            setCheckingSlots(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlotId) {
            alert('内見枠を選択してください');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slot_id: selectedSlotId,
                    ...formData
                })
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/reservations/${data.reservation.id}/complete?token=${data.reservation.token}`);
            } else {
                alert(data.error || '予約に失敗しました');
                setSubmitting(false);
            }
        } catch (error) {
            alert('予約に失敗しました');
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
    }

    if (!property) {
        return <div className="min-h-screen flex items-center justify-center">物件が見つかりませんでした</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold mb-4 text-gray-900">{property.name}</h1>
                <p className="text-gray-600 mb-6">{property.address}</p>
                {property.description && (
                    <p className="text-gray-700 mb-8">{property.description}</p>
                )}

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">内見予約</h2>

                    {/* Date Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-gray-700">日付を選択</label>
                        <div className="flex gap-4">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setShowSlots(false);
                                }}
                                className="flex-1 p-2 border rounded-md"
                            />
                            <button
                                onClick={handleCheckAvailability}
                                disabled={checkingSlots}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
                            >
                                {checkingSlots ? '確認中...' : '空き状況を確認'}
                            </button>
                        </div>
                    </div>

                    {/* Time Slots */}
                    {showSlots && (
                        <div className="mb-8 animate-fade-in">
                            <h3 className="text-lg font-medium mb-3 text-gray-900">
                                {new Date(selectedDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })} の空き枠
                            </h3>

                            {checkingSlots ? (
                                <div className="text-center py-8 text-gray-500">読み込み中...</div>
                            ) : slots.length === 0 ? (
                                <div className="p-4 bg-gray-100 rounded-md text-center text-gray-600">
                                    この日の内見枠はありません。別の日付を選択してください。
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {slots.map(slot => {
                                        const available = slot.capacity > slot.reserved_count;
                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => setSelectedSlotId(slot.id)}
                                                disabled={!available}
                                                className={`p-3 border rounded-md text-center transition ${selectedSlotId === slot.id
                                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                    : available
                                                        ? 'border-gray-300 hover:border-blue-300 bg-white hover:bg-gray-50'
                                                        : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                                                    }`}
                                            >
                                                <div className="font-bold text-gray-900">
                                                    {new Date(slot.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {available ? '○ 予約可' : '× 満員'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reservation Form */}
                    {selectedSlotId && (
                        <form onSubmit={handleSubmit} className="border-t pt-6 mt-6 animate-fade-in">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">予約者情報</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">お名前 *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="山田 太郎"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">電話番号 *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="090-1234-5678"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1 text-gray-700">メールアドレス *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="taro@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-green-600 text-white py-4 rounded-md font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-sm"
                            >
                                {submitting ? '予約処理中...' : 'この内容で予約を確定する'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
