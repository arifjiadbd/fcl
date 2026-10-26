import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZNDIubu-4Z7Cwc2s_giPUMa4-XEcw-ejMEdwHjbEXnCLqdyHsKOLoRKk2zX09b5hgdg/exec";

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();
    
    const formattedData = (data.memories || []).map((item, index) => ({
      id: index + 1,
      category: String(item.category || "অন্যান্য").trim(),
      title: String(item.title || "শিরোনামহীন স্মৃতি").trim(),
      author: String(item.author || "অজ্ঞাত").trim(),
      date: String(item.date || "").trim(),
      fbPostUrl: String(item.fbPostUrl || "").trim(),
      content: String(item.content || "").trim(),
    }));

    return NextResponse.json({ memories: formattedData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching from Google Sheet:", error);
    return NextResponse.json({ error: "Failed to fetch memories from Google Sheet" }, { status: 500 });
  }
}