import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "fcl-data.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Excel file not found in public folder" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

    const cleanPlayers = rawData.map((r: any) => {
      const matches = Number(r["Total Match"] || 0);
      const wickets = Number(r["Total Wickets"] || 0);

      // Wk Avg. যদি এক্সেলে না পায়, তবে উইকেট ও ম্যাচ থেকে স্বয়ংক্রিয় নিখুঁত হিসাব করবে
      const rawWkAvg = r["Wk Avg."] ?? r["Wk Avg"] ?? r["wk avg."] ?? r["Wk. Avg."];
      const calculatedWkAvg =
        rawWkAvg !== undefined && !isNaN(Number(rawWkAvg))
          ? Number(rawWkAvg)
          : matches > 0
          ? wickets / matches
          : 0;

      const rawRunAvg = r["Run Avg."] ?? r["Run Avg"] ?? r["run avg."];
      const calculatedRunAvg =
        rawRunAvg !== undefined && !isNaN(Number(rawRunAvg))
          ? Number(rawRunAvg)
          : 0;

      return {
        id: Number(r["SL"] || 0),
        nickName: String(r["FCL Player Nick Name"] || "").trim(),
        name: String(r["Full Name"] || "").trim(),
        role: String(r["Player Role"] || "Player").trim(),
        matches: matches,
        runs: Number(r["Total Runs"] || 0),
        wickets: wickets,
        runAvg: Number(calculatedRunAvg.toFixed(2)),
        wkAvg: Number(calculatedWkAvg.toFixed(2)),
        fours: Number(r["Total 4's"] || 0),
        sixes: Number(r["Total 6's"] || 0),
        hatTricks: Number(r["Hat-Trick"] || 0),
        champion: Number(r["Champion"] || 0),
        runnerUp: Number(r["Runner-Up"] || 0),
        lastTournament: String(r["Last Played Tournament"] || "N/A").trim(),
      };
    });

    return NextResponse.json(cleanPlayers);
  } catch (error) {
    console.error("Excel Read Error:", error);
    return NextResponse.json(
      { error: "Failed to read excel data" },
      { status: 500 }
    );
  }
}