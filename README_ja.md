# Next.js AI 校正アプリ

このプロジェクトは [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) を使用して作成された [Next.js](https://nextjs.org) プロジェクトです。

## 機能

- 英語と日本語の文章校正に対応。`Language` タブで校正言語を選択可能。
- 2つのモードを搭載：
  - **お題付きモード:** AIが提示するお題に沿って文章を作成し、校正を受ける。
  - **自由モード:** 任意の文章を入力して校正を受ける。
- "お題を生成" ボタンを押すと、AIが文章作成のためのお題を生成。
- "校正する" ボタンを押すと、AIが文章を校正。
- "自由校正モード" を有効にすると、お題なしで自由に文章を校正可能。
- AIによる校正のため、校正結果が100%正確ではない事に注意してください。。

## 開発環境のセットアップ

まず、開発サーバーを起動します。

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリが表示されます。

`app/page.tsx` を編集すると、ページが自動更新されます。

本プロジェクトでは、[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使用して [Geist](https://vercel.com/font) フォントを最適化して読み込んでいます。

## 詳細情報

Next.js について詳しく知りたい場合は、以下のリソースをご覧ください。

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能やAPIについて学ぶ。
- [Next.js チュートリアル](https://nextjs.org/learn) - インタラクティブなチュートリアル。

また、[Next.js GitHub リポジトリ](https://github.com/vercel/next.js) もチェックしてみてください。

## Vercel へのデプロイ

Next.js アプリをデプロイする最も簡単な方法は、[Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を使用することです。

詳しくは、[Next.js のデプロイに関するドキュメント](https://nextjs.org/docs/app/building-your-application/deploying) をご覧ください。

