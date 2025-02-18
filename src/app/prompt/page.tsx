"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // useRouter の代わりに usePathname を使用

export default function PromptMode() {
    const [prompt, setPrompt] = useState("");
    const [userText, setUserText] = useState("");  // ユーザー入力
    const [correctedText, setCorrectedText] = useState("");  // 添削結果
    const [isRelevant, setIsRelevant] = useState<boolean | null>(null); // お題に適切かどうか
    const [feedback, setFeedback] = useState(""); // お題との適合性に関するフィードバック
    const [error, setError] = useState("");

    type Correction = {
        original: string;
        corrected: string;
        reason: string;
    };

    const [corrections, setCorrections] = useState<Correction[]>([]); // 型を明示

    const pathname = usePathname(); // 現在のパスを取得

    // お題を取得
    useEffect(() => {
        async function fetchPrompt() {
            try {
                const response = await fetch("/api/prompt");

                if (!response.ok) {
                    throw new Error("お題の取得に失敗しました");
                }

                const data = await response.json();
                setPrompt(data.prompt);
            } catch (err) {
                setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
            }
        }

        fetchPrompt();
    }, []);

    // ページ遷移時に添削結果をリセット
    useEffect(() => {
        setCorrectedText("");
        setCorrections([]);
        setUserText(""); // ユーザー入力もリセット（必要なら）
        setIsRelevant(null);
        setFeedback("");
    }, [pathname]); // ページのパスが変わったら実行

    // 添削をリクエストする関数
    async function handleCorrection() {
        setError("");  // エラーをリセット
        setCorrectedText("");
        setCorrections([]);
        setIsRelevant(null);
        setFeedback("");

        try {
            const response = await fetch("/api/correct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: userText, prompt }) // お題も送信
            });

            if (!response.ok) {
                throw new Error("添削の取得に失敗しました");
            }

            const data = await response.json();
            setCorrectedText(data.correctedText);
            setCorrections(data.corrections);
            setIsRelevant(data.isRelevant);
            setFeedback(data.feedback);
        } catch (err) {
            setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
        }
    }

    return (
        <div>
            <h1>AIお題モード</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p><strong>お題:</strong> {prompt || "お題を取得中..."}</p>

            <textarea 
                value={userText} 
                onChange={(e) => setUserText(e.target.value)}
                placeholder="ここに英文を入力..."
                rows={4} cols={50}
            />
            <br />
            <button onClick={handleCorrection}>添削を依頼</button>

            {correctedText && (
                <div>
                    <h2>添削結果</h2>
                    <p><strong>修正後:</strong> {correctedText}</p>
                    <h3>修正内容</h3>
                    <ul>
                        {corrections.map((correction, index) => (
                            <li key={index}>
                                <strong>{correction.original}</strong> → <em>{correction.corrected}</em> ({correction.reason})
                            </li>
                        ))}
                    </ul>

                    {/* お題との適合性チェック */}
                    <h3>お題との適合性</h3>
                    {isRelevant !== null && (
                        <p style={{ color: isRelevant ? "green" : "red" }}>
                            {isRelevant ? "✅ お題に適切な回答です！" : "❌ お題とズレています"}
                        </p>
                    )}
                    {feedback && <p><strong>アドバイス:</strong> {feedback}</p>}
                </div>
            )}
        </div>
    );
}
