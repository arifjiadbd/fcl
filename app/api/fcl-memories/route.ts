import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZNDIubu-4Z7Cwc2s_giPUMa4-XEcw-ejMEdwHjbEXnCLqdyHsKOLoRKk2zX09b5hgdg/exec";

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      redirect: "follow",
      cache: "no-store",
    });

    const text = await response.text();

    // যদি রেসপন্স খালি বা HTML হয়
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      return NextResponse.json({ memories: [] }, { status: 200 });
    }

    const data = JSON.parse(text);
    
    const formattedData = (data.memories || []).map((item: any, index: number) => ({
      rowIndex: item.rowIndex || index + 2,
      id: index + 1,
      category: String(item.category || "অন্যান্য").trim(),
      title: String(item.title || "শিরোনামহীন স্মৃতি").trim(),
      author: String(item.author || "অজ্ঞাত").trim(),
      date: String(item.date || "").trim(),
      fbPostUrl: String(item.fbPostUrl || "").trim(),
      content: String(item.content || "").trim(),
    }));

    return NextResponse.json({ memories: formattedData }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching from Google Sheet:", error);
    return NextResponse.json({ memories: [] }, { status: 200 });
  }
}