import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",   // ✅ app ディレクトリ内の全コンポーネントを適用対象にする
    "./components/**/*.{js,ts,jsx,tsx}",  // ✅ components ディレクトリも含める
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
