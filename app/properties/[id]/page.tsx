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
    const [staffRequired, setStaffRequired] = useState<boolean>(false);
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
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('API response:', data);
                if (data.property) {
                    setProperty(data.property);
                } else {
                    console.error('Property not found in response:', data);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching property:', error);
                setLoading(false);
            });
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
        setStaffRequired(false);

        try {
            const res = await fetch(`/api/properties/${propertyId}?date=${selectedDate}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
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
                    staff_required: staffRequired,
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-4 bg-primary rounded-full animate-bounce mb-2"></div>
                    <span className="text-muted-foreground font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="glass-panel p-8 rounded-2xl text-center">
                    <h2 className="text-xl font-bold text-foreground mb-2">Property Not Found</h2>
                    <p className="text-muted-foreground">お探しの物件は見つかりませんでした。</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 md:px-8">
            <div className="container mx-auto max-w-5xl">
                {/* Header Section */}
                <div className="glass-panel rounded-3xl p-8 mb-8 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{property.name}</h1>
                    <div className="flex items-center text-muted-foreground mb-6">
                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-lg">{property.address}</span>
                    </div>
                    {property.description && (
                        <p className="text-foreground/80 leading-relaxed border-t border-dashed border-border pt-6">
                            {property.description}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Panel */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-panel rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
                                <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                内見予約
                            </h2>

                            {/* Date Selector */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">日付を選択</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setShowSlots(false);
                                            }}
                                            className="w-full p-4 pl-12 bg-white/90 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-lg"
                                        />
                                        <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <button
                                        onClick={handleCheckAvailability}
                                        disabled={checkingSlots}
                                        className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none whitespace-nowrap active:scale-95"
                                    >
                                        {checkingSlots ? '確認中...' : '空き状況を確認'}
                                    </button>
                                </div>
                            </div>

                            {/* Staff Required Checkbox */}
                            {showSlots && (
                                <div className="mb-6 animate-fade-in">
                                    <label className="flex items-center space-x-3 p-4 bg-white/90 border border-border rounded-xl cursor-pointer hover:bg-white transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={staffRequired}
                                            onChange={(e) => setStaffRequired(e.target.checked)}
                                            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <span className="font-semibold text-foreground block">スタッフの同行が必要</span>
                                            <span className="text-sm text-muted-foreground">内見時にスタッフが同行する場合はチェックしてください</span>
                                        </div>
                                        <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </label>
                                </div>
                            )}

                            {/* Time Slots */}
                            {showSlots && (
                                <div className="mb-8 animate-fade-in">
                                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">
                                        {new Date(selectedDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                                        <span className="text-muted-foreground font-normal ml-2">の空き状況</span>
                                    </h3>

                                    {checkingSlots ? (
                                        <div className="text-center py-12 text-muted-foreground animate-pulse">読み込み中...</div>
                                    ) : slots.length === 0 ? (
                                        <div className="p-6 bg-muted/80 border border-dashed border-muted-foreground/30 rounded-xl text-center text-muted-foreground">
                                            この日の内見枠はありません。<br />別の日付を選択してください。
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {slots.map(slot => {
                                                const available = slot.capacity > slot.reserved_count;
                                                const isSelected = selectedSlotId === slot.id;
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => setSelectedSlotId(slot.id)}
                                                        disabled={!available}
                                                        className={`
                                                            group relative p-4 rounded-xl text-center transition-all duration-200
                                                            ${isSelected
                                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 scale-105 z-10'
                                                                : available
                                                                    ? 'bg-white border border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
                                                                    : 'bg-muted/80 border border-transparent opacity-50 cursor-not-allowed grayscale'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                                            {new Date(slot.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className={`text-xs font-medium ${isSelected ? 'text-white/80' : available ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            {available ? '○ 予約可' : '× 満員'}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Panel (Sticky on Desktop) */}
                    <div className="lg:col-span-1">
                        {selectedSlotId ? (
                            <div className="glass-panel p-6 rounded-3xl sticky top-8 animate-fade-in border-t-4 border-primary shadow-2xl">
                                <h3 className="text-xl font-bold mb-6 text-foreground flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-3">✓</span>
                                    予約者情報
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">お名前</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 bg-white/90 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="山田 太郎"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">電話番号</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full p-3 bg-white/90 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="090-1234-5678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">メールアドレス</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full p-3 bg-white/90 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="taro@example.com"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-gradient-to-r from-primary via-orange-400 to-pink-400 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5 active:scale-95"
                                        >
                                            {submitting ? '処理に...' : '予約を確定する'}
                                        </button>
                                        <p className="text-xs text-center text-muted-foreground mt-3">
                                            ボタンを押すと予約が完了します
                                        </p>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="hidden lg:flex h-full items-center justify-center p-8 border-2 border-dashed border-border rounded-3xl opacity-50">
                                <p className="text-muted-foreground text-center">
                                    左側のカレンダーから<br />日時を選択してください
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
