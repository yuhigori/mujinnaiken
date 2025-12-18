'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TodayPage({ params }: PageProps) {
    const searchParams = useSearchParams();
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">内見当日案内</h1>

                    <div className="border-t border-b py-6 mb-6 space-y-3">
                        <div>
                            <span className="text-gray-600">物件:</span>
                            <span className="ml-2 font-medium">{reservation.property?.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">内見日時:</span>
                            <span className="ml-2 font-medium">
                                {new Date(reservation.slot?.start_time).toLocaleString('ja-JP')}
                                {' ~ '}
                                {new Date(reservation.slot?.end_time).toLocaleTimeString('ja-JP')}
                            </span>
                        </div>
                    </div>

                    {keyCode ? (
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6 text-center">
                            <h2 className="text-xl font-semibold text-green-900 mb-3">キーコード</h2>
                            <div className="text-5xl font-bold text-green-700 mb-4 tracking-widest">{keyCode}</div>
                            <p className="text-sm text-green-800">
                                キーボックスにこの4桁のコードを入力して鍵を取り出してください
                            </p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-yellow-900 mb-2">キーコード未発行</h2>
                            <p className="text-yellow-800">
                                {error || 'キーコードは内見開始30分前から表示されます。時間になったらこのページを再読み込みしてください。'}
                            </p>
                        </div>
                    )}

                    {keyCode && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">内見の流れ</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                                <li>キーボックスにキーコードを入力</li>
                                <li>鍵を取り出して内見</li>
                                <li>内見終了後、必ず鍵を元に戻す</li>
                                <li>「鍵返却完了」ボタンを押して報告</li>
                            </ol>
                        </div>
                    )}

                    <Link
                        href={`/reservations/${reservationId}/finish?token=${token}`}
                        className="block w-full bg-blue-600 text-white text-center py-3 rounded-md font-medium hover:bg-blue-700 transition mb-3"
                    >
                        鍵返却完了を報告
                    </Link>

                    <Link
                        href={`/reservations/${reservationId}/survey?token=${token}`}
                        className="block w-full text-center text-blue-600 hover:text-blue-700 transition"
                    >
                        アンケートに回答
                    </Link>
                </div>
            </div>
        </div>
    );
}
