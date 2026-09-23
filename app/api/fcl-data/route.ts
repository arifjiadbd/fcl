import { NextResponse } from "next/server";
import path from "path";
import * as xlsx from "xlsx";
import fs from "fs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "fcl-data.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Excel file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    // cellDates এবং raw সেটিং দিয়ে ডেট নিখুঁতভাবে টেক্সটে আনা
    const workbook = xlsx.read(fileBuffer, { type: "buffer", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData: any[] = xlsx.utils.sheet_to_json(sheet, { raw: false });

    const players = rawData.map((row, index) => {
      // যেকোনো ফরম্যাটে কলাম নাম ম্যাচ করার হেল্পার
      const findKey = (candidates: string[]) => {
        const rowKeys = Object.keys(row);
        for (const c of candidates) {
          const cleanC = c.toLowerCase().replace(/[^a-z0-9]/g, "");
          const found = rowKeys.find(
            (k) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanC
          );
          if (found && row[found] !== undefined && row[found] !== null && row[found] !== "") {
            return row[found];
          }
        }
        return undefined;
      };

      const getNum = (candidates: string[]) => {
        const val = findKey(candidates);
        if (val === undefined || val === null || val === "") return 0;
        const num = Number(String(val).replace(/,/g, ""));
        return isNaN(num) ? 0 : num;
      };

      const getStr = (candidates: string[]) => {
        const val = findKey(candidates);
        if (val === undefined || val === null) return "";
        return String(val).trim();
      };

      // এক্সেলের সিরিয়াল ডেট (যেমন 41334) কে সুন্দর তারিখে রূপান্তর
      const formatExcelDate = (val: string) => {
        if (!val) return "—";
        const num = Number(val);
        if (!isNaN(num) && num > 20000 && num < 60000) {
          const date = new Date(Math.round((num - 25569) * 86400 * 1000));
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return `${months[date.getUTCMonth()]}-${String(date.getUTCFullYear()).slice(-2)}`;
        }
        return val;
      };

      const name = getStr(["Full Name", "Name"]) || `Player ${index + 1}`;
      const nickName = getStr(["FCL Player Nick Name", "Nick Name"]);
      const role = getStr(["Player Role", "Role"]) || "All-Rounder";

      const totalTournament = getNum(["Total Tournament"]);
      const matches = getNum(["Total Match"]);
      const runs = getNum(["Total Runs"]);
      const wickets = getNum(["Total Wickets"]);
      const innings = getNum(["Innings"]);
      const notOut = getNum(["Not Out"]);

      const fours = getNum(["Total 4's", "Total 4s"]);
      const sixes = getNum(["Total 6's", "Total 6s"]);
      const hatTricks = getNum(["Hat-Trick", "Hat Trick"]);

      const mom = getNum(["MOM (Man Of The Match)", "MOM"]);
      const cpom = getNum(["CPOM (T (Cool Player Of The Match) 2nd Position Of MOM", "CPOM", "CPOM/SAPOM"]);
      const mot = getNum(["MOT (Man Of The Tournament)", "MOT"]);
      const cpot = getNum(["CPOT (Cool Player Of The Tournament) 2nd Position Of MOT", "CPOT"]);

      const champion = getNum(["Champion"]);
      const runnersUp = getNum(["Runner-Up", "Runners-Up"]);
      const totalFinal = getNum(["Total Final"]);

      const lastPlayed = getStr(["Last Played Tournament"]);
      const highestRunScorer = getNum(["Highest Run Scorer"]);
      const topWicketTaker = getNum(["Top Wicket Taker"]);

      // Debut সংক্রান্ত কলামগুলো
      const rawDebutYear = getStr(["Dabut Year (Month/Year)", "Debut Year", "Dabut Year"]);
      const debutYear = formatExcelDate(rawDebutYear);
      const debutTournament = getStr(["Dabut Tournament:", "Dabut Tournament", "Debut Tournament"]);
      const debutTeam = getStr(["Dabut Team Name", "Debut Team Name"]);
      const maxRuns = getNum(["Max Runs In Tournament", "Max Runs"]);
      const maxWickets = getNum(["Max Wickets In Tournament", "Max Wickets"]);

      // Run Avg & Wk Avg (এক্সেলে যা লেখা আছে হুবহু ২ দশমিক ঘরে)
      const formatAvg = (val: any, fallbackNum: number) => {
        const num = Number(val);
        if (!isNaN(num) && num > 0) return num.toFixed(2);
        if (fallbackNum > 0) return fallbackNum.toFixed(2);
        return "0.00";
      };

      const rawRunAvg = findKey(["Run Avg.", "Run Avg", "Bat Avg"]);
      const rawWkAvg = findKey(["Wk Avg.", "Wk Avg", "Bowl Avg"]);

      const runAvg = formatAvg(rawRunAvg, matches > 0 ? runs / matches : 0);
      const wkAvg = formatAvg(rawWkAvg, wickets > 0 ? runs / wickets : 0);

      return {
        id: index + 1,
        name,
        nickName,
        role,
        totalTournament,
        matches,
        runs,
        wickets,
        innings,
        notOut,
        fours,
        sixes,
        hatTricks,
        mom,
        cpom,
        mot,
        cpot,
        champion,
        runnersUp,
        totalFinal,
        lastPlayed,
        highestRunScorer,
        topWicketTaker,
        debutYear,
        debutTournament,
        debutTeam,
        maxRuns,
        maxWickets,
        runAvg,
        wkAvg,
      };
    });

    return NextResponse.json({ players });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}