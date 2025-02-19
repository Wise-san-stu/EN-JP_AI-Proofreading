import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in the environment variables.");
        }

        const { text, prompt, mode, freeMode } = await req.json();

        let modeInstruction = "";
        let systemRole = "";

        if (mode === "english") {
            systemRole = "あなたは英語の教師であり、試験の採点者です。";
            modeInstruction = `
                1. **文法・単語の修正点を JSON 形式でリストアップしてください。**  
                2. **修正後の理想的な解答を JSON 形式で提示してください。**  
                **注意: 校正理由は必ず日本語で説明してください！**
            `;
        } else if (mode === "japanese") {
            systemRole = "あなたは日本語の教師であり、試験の採点者です。";
            modeInstruction = `
                1. **文法や語彙の修正点を JSON 形式でリストアップしてください。**  
                2. **修正後の理想的な文章を JSON 形式で提示してください。**  
                **注意: 校正理由は必ず英語で説明してください！**
            `;
        } else {
            throw new Error("Invalid mode. Must be 'english' or 'japanese'.");
        }

        const jsonOutputInstruction = `
            必ず以下の JSON フォーマットで出力してください:
            {
              "correctedText": "修正後の文章",
              "corrections": [
                {
                  "original": "元の単語やフレーズ",
                  "corrected": "修正後の単語やフレーズ",
                  "reason": "修正理由"
                }
              ]
            }
        `;

        const userContent = freeMode
            ? `ユーザーの文章: ${text}\n\n${modeInstruction}\n\n${jsonOutputInstruction}`
            : `お題: ${prompt}\n学生の解答: ${text}\n\n${modeInstruction}\n\n${jsonOutputInstruction}`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemRole },
                    { role: "user", content: userContent }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API request failed with status ${response.status}`);
        }

        const aiData = await response.json();
        const feedback = aiData?.choices?.[0]?.message?.content;

        console.log("OpenAI Response:", feedback);

        let parsedFeedback;
        try {
            parsedFeedback = JSON.parse(feedback);
        } catch (_error: unknown) {
            console.error("JSON Parse Error:", _error);
            console.log("Fallback Raw Response:", feedback);
            return NextResponse.json({
                error: "GPT のレスポンスが JSON として解析できませんでした。",
                rawResponse: feedback
            }, { status: 500 });
        }

        return NextResponse.json({
            correctedText: parsedFeedback.correctedText || text,
            corrections: parsedFeedback.corrections || [],
            feedback: parsedFeedback
        });
    } catch (_error: unknown) {
        console.error("校正エラー:", _error);
        return NextResponse.json({ error: (_error as Error).message || "添削エラー" }, { status: 500 });
    }
}
