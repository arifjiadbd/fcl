import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "fcl-series-data.xlsx");
    const fileBuffer = fs.readFileSync(filePath);

    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(sheet);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error reading series data:", error);
    return NextResponse.json([], { status: 500 });
  }
}