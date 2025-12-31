# 内見予約システム (Viewing Reservation System)

Next.js App Router + Prisma + SQLite で構築された物件内見予約システムです。

## 機能概要

### エンドユーザー機能
- 物件一覧閲覧
- 内見枠選択・予約
- トークンベースのアクセス制御
- 時間制限付きキーコード表示（内見開始30分前〜終了30分後）
- 鍵返却報告
- アンケート送信

### 管理機能
- Basic認証で保護された管理画面
- ダッシュボード（本日の予約、未返却キー）
- 物件管理
- 予約一覧・詳細確認

### 自動化
- キーコード自動発行スクリプト（要定期実行）

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **データベース**: SQLite
- **ORM**: Prisma 7
- **スタイリング**: Tailwind CSS

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Prisma クライアント生成

```bash
npm run prisma:generate
```

### 3. データベースマイグレーション

```bash
npm run prisma:migrate
```

### 4. 初期データ投入

```bash
npm run prisma:seed
```

## 起動

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## キーコード自動発行

内見開始30分前にキーコードを発行するスクリプトを定期実行してください。

```bash
npm run issue-keys
```

**推奨**: cron や GitHub Actions などで5分〜15分間隔で実行

## 環境変数

`.env.local` ファイル:

```
DATABASE_URL="file:./prisma/dev.db"
ADMIN_USER="admin"
ADMIN_PASS="password"
KEY_BEFORE_MIN=30
KEY_AFTER_MIN=30
```

- `DATABASE_URL`: SQLiteデータベースのパス
- `ADMIN_USER`: 管理画面ログインユーザー名
- `ADMIN_PASS`: 管理画面ログインパスワード
- `KEY_BEFORE_MIN`: キーコード表示開始時間（内見開始の何分前から）
- `KEY_AFTER_MIN`: キーコード表示終了時間（内見終了の何分後まで）

## ページ構成

### エンドユーザー

- `/properties` - 物件一覧
- `/properties/[id]` - 物件詳細・内見枠選択・予約フォーム
- `/reservations/[id]/complete?token=xxx` - 予約完了
- `/reservations/[id]/today?token=xxx` - 当日案内（キーコード表示）
- `/reservations/[id]/finish?token=xxx` - 鍵返却報告
- `/reservations/[id]/survey?token=xxx` - アンケート

### 管理画面（Basic認証）

- `/admin/dashboard` - ダッシュボード
- `/admin/properties` - 物件管理
- `/admin/reservations` - 予約管理

## API エンドポイント

- `POST /api/reservations` - 予約作成
- `GET /api/reservations/[id]?token=xxx` - 予約取得
- `GET /api/reservations/[id]/key-code?token=xxx` - キーコード取得
- `POST /api/reservations/[id]/key-return` - 鍵返却記録
- `POST /api/reservations/[id]/survey` - アンケート保存

## セキュリティ

- すべての予約操作はUUID トークンで認証
- 管理画面は Basic 認証で保護
- キーコードは時間窓制御で表示制限

## 注意事項

- メール送信は MVP のため `console.log` のみ（実装は要カスタマイズ）
- UIは最低限の実装（必要に応じてデザイン改善）
- SQLite使用のため、本番環境では PostgreSQL 等への移行を推奨

## 本番デプロイ前の TODO

- [ ] メール送信機能の実装（SendGrid, AWS SES等）
- [ ] 環境変数の本番設定
- [ ] データベースを PostgreSQL 等に変更
- [ ] Basic認証をより堅牢な認証に変更
- [ ] エラーハンドリングの強化
- [ ] ログ機能の追加
- [ ] キーコード発行ジョブの自動化設定

## License

MIT
