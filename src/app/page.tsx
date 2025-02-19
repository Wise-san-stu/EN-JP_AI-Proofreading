"use client";
import { useState } from "react";

type Correction = {
    original: string;
    corrected: string;
    reason: string;
};

export default function Home() {
    const [mode, setMode] = useState("english");
    const [level, setLevel] = useState("beginner");
    const [prompt, setPrompt] = useState("");
    const [text, setText] = useState("");
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [correctedText, setCorrectedText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCorrecting, setIsCorrecting] = useState(false);
    const [freeMode, setFreeMode] = useState(false);

    const labels = mode === "english" ? {
        language: "言語選択/Language",
        level: "レベルを選択",
        levels: { beginner: "初級", intermediate: "中級", advanced: "上級" },
        topic: "お題",
        generateTopic: "お題を生成",
        enterText: "ここに英文を入力してください...",
        proofread: "校正する",
        freeMode: "自由添削モード",
    } : {
        language: "言語選択/Language",
        level: "Select a level",
        levels: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
        topic: "Topic",
        generateTopic: "Generate Topic",
        enterText: "Please enter Japanese text here...",
        proofread: "To proofread",
        freeMode: "Free Correction Mode",
    };

    const generatePrompt = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ level, mode }),
            });
            if (!response.ok) throw new Error("Failed to generate topic");
            const data = await response.json();
            setPrompt(data.prompt);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error generating topic");
        } finally {
            setIsGenerating(false);
        }
    };

    const correctText = async () => {
        if (!text.trim()) return;
        setIsCorrecting(true);
        try {
            const apiEndpoint = freeMode ? "/api/free-correct" : "/api/correct";
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, mode, prompt: freeMode ? "" : prompt }),
            });
            if (!response.ok) throw new Error("Correction failed");
            const data = await response.json();
            setCorrectedText(data.correctedText);
            setCorrections(data.corrections);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error during proofreading");
        } finally {
            setIsCorrecting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 dark:bg-gray-900 min-h-screen rounded-xl shadow-lg">
            <div className="header">
                <h1>AI Proofreading ✍️</h1>
                <span className="author">created by Wise.</span>
            </div>

            <div className="mb-4">
                <label className="block font-semibold mb-1">{labels.language}:</label>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full p-2 border rounded-md">
                    <option value="english">英作文校正</option>
                    <option value="japanese">Japanese text proofreading</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block font-semibold mb-1">{labels.freeMode}:</label>
                <input type="checkbox" checked={freeMode} onChange={() => setFreeMode(!freeMode)} />
            </div>

            {!freeMode && (
                <>
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">{labels.level}:</label>
                        <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-2 border rounded-md">
                            <option value="beginner">{labels.levels.beginner}</option>
                            <option value="intermediate">{labels.levels.intermediate}</option>
                            <option value="advanced">{labels.levels.advanced}</option>
                        </select>
                    </div>
                    <div className="mb-4 p-4 bg-white border rounded-lg shadow-sm">
                        <strong>{labels.topic}:</strong> {prompt || <span>{labels.generateTopic}</span>}
                    </div>
                    <button className={`w-full px-4 py-2 rounded-md text-white ${isGenerating ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`} onClick={generatePrompt} disabled={isGenerating}>
                        {isGenerating ? "Generating..." : labels.generateTopic}
                    </button>
                </>
            )}

            <textarea className="w-full p-3 mt-4 border rounded-md" rows={4} placeholder={labels.enterText} value={text} onChange={(e) => setText(e.target.value)}></textarea>

            <button className={`w-full px-4 py-2 mt-4 rounded-md text-white ${isCorrecting ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`} onClick={correctText} disabled={isCorrecting}>
                {isCorrecting ? "Processing..." : labels.proofread}
            </button>

            {correctedText && (
                <div className="mt-6 p-4 bg-white border rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold">校正結果:</h2>
                    <p><strong>修正後:</strong> {correctedText}</p>
                    <h3 className="mt-4 font-semibold">修正点:</h3>
                    <ul className="list-disc pl-5">
                        {corrections.map((correction, index) => (
                            <li key={index}><strong>{correction.original}</strong> → <strong>{correction.corrected}</strong><br /><span>{correction.reason}</span></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
