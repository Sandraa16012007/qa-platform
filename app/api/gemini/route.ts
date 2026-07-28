import { NextResponse } from "next/server";
import { safeGenerateJSON } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await safeGenerateJSON(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
