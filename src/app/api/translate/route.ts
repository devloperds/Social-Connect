import { NextResponse } from "next/server";
import { translateText } from "@/lib/translate";

export async function POST(req: Request) {
  try {
    const { text, source, target } = await req.json();
    if (!text || !source || !target) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const translated = await translateText(text, source, target);
    return NextResponse.json({ translated }, { status: 200 });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
