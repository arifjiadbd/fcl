import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "fcl-matches.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "fcl-matches.xlsx file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

    const matches = rawData.map((row, index) => ({
      id: index + 1,
      date: String(row["Date"] || "").trim(),
      year: String(row["Year"] || "").trim(),
      month: String(row["Month"] || "").trim(),
      title: String(row["Match Title"] || "").trim(),
      category: String(row["Category"] || "").trim(),
      summary: String(row["Summary"] || "").trim(),
      link: String(row["Link"] || "").trim(),
    })).filter(m => m.title !== "");

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error: any) {
    console.error("Error reading fcl-matches.xlsx:", error);
    return NextResponse.json({ error: "Failed to parse matches excel file" }, { status: 500 });
  }
}