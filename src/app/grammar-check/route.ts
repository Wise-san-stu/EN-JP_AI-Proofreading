import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 環境変数からAPIキーを取得
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json(); // ユーザーが入力した英作文を取得

    // OpenAI API にリクエストを送る
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // GPT-3.5 を使用
      messages: [
        {
          role: "system",
          content: "You are an English grammar checker. Fix any grammar errors and provide feedback.",
        },
        { role: "user", content: text },
      ],
      max_tokens: 500, // 応答の最大長
      temperature: 0.5, // 出力のランダム性
    });

    return NextResponse.json({ correctedText: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
