'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TodayPage({ params }: PageProps) {
    const searchParams = useSearchParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reservation, setReservation] = useState<any>(null);
    const [keyCode, setKeyCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
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

        // Fetch reservation
        fetch(`/api/reservations/${reservationId}?token=${token}`)
            .then(res => res.json())
            .then(data => {
                setReservation(data.reservation);
                setLoading(false);

                // Try to fetch key code
                fetch(`/api/reservations/${reservationId}/key-code?token=${token}`)
                    .then(res => res.json())
                    .then(keyData => {
                        if (keyData.key_code) {
                            setKeyCode(keyData.key_code);
                        } else if (keyData.error) {
                            setError(keyData.message || keyData.error);
                        }
                    });
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
                    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500 left-0" />

                    <h1 className="text-3xl font-bold text-foreground mb-8 text-center">内見当日案内</h1>

                    <div className="glass-panel bg-white/40 rounded-xl p-5 mb-8 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">物件</span>
                            <span className="font-medium">{reservation.property?.name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between py-1 mt-2">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">日時</span>
                            <span className="font-medium text-primary">
                                {new Date(reservation.slot?.start_time).toLocaleString('ja-JP')}
                                {' ~ '}
                                {new Date(reservation.slot?.end_time).toLocaleTimeString('ja-JP')}
                            </span>
                        </div>
                    </div>

                    {keyCode ? (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-3xl p-8 mb-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] transform hover:scale-[1.02] transition-transform duration-300">
                            <h2 className="text-lg font-bold text-green-800 mb-4 uppercase tracking-widest bg-green-200/50 inline-block px-4 py-1 rounded-full">Key Code</h2>
                            <div className="text-7xl font-black text-green-700 mb-4 font-mono tracking-widest drop-shadow-sm">{keyCode}</div>
                            <p className="text-green-800 font-medium">
                                キーボックスにこの番号を入力して<br />鍵を取り出してください
                            </p>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 text-center">
                            <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                キーコード未発行
                            </h2>
                            <p className="text-amber-800 text-sm">
                                {error || 'キーコードは内見開始30分前から表示されます。時間になったらこのページを再読み込みしてください。'}
                            </p>
                        </div>
                    )}

                    {keyCode && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8">
                            <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                内見の流れ
                            </h3>
                            <ol className="space-y-3">
                                <li className="flex gap-3 text-sm text-blue-800">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white">1</span>
                                    <span>キーボックスにキーコードを入力</span>
                                </li>
                                <li className="flex gap-3 text-sm text-blue-800">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white">2</span>
                                    <span>鍵を取り出して内見</span>
                                </li>
                                <li className="flex gap-3 text-sm text-blue-800">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white">3</span>
                                    <span>内見終了後、必ず鍵を元に戻す</span>
                                </li>
                                <li className="flex gap-3 text-sm text-blue-800">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white">4</span>
                                    <span>「鍵返却完了」ボタンを押して報告</span>
                                </li>
                            </ol>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Link
                            href={`/reservations/${reservationId}/finish?token=${token}`}
                            className="block w-full bg-gradient-to-r from-primary via-orange-400 to-pink-400 text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] transition-all"
                        >
                            鍵返却完了を報告
                        </Link>

                        <Link
                            href={`/reservations/${reservationId}/survey?token=${token}`}
                            className="block w-full text-center text-primary/80 hover:text-primary transition font-medium text-sm"
                        >
                            アンケートに回答
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
