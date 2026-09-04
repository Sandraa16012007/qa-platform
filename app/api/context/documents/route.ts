import { NextResponse } from "next/server";
import {
  DocumentFileInput,
  extractAdditionalContextFromFiles,
  extractPrdContextFromFiles,
} from "@/lib/context-engine/document-extractor";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const category = (formData.get("category") as string || "").toLowerCase();
    const files = formData.getAll("files") as File[];

    if (!category || (category !== "prd" && category !== "additional")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category. Must be 'prd' or 'additional'.",
        },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No files provided for extraction.",
        },
        { status: 400 }
      );
    }

    const documentInputs: DocumentFileInput[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      documentInputs.push({
        name: file.name,
        buffer,
        size: file.size,
        type: file.type,
      });
    }

    if (category === "prd") {
      const prdContext = await extractPrdContextFromFiles(documentInputs);
      return NextResponse.json({
        success: true,
        data: prdContext,
      });
    } else {
      const additionalContext = await extractAdditionalContextFromFiles(documentInputs);
      return NextResponse.json({
        success: true,
        data: additionalContext,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: `Document extraction failed: ${message.slice(0, 120)}`,
      },
      { status: 500 }
    );
  }
}
