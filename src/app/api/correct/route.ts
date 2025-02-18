import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in the environment variables.");
        }

        const { text, prompt, mode } = await req.json();

        let modeInstruction = "";
        let systemRole = "";

        if (mode === "english") {
            systemRole = "あなたは英語の教師であり、試験の採点者です。";
            modeInstruction = `
                1. **この解答がお題を翻訳したものとして適切かどうかを判定し、「適切」もしくは「不適切」で回答してください。**  
                2. **適切でない場合は、どう修正すべきかアドバイスしてください。**  
                3. **文法・単語の修正点を「誤り: XX → 修正: YY\n理由: (日本語で説明)」の形式でリストアップしてください。**  
                4. **修正後の理想的な解答を提示してください。**  
                **注意: 校正理由は必ず日本語で説明してください！**
            `;
        } else if (mode === "japanese") {
            systemRole = "あなたは日本語の教師であり、試験の採点者です。";
            modeInstruction = `
                1. **この文章の文法・語彙・表現の正確さを評価し、改善点を指摘してください。**  
                2. **文法や語彙の修正点を「誤り: XX → 修正: YY\n理由: (英語で説明)」の形式でリストアップしてください。**  
                3. **修正後の理想的な文章を提示してください。**  
                **注意: 校正理由は必ず英語で説明してください！**
            `;
        } else {
            throw new Error("Invalid mode. Must be 'english' or 'japanese'.");
        }

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
                    { role: "user", content: `
                        お題: ${prompt}  
                        学生の解答: ${text}  
                        
                        ${modeInstruction}
                        
                        **以下の形式でJSONとして返答してください**:
                        {
                            "isRelevant": "適切" | "不適切",
                            "corrections": [
                                { "original": "誤った単語", "corrected": "修正後の単語", "reason": "修正理由" }
                            ],
                            "correctedText": "修正後の文章"
                        }
                    ` }
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
            throw new Error("GPTのレスポンスがJSONとして解析できませんでした。");
        }

        // 修正点がない場合、適切性を「適切」に強制設定
        if (!parsedFeedback.corrections || parsedFeedback.corrections.length === 0) {
            parsedFeedback.isRelevant = "適切";
        }

        return NextResponse.json({
            correctedText: parsedFeedback.correctedText || text,
            corrections: parsedFeedback.corrections || [],
            isRelevant: parsedFeedback.isRelevant === "適切",
            feedback: parsedFeedback
        });

    } catch (_error: unknown) {
        console.error("校正エラー:", _error);
        return NextResponse.json({ error: (_error as Error).message || "添削エラー" }, { status: 500 });
    }
}
