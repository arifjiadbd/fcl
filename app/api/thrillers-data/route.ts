import { NextResponse } from "next/server";

// আপনার গুগল শিটের ওয়েব অ্যাপ ইউআরএল
const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzdogXgY3vIhLkn7aBHFXyXzj0UL-s6NmT4GE11Q4fRn3NVA5djiqMzh29E5xxAfnJg/exec";

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      cache: "no-store", // লাইভ ডেটা পাওয়ার জন্য ক্যাশ বন্ধ রাখা হলো
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheets: ${response.statusText}`);
    }

    const data = await response.json();

    // ১. Extraordinary Performance শিট ডেটা প্রসেসিং
    let extraordinaryData: any[] = [];
    if (data.extraordinary && Array.isArray(data.extraordinary)) {
      extraordinaryData = data.extraordinary
        .filter((row: any) => row["Player Name"] || row["Performance Title"])
        .map((row: any) => ({
          rowIndex: row.rowIndex, // এডিট ও ডিলিটের জন্য রো ইনডেক্স
          part: String(row["Part"] ?? row["part"] ?? "").trim(),
          matchYear: String(row["Match Year"] ?? row["matchYear"] ?? "").trim(),
          playerName: String(row["Player Name"] || "").trim(),
          performanceTitle: String(row["Performance Title"] || "").trim(),
          tournamentMatch: String(row["Tournament & Match"] || "").trim(),
          description: String(row["Description"] || "").trim(),
          facebookLink: String(row["Facebook Link"] || "").trim(),
          photo: String(row["Photo"] || "").trim(),
        }));
    }

    // ২. High Voltage Matches শিট ডেটা প্রসেসিং
    let highVoltageData: any[] = [];
    if (data.highVoltage && Array.isArray(data.highVoltage)) {
      highVoltageData = data.highVoltage
        .filter((row: any) => row["Match Title"] || row["Tournament"])
        .map((row: any) => ({
          rowIndex: row.rowIndex, // এডিট ও ডিলিটের জন্য রো ইনডেক্স
          matchTitle: String(row["Match Title"] || "").trim(),
          tournament: String(row["Tournament"] || "").trim(),
          date: String(row["Date"] || "").trim(),
          description: String(row["Description"] || "").trim(),
          facebookLink: String(row["Facebook Link"] || "").trim(),
          thumbnail: String(row["Thumbnail / Photo"] || "").trim(),
        }));
    }

    return NextResponse.json(
      { extraordinary: extraordinaryData, highVoltage: highVoltageData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching from Google Sheets Web App:", error);
    return NextResponse.json({ error: "Failed to fetch live Google Sheets data" }, { status: 500 });
  }
}