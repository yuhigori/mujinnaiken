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
        return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
    }

    if (!reservation) {
        return <div className="min-h-screen flex items-center justify-center">予約が見つかりませんでした</div>;
    }

    if (reservation.key_returned_at) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">鍵返却済み</h1>
                        <p className="text-gray-600 mb-6">
                            {new Date(reservation.key_returned_at).toLocaleString('ja-JP')}に返却記録済みです
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">鍵返却確認</h1>

                    <div className="border-t border-b py-6 mb-6 space-y-3">
                        <div>
                            <span className="text-gray-600">物件:</span>
                            <span className="ml-2 font-medium">{reservation.property?.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">内見日時:</span>
                            <span className="ml-2 font-medium">
                                {new Date(reservation.slot?.start_time).toLocaleString('ja-JP')}
                            </span>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-yellow-900 mb-2">確認事項</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                            <li>鍵をキーボックスに戻しましたか？</li>
                            <li>キーボックスはロックされていますか？</li>
                            <li>物件の施錠を確認しましたか？</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mb-3"
                    >
                        {submitting ? '記録中...' : '鍵を返却しました'}
                    </button>
                </div>
            </div>
        </div>
    );
}
