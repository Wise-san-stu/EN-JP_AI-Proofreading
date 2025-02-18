import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "文章が入力されていません" }, { status: 400 });
        }

        // OpenAI API のエンドポイント
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an AI that corrects English sentences and provides detailed corrections." },
                    { 
                        role: "user", 
                        content: `Correct the following English text and provide detailed corrections:\n\n"${text}"\n\nRespond in the following JSON format:\n{\n  "correctedText": "corrected version",\n  "corrections": [\n    {"original": "wrong word", "corrected": "fixed word", "reason": "grammar/spelling/etc."},\n    ...\n  ]\n}`
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await openaiResponse.json();

        if (!openaiResponse.ok) {
            return NextResponse.json({ error: data.error?.message || "OpenAI API エラー" }, { status: 500 });
        }

        // OpenAI のレスポンスから校正結果を取得
        let correctedText = text;
        let corrections = [];

        try {
            const parsedResponse = JSON.parse(data.choices?.[0]?.message?.content || "{}");
            correctedText = parsedResponse.correctedText || text;
            corrections = parsedResponse.corrections || [];
        } catch (err) {
            return NextResponse.json({ error: "OpenAI レスポンスの解析に失敗しました" }, { status: 500 });
        }

        return NextResponse.json({ correctedText, corrections });

    } catch (error) {
        return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
}

