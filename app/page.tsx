import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="container mx-auto max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
            無人内見予約システム
          </h1>
          <p className="text-xl text-muted-foreground">
            24時間いつでも、あなたのペースで内見予約が可能です
          </p>
        </div>

        {/* メインメニュー */}
        <div className="glass-panel rounded-3xl p-8 md:p-12 space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">メニュー</h2>
            <p className="text-muted-foreground">ご希望の操作を選択してください</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 内見を予約するボタン */}
            <Link
              href="/properties"
              className="group relative block p-8 rounded-2xl bg-gradient-to-br from-primary to-indigo-700 text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">内見を予約する</h3>
                  <p className="text-sm text-white/80">
                    物件を選択して内見予約を行います
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors" />
            </Link>

            {/* その他のメニュー項目（将来の拡張用） */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-100 border border-slate-200 dark:border-slate-200 opacity-60">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-200 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400 dark:text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1 text-slate-400 dark:text-slate-400">
                    その他の機能
                  </h3>
                  <p className="text-sm text-slate-400 dark:text-slate-400">
                    今後追加予定
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター情報 */}
        <div className="mt-12 text-center text-sm text-muted-foreground animate-fade-in">
          <p>ご不明な点がございましたら、お気軽にお問い合わせください</p>
        </div>
      </div>
    </div>
  );
}
