'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ReservationCompletePage({ params }: PageProps) {
    const searchParams = useSearchParams();
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

    const token = searchParams.get('token');

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="glass-panel rounded-3xl p-10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500 left-0" />

                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">予約完了</h1>
                        <p className="text-muted-foreground">内見予約が完了しました</p>
                    </div>

                    <div className="border border-border rounded-2xl p-6 mb-8 bg-white/40 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-dashed border-border last:border-0 last:pb-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">物件</span>
                            <span className="font-medium text-foreground mt-1 sm:mt-0">{reservation.property?.name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-dashed border-border last:border-0 last:pb-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">住所</span>
                            <span className="text-foreground mt-1 sm:mt-0 text-right">{reservation.property?.address}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-dashed border-border last:border-0 last:pb-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">内見日時</span>
                            <span className="font-bold text-primary mt-1 sm:mt-0">
                                {new Date(reservation.slot?.start_time).toLocaleString('ja-JP', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                {' ~ '}
                                {new Date(reservation.slot?.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-dashed border-border last:border-0 last:pb-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">お名前</span>
                            <span className="text-foreground mt-1 sm:mt-0">{reservation.name}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            次のステップ
                        </h3>
                        <ol className="space-y-3">
                            <li className="flex gap-3 text-sm text-blue-800">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                                <span>内見当日、開始30分前になったら「当日案内」ページからキーコードを確認してください</span>
                            </li>
                            <li className="flex gap-3 text-sm text-blue-800">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                                <span>キーボックスのキーコードを使って鍵を取り出してください</span>
                            </li>
                            <li className="flex gap-3 text-sm text-blue-800">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                                <span>内見終了後、必ず鍵を返却し「鍵返却完了」を報告してください</span>
                            </li>
                        </ol>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href={`/reservations/${reservationId}/today?token=${token}`}
                            className="block w-full bg-primary text-primary-foreground text-center py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition transform hover:-translate-y-0.5"
                        >
                            当日案内ページへ
                        </Link>

                        <Link
                            href="/properties"
                            className="block w-full text-center text-muted-foreground hover:text-foreground transition font-medium"
                        >
                            物件一覧に戻る
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
