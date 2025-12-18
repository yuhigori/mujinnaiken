'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ReservationCompletePage({ params }: PageProps) {
    const searchParams = useSearchParams();
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
        return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
    }

    if (!reservation) {
        return <div className="min-h-screen flex items-center justify-center">予約が見つかりませんでした</div>;
    }

    const token = searchParams.get('token');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">予約完了</h1>
                        <p className="text-gray-600">内見予約が完了しました</p>
                    </div>

                    <div className="border-t border-b py-6 mb-6 space-y-3">
                        <div>
                            <span className="text-gray-600">物件:</span>
                            <span className="ml-2 font-medium">{reservation.property?.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">住所:</span>
                            <span className="ml-2">{reservation.property?.address}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">内見日時:</span>
                            <span className="ml-2 font-medium">
                                {new Date(reservation.slot?.start_time).toLocaleString('ja-JP')}
                                {' ~ '}
                                {new Date(reservation.slot?.end_time).toLocaleTimeString('ja-JP')}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">お名前:</span>
                            <span className="ml-2">{reservation.name}</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">次のステップ</h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                            <li>内見当日、開始30分前になったら「当日案内」ページからキーコードを確認してください</li>
                            <li>キーボックスのキーコードを使って鍵を取り出してください</li>
                            <li>内見終了後、必ず鍵を返却し「鍵返却完了」を報告してください</li>
                        </ol>
                    </div>

                    <Link
                        href={`/reservations/${reservationId}/today?token=${token}`}
                        className="block w-full bg-blue-600 text-white text-center py-3 rounded-md font-medium hover:bg-blue-700 transition mb-3"
                    >
                        当日案内ページへ
                    </Link>

                    <Link
                        href="/properties"
                        className="block w-full text-center text-blue-600 hover:text-blue-700 transition"
                    >
                        物件一覧に戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
