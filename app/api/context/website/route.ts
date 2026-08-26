import { NextResponse } from "next/server";
import { extractWebsiteContext } from "@/lib/context-engine/website";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, maxPages, maxDepth, timeoutMs } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Website URL is required for extraction.",
        },
        { status: 400 }
      );
    }

    const websiteContext = await extractWebsiteContext({
      url: url.trim(),
      maxPages: typeof maxPages === "number" ? maxPages : 10,
      maxDepth: typeof maxDepth === "number" ? maxDepth : 2,
      timeoutMs: typeof timeoutMs === "number" ? timeoutMs : 15000,
    });

    if (!websiteContext) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to extract context from the provided URL.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: websiteContext,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Sanitize technical browser details to a clean, user-friendly message
    let friendlyMessage = "Failed to crawl website.";
    if (message.includes("net::ERR_NAME_NOT_RESOLVED") || message.includes("ENOTFOUND")) {
      friendlyMessage = "Domain name could not be resolved. Please verify the URL.";
    } else if (message.includes("net::ERR_CONNECTION_REFUSED") || message.includes("ECONNREFUSED")) {
      friendlyMessage = "Connection refused by the target host.";
    } else if (message.includes("Timeout") || message.includes("timeout")) {
      friendlyMessage = "Website connection timed out while loading pages.";
    } else if (message.includes("Invalid URL")) {
      friendlyMessage = "Invalid website URL format.";
    } else {
      friendlyMessage = `Website extraction failed: ${message.slice(0, 120)}`;
    }

    return NextResponse.json(
      {
        success: false,
        error: friendlyMessage,
      },
      { status: 500 }
    );
  }
}
