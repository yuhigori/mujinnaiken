'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function SurveyPage({ params }: PageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [survey, setSurvey] = useState('');
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
                if (data.reservation?.survey) {
                    setSurvey(data.reservation.survey);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [reservationId, searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = searchParams.get('token');
        if (!token) return;

        setSubmitting(true);

        try {
            const res = await fetch(`/api/reservations/${reservationId}/survey`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, survey })
            });

            const data = await res.json();

            if (res.ok) {
                alert('アンケートを送信しました。ご協力ありがとうございました！');
                router.push('/properties');
            } else {
                alert(data.error || '送信に失敗しました');
                setSubmitting(false);
            }
        } catch (error) {
            alert('送信に失敗しました');
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
    }

    if (!reservation) {
        return <div className="min-h-screen flex items-center justify-center">予約が見つかりませんでした</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">内見アンケート</h1>

                    <div className="border-t border-b py-6 mb-6 space-y-3">
                        <div>
                            <span className="text-gray-600">物件:</span>
                            <span className="ml-2 font-medium">{reservation.property?.name}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                物件の感想・ご意見をお聞かせください
                            </label>
                            <textarea
                                value={survey}
                                onChange={(e) => setSurvey(e.target.value)}
                                rows={6}
                                className="w-full p-3 border rounded-md"
                                placeholder="物件の良かった点、気になった点など、ご自由にお書きください"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mb-3"
                        >
                            {submitting ? '送信中...' : '送信する'}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            アンケートは任意です。スキップする場合は
                            <button
                                type="button"
                                onClick={() => router.push('/properties')}
                                className="text-blue-600 hover:text-blue-700 ml-1"
                            >
                                こちら
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
