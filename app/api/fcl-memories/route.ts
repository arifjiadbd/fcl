import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

// তারিখকে ৪ ডিজিটের সালে (যেমন: 8 Sep 2013) রূপান্তর করার ফাংশন
function formatToFourDigitYear(dateVal: any): string {
  if (!dateVal) return "";

  // যদি এক্সেলে আসল Date অবজেক্ট বা সিরিয়াল নাম্বার থাকে
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const day = dateVal.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[dateVal.getMonth()];
    const year = dateVal.getFullYear();
    return `${day} ${month} ${year}`;
  }

  const str = String(dateVal).trim();

  // যদি '8-Sep-13' বা '18-Dec-13' টাইপের টেক্সট হয়
  const parts = str.split(/[-/\s]/);
  if (parts.length === 3) {
    let [day, month, year] = parts;
    if (year.length === 2) {
      const yrNum = parseInt(year, 10);
      year = yrNum >= 0 && yrNum <= 50 ? `20${year}` : `19${year}`;
    }
    return `${day} ${month} ${year}`;
  }

  return str;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "fcl-memories.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "fcl-memories.xlsx file not found in public folder" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

    const formattedData = rawData.map((row, index) => {
      // কী-গুলো কেস-ইনসেনসিটিভ ভাবে রিড করা
      const getVal = (possibleKeys: string[]) => {
        for (const k of Object.keys(row)) {
          if (possibleKeys.some((pk) => pk.toLowerCase() === k.trim().toLowerCase())) {
            return row[k];
          }
        }
        return "";
      };

      const category = getVal(["Category", "ক্যাটাগরি", "cat"]);
      const title = getVal(["Title", "শিরোনাম", "নাম"]);
      const author = getVal(["Author", "লেখক", "পোস্টকারী"]);
      const rawDate = getVal(["Date", "তারিখ", "সময়"]);
      const fbPostUrl = getVal(["FbPostUrl", "FacebookUrl", "FbUrl", "Link", "লিংক"]);
      const content = getVal(["Content", "মূল লেখা", "লেখা", "Text"]);

      return {
        id: index + 1,
        category: String(category || "অন্যান্য").trim(),
        title: String(title || "শিরোনামহীন স্মৃতি").trim(),
        author: String(author || "অজ্ঞাত").trim(),
        date: formatToFourDigitYear(rawDate),
        fbPostUrl: String(fbPostUrl || "").trim(),
        content: String(content || "").trim(),
      };
    });

    return NextResponse.json({ memories: formattedData }, { status: 200 });
  } catch (error: any) {
    console.error("Error reading fcl-memories.xlsx:", error);
    return NextResponse.json({ error: "Failed to parse memories Excel file" }, { status: 500 });
  }
}