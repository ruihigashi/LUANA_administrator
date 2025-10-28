<div id="top"></div>

## プロジェクト名

Luana管理者サイト

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [環境](#環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)


## プロジェクトについて

luana_managementは、サロンの予約管理、顧客管理、サービス管理などを行うための管理者専用画面です。

<img width="1920" height="954" alt="screencapture-luana-administer-netlify-app-dashboard-2025-10-28-14_39_43" src="https://github.com/user-attachments/assets/403c70ab-3bbe-469a-b5de-83945ddb47f7" />

## サイトリンク
https://luana-administer.netlify.app/login

<br/>

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
