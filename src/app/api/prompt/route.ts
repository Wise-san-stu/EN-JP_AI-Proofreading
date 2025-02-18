import { NextRequest, NextResponse } from "next/server";

const recentPrompts: string[] = []; // 過去のお題を保存
const MAX_HISTORY = 10; // 保存する履歴の最大数

export async function POST(req: NextRequest) {
    try {
        const requestData = await req.json();
        console.log("Received request data:", requestData);

        const { mode, level } = requestData;

        if (!mode || !level) {
            console.error("Missing required fields:", { mode, level });
            return NextResponse.json({ error: "言語またはレベルが指定されていません。" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is not set.");
            return NextResponse.json({ error: "サーバー設定エラー: APIキーがありません。" }, { status: 500 });
        }

        let difficultyInstruction = "";
        let examplePrompt = "";

        if (mode === "english") {
            switch (level) {
                case "beginner":
                    difficultyInstruction = "基本的な単語を使い初級レベルで日常会話ができるお題を作ってください。1文程度でお願いします。";
                    break;
                case "intermediate":
                    difficultyInstruction = "少し複雑な文章構造を含むお題を作ってください。文字数は20~50文字程度でお願いします。多少文字数が超過しても構いません。";
                    break;
                case "advanced":
                    difficultyInstruction = "抽象的な表現や難しい単語を含む高度な英訳用のお題を作ってください。文字数は40~50文字程度でお願いします。";
                    break;
                default:
                    difficultyInstruction = "簡単な日常会話レベルのお題を作ってください。";
            }
            examplePrompt = "\n簡単なお題の例:\n- 私の父は医者で、毎日いそがしく働いています。\n- 私の将来の夢は漫画家です。\n- 貴方の弟は何の仕事をされているのですか？\n家族や学校、食事、趣味、旅行など、幅広いカテゴリーに分け、家族との会話、友達との会話、旅行中の会話など、さまざまなシチュエーションをカバーしてください。\nお題は必ず一つにしてください。\n文章の初めに「お題:」をつける必要はありません。\n**注意:必ずお題は日本語で生成してください**\n**注意:お題は必ず一つだけ生成してください**";
        } else if (mode === "japanese") {
            switch (level) {
                case "beginner":
                    difficultyInstruction = "Please create a beginner-level topic for Japanese learners using basic vocabulary and grammar. One sentence, please.";
                    break;
                case "intermediate":
                    difficultyInstruction = "Please create an intermediate-level topic for Japanese learners using more complex grammar. Approximately 20-50 characters. It's okay if it slightly exceeds the limit.";
                    break;
                case "advanced":
                    difficultyInstruction = "Please create an advanced-level topic for Japanese learners that includes abstract topics or advanced expressions. Approximately 40-50 characters.";
                    break;
                default:
                    difficultyInstruction = "Please create a topic for practicing basic Japanese conversation.";
            }
            examplePrompt = "\ntopic example:\n- My father is a doctor and works very hard every day.\n- My dream for the future is to become a manga artist.\n- What job does your younger brother have?\nCover a wide range of topics such as family, school, meals, hobbies, and travel.\nInclude various situations such as conversations with family, friends, and during travel.\nThe prompt must be a single topic.\nDo not start the sentence with 'Topic:'.\n**Note: Be sure to generate the topic in English.**\n**Note: Be sure to generate only one topic.**";
        } else {
            console.error("Invalid mode selection:", mode);
            return NextResponse.json({ error: "無効な言語選択" }, { status: 400 });
        }

        const finalPrompt =
            mode === "english"
                ? `${difficultyInstruction}${examplePrompt}\n**Avoid duplicating past topics:**\n${recentPrompts.map((p, i) => `(${i + 1}) ${p}`).join("\n")}`
                : `${difficultyInstruction}${examplePrompt}\n**過去のお題と被らないようにしてください:**\n${recentPrompts.map((p, i) => `(${i + 1}) ${p}`).join("\n")}`;

        console.log("Sending request to OpenAI API...");
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: `あなたは${mode === "english" ? "英語" : "日本語"}学習者向けの教師です。` },
                    { role: "user", content: finalPrompt }
                ],
                temperature: 0.7
            })
        });

        console.log("OpenAI API Response Status:", aiResponse.status);

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("OpenAI API Error Response:", errorText);
            return NextResponse.json({ error: "OpenAI API呼び出しに失敗しました", details: errorText }, { status: aiResponse.status });
        }

        const aiData = await aiResponse.json();
        console.log("OpenAI API Response Data:", aiData);

        const prompt = aiData.choices?.[0]?.message?.content?.trim();
        if (!prompt || recentPrompts.includes(prompt)) {
            console.error("Invalid or duplicate AI response:", aiData);
            return NextResponse.json({ error: "適切なお題が生成されませんでした" }, { status: 500 });
        }

        // 履歴を更新
        recentPrompts.push(prompt);
        if (recentPrompts.length > MAX_HISTORY) {
            recentPrompts.shift();
        }

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return NextResponse.json({ error: "お題生成エラー" }, { status: 500 });
    }
}
