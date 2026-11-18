import { NextResponse } from "next/server";
import { safeGenerateJSON } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || !body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: 'prompt' string is required.",
        },
        { status: 400 }
      );
    }

    const { prompt, systemInstruction, temperature, maxOutputTokens } = body;

    const result = await safeGenerateJSON({
      prompt,
      systemInstruction: typeof systemInstruction === "string" ? systemInstruction : undefined,
      temperature: typeof temperature === "number" ? temperature : undefined,
      maxOutputTokens: typeof maxOutputTokens === "number" ? maxOutputTokens : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Gemini service encountered an error.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
