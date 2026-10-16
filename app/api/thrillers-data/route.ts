import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "fcl-thrillers.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "fcl-thrillers.xlsx file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // ১. Extraordinary Performance শিট
    let extraordinaryData: any[] = [];
    const extraSheetName = workbook.SheetNames.find(
      (name) => name.toLowerCase().includes("extraordinary") || name.toLowerCase().includes("performance")
    ) || workbook.SheetNames[0];
    
    if (extraSheetName) {
      const sheet = workbook.Sheets[extraSheetName];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet);
      extraordinaryData = rawData
        .filter((row) => row["Player Name"] || row["Performance Title"])
        .map((row) => ({
          playerName: String(row["Player Name"] || "").trim(),
          performanceTitle: String(row["Performance Title"] || "").trim(),
          tournamentMatch: String(row["Tournament & Match"] || "").trim(),
          description: String(row["Description"] || "").trim(),
          facebookLink: String(row["Facebook Link"] || "").trim(),
          photo: String(row["Photo"] || "").trim(),
        }));
    }

    // ২. High Voltage Matches শিট
    let highVoltageData: any[] = [];
    const highSheetName = workbook.SheetNames.find(
      (name) => name.toLowerCase().includes("high voltage") || name.toLowerCase().includes("matches")
    ) || workbook.SheetNames[1];

    if (highSheetName && workbook.SheetNames.includes(highSheetName)) {
      const sheet = workbook.Sheets[highSheetName];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet);
      highVoltageData = rawData
        .filter((row) => row["Match Title"] || row["Tournament"])
        .map((row) => ({
          matchTitle: String(row["Match Title"] || "").trim(),
          tournament: String(row["Tournament"] || "").trim(),
          date: String(row["Date"] || "").trim(),
          description: String(row["Description"] || "").trim(),
          facebookLink: String(row["Facebook Link"] || "").trim(),
          thumbnail: String(row["Thumbnail / Photo"] || "").trim(),
        }));
    }

    return NextResponse.json({ extraordinary: extraordinaryData, highVoltage: highVoltageData }, { status: 200 });
  } catch (error: any) {
    console.error("Error reading fcl-thrillers.xlsx:", error);
    return NextResponse.json({ error: "Failed to parse excel file" }, { status: 500 });
  }
}