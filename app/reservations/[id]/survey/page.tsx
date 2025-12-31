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

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="glass-panel rounded-3xl p-10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-violet-400 to-purple-500 left-0" />

                    <h1 className="text-3xl font-bold text-foreground mb-8 text-center">内見アンケート</h1>

                    <div className="glass-panel bg-white/40 rounded-xl p-5 mb-8 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">物件</span>
                            <span className="font-medium">{reservation.property?.name}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-foreground mb-3">
                                物件の感想・ご意見をお聞かせください
                            </label>
                            <textarea
                                value={survey}
                                onChange={(e) => setSurvey(e.target.value)}
                                rows={6}
                                className="w-full p-4 bg-white/90 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 resize-none"
                                placeholder="物件の良かった点、気になった点など、ご自由にお書きください"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                        >
                            {submitting ? '送信中...' : '送信する'}
                        </button>

                        <div className="text-center text-sm text-muted-foreground">
                            アンケートは任意です。スキップする場合は
                            <button
                                type="button"
                                onClick={() => router.push('/properties')}
                                className="text-primary hover:text-primary/80 font-medium ml-1 transition-colors underline underline-offset-4"
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
