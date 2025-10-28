<div id="top"></div>

## 使用技術一覧

<!-- シールド一覧 -->
<p style="display: inline">
  <img src="https://img.shields.io/badge/-React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/-TailwindCSS-000000.svg?logo=tailwindcss&style=for-the-badge">
  <img src="https://img.shields.io/badge/-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img src="https://img.shields.io/badge/-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
</p>

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [環境](#環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)
5. [トラブルシューティング](#トラブルシューティング)



## プロジェクト名

luana_management

<!-- プロジェクトについて -->

## プロジェクトについて

luana_managementは、サロンの予約管理、顧客管理、サービス管理などを行うための管理画面です。

<p align="right">(<a href="#top">トップへ</a>)</p>

## 環境

<!-- 言語、フレームワーク、ミドルウェア、インフラの一覧とバージョンを記載 -->

| 言語・フレームワーク | バージョン   |
| -------------------- | ------------ |
| Node.js              | 18.x or 20.x |
| React                | 18.3.1       |
| TypeScript           | 5.5.3        |
| Vite                 | 5.4.19       |

その他のパッケージのバージョンは package.json を参照してください

<p align="right">(<a href="#top">トップへ</a>)</p>

## ディレクトリ構成

<!-- Treeコマンドを使ってディレクトリ構成を記載 -->

```
.
├── .gitignore
├── create_fcm_tokens_table.sql
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vapid-keys.json
├── vite.config.ts
├── dist/
├── public/
│   ├── _redirects
│   ├── favicon.svg
│   └── firebase-messaging-sw.js
└── src/
    ├── App.tsx
    ├── index.css
    ├── index.tsx
    ├── main.tsx
    ├── components/
    ├── context/
    ├── lib/
    ├── pages/
    └── types/
```

<p align="right">(<a href="#top">トップへ</a>)</p>

## 開発環境構築

<!-- パッケージのインストール方法など、開発環境構築に必要な情報を記載 -->

### 1. パッケージのインストール

以下のコマンドを実行して、プロジェクトに必要なパッケージをインストールします。

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトのルートディレクトリに`.env`ファイルを作成し、以下の内容を記述します。

```
VITE_SUPABASE_URL=あなたのSupabaseプロジェクトURL
VITE_SUPABASE_ANON_KEY=あなたのSupabase anonキー
```

これらの値は、Supabaseのプロジェクト設定ページから取得できます。

### 3. 開発サーバーの起動

以下のコマンドを実行して、開発サーバーを起動します。

```bash
npm run dev
```

サーバーが起動すると、ターミナルに表示されるURL（通常は http://localhost:5173）にブラウザでアクセスします。

### コマンド一覧

| コマンド        | 実行する処理                               |
| --------------- | ------------------------------------------ |
| `npm run dev`     | 開発サーバーを起動します。                 |
| `npm run build`   | 本番用にプロジェクトをビルドします。       |
| `npm run lint`    | ESLintを実行してコードを静的解析します。   |
| `npm run preview` | ビルドされたプロジェクトをプレビューします。 |

<p align="right">(<a href="#top">トップへ</a>)</p>

## トラブルシューティング

### `npm install`でエラーが発生する

Node.jsのバージョンが古い可能性があります。「環境」セクションに記載されているバージョンがインストールされているか確認してください。
また、キャッシュが原因で問題が発生している場合は、以下のコマンドを試してください。

```bash
npm cache clean --force
```

### 開発サーバーが起動しない

`.env`ファイルが正しく設定されているか確認してください。特に、`VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`が正しい値に設定されているか確認が必要です。

### Module not found

`npm install`が正常に完了していない可能性があります。`node_modules`ディレクトリを一度削除してから、再度`npm install`を実行してみてください。

```bash
rm -rf node_modules
npm install
```

<p align="right">(<a href="#top">トップへ</a>)</p>
