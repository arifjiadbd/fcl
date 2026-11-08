import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwn6-BfO0b2jxco5csvSx7ymSafVPmvbhwKP-2Uh2-COdCDNMNl1VLloEZjR3uh7fonvw/exec";

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      redirect: "follow",
      cache: "no-store",
    });

    const text = await response.text();

    // যদি রেসপন্স খালি বা HTML হয়
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    const data = JSON.parse(text);

    const matches = (data.matches || data.data || []).map((item: any, index: number) => ({
      id: index + 1,
      rowIndex: item.rowIndex || index + 2,
      date: String(item.Date || item.date || "").trim(),
      year: String(item.Year || item.year || "").trim(),
      month: String(item.Month || item.month || "").trim(),
      matchTitle: String(item["Match Title"] || item.matchTitle || "").trim(),
      title: String(item["Match Title"] || item.matchTitle || "").trim(), // ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য
      category: String(item.Category || item.category || "").trim(),
      summary: String(item.Summary || item.summary || "").trim(),
      link: String(item.Link || item.link || "").trim(),
    })).filter((m: any) => m.matchTitle !== "");

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching from Google Sheet:", error);
    return NextResponse.json({ matches: [] }, { status: 200 });
  }
}