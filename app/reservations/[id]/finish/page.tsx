'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function FinishPage({ params }: PageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reservationId, setReservationId] = useState<string>('');

    useEffect(() => {
        params.then(p => setReservationId(p.id));
    }, [params]);

    useEffect(() => {
        if (!reservationId) return;

        const token = searchParams.get('token');
        if (!token) {
            alert('アクセストークンが必要です');
            return;
        }

        fetch(`/api/reservations/${reservationId}?token=${token}`)
            .then(res => res.json())
            .then(data => {
                setReservation(data.reservation);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [reservationId, searchParams]);

    const handleSubmit = async () => {
        const token = searchParams.get('token');
        if (!token) return;

        setSubmitting(true);

        try {
            const res = await fetch(`/api/reservations/${reservationId}/key-return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();

            if (res.ok) {
                // Custom alert style could be implemented, but simple alert is preserved as per "no logic change"
                alert('鍵返却が記録されました。ありがとうございました！');
                router.push(`/reservations/${reservationId}/survey?token=${token}`);
            } else {
                alert(data.message || data.error || '記録に失敗しました');
                setSubmitting(false);
            }
        } catch (error) {
            alert('記録に失敗しました');
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

    if (!reservation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="glass-panel p-8 rounded-2xl text-center">
                    <p className="text-muted-foreground">予約が見つかりませんでした</p>
                </div>
            </div>
        );
    }

    if (reservation.key_returned_at) {
        return (
            <div className="min-h-screen py-16 px-4">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="glass-panel rounded-3xl p-10 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-4">鍵返却済み</h1>
                        <p className="text-muted-foreground mb-6">
                            {new Date(reservation.key_returned_at).toLocaleString('ja-JP')}に返却記録済みです
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="glass-panel rounded-3xl p-10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500 left-0" />

                    <h1 className="text-3xl font-bold text-foreground mb-8 text-center">鍵返却確認</h1>

                    <div className="glass-panel bg-white/40 rounded-xl p-5 mb-8 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">物件</span>
                            <span className="font-medium">{reservation.property?.name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between py-1 mt-2">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">日時</span>
                            <span className="font-medium text-primary">
                                {new Date(reservation.slot?.start_time).toLocaleString('ja-JP')}
                            </span>
                        </div>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 mb-8">
                        <h3 className="font-bold text-amber-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            確認事項
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex gap-2 text-amber-800 text-sm items-start">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>鍵をキーボックスに戻しましたか？</span>
                            </li>
                            <li className="flex gap-2 text-amber-800 text-sm items-start">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>キーボックスはロックされていますか？</span>
                            </li>
                            <li className="flex gap-2 text-amber-800 text-sm items-start">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>物件の施錠を確認しましたか？</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-primary via-orange-400 to-pink-400 text-white py-4 rounded-xl font-bold font-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? '記録中...' : '鍵を返却しました'}
                    </button>
                </div>
            </div>
        </div>
    );
}
