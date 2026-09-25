import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

function formatExcelDate(val: any): string {
  if (!val) return "";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[val.getMonth()]} ${val.getFullYear()}`;
  }
  const str = String(val).trim();
  const strNum = parseFloat(str);
  if (!isNaN(strNum) && strNum > 20000 && strNum < 60000) {
    const utcDays = Math.floor(strNum - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  return str.slice(0, 10);
}

function getRowValue(row: any, ...targetKeys: string[]): string {
  for (const k of targetKeys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
      return String(row[k]).trim();
    }
  }
  const normalizedTargets = targetKeys.map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const actualKey of Object.keys(row)) {
    const norm = actualKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedTargets.includes(norm)) {
      return String(row[actualKey]).trim();
    }
  }
  return "";
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "fcl-data.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "fcl-data.xlsx file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // ১. Overall শিট
    const overallSheetName = workbook.SheetNames.includes("Overall") ? "Overall" : workbook.SheetNames[0];
    const overallSheet = workbook.Sheets[overallSheetName];
    const rawOverall: any[] = XLSX.utils.sheet_to_json(overallSheet);

    const players = rawOverall
      .filter((row) => row["Full Name"] || row["FCL Player Nick Name"])
      .map((row, index) => {
        const matches = Number(row["Total Match"]) || 0;
        const runs = Number(row["Total Runs"]) || 0;
        const wickets = Number(row["Total Wickets"]) || 0;
        const innings = Number(row["Innings"]) || 0;
        const notOut = Number(row["Not Out"]) || 0;

        // 🌟 বোলিং এভারেজ স্মার্ট কনভার্সন (কখনোই 0.00 হবে না)
        const rawWk = getRowValue(row, "Wk Avg.", "Wk Avg", "Bowling Avg", "Wicket Avg");
        let wkAvg = "0.00";
        if (rawWk && !isNaN(Number(rawWk)) && Number(rawWk) > 0) {
          wkAvg = Number(rawWk).toFixed(2);
        } else if (matches > 0 && wickets > 0) {
          wkAvg = (wickets / matches).toFixed(2);
        }

        // ব্যাটিং এভারেজ
        const rawRun = getRowValue(row, "Run Avg.", "Run Avg", "Batting Avg");
        let runAvg = "0.00";
        if (rawRun && !isNaN(Number(rawRun)) && Number(rawRun) > 0) {
          runAvg = Number(rawRun).toFixed(2);
        } else if (runs > 0) {
          const dismissals = innings - notOut;
          runAvg = (dismissals > 0 ? runs / dismissals : runs / (innings || 1)).toFixed(2);
        }

        return {
          id: index + 1,
          name: String(row["Full Name"] || "").trim(),
          nickName: String(row["FCL Player Nick Name"] || "").trim(),
          role: String(row["Player Role"] || "All-Rounder").trim(),
          totalTournament: Number(row["Total Tournament"]) || 0,
          matches,
          runs,
          wickets,
          innings,
          notOut,
          fours: Number(row["Total 4's"]) || 0,
          sixes: Number(row["Total 6's"]) || 0,
          hatTricks: Number(row["Hat-Trick"]) || 0,
          mom: Number(row["MOM (Man Of The Match)"]) || 0,
          cpom: Number(row["CPOM (T (Cool Player Of The Match) 2nd Position Of MOM"]) || 0,
          mot: Number(row["MOT (Man Of The Tournament)"]) || 0,
          cpot: Number(row["CPOT (Cool Player Of The Tournament) 2nd Position Of MOT"]) || 0,
          champion: Number(row["Champion"]) || 0,
          runnersUp: Number(row["Runner-Up"]) || 0,
          totalFinal: Number(row["Total Final"]) || 0,
          lastPlayed: getRowValue(row, "Last Played Tournament", "Last Played") || "—",
          highestRunScorer: Number(row["Highest Run Scorer"]) || 0,
          topWicketTaker: Number(row["Top Wicket Taker"]) || 0,
          debutYear: formatExcelDate(getRowValue(row, "Dabut Year (Month/Year)", "Debut Year", "Debut Date")),
          debutTournament: getRowValue(row, "Dabut Tournament:", "Dabut Tournament", "Debut Tournament:", "Debut Tournament") || "—",
          debutTeam: getRowValue(row, "Dabut Team Name", "Debut Team Name", "Debut Team") || "—",
          maxRuns: Number(row["Max Runs In Tournament"]) || 0,
          maxWickets: Number(row["Max Wickets In Tournament"]) || 0,
          runAvg,
          wkAvg,
        };
      });

    // ২. Tournaments শিট
    let tournamentsData: any[] = [];
    if (workbook.SheetNames.includes("Tournaments")) {
      const tourSheet = workbook.Sheets["Tournaments"];
      const rawTour: any[] = XLSX.utils.sheet_to_json(tourSheet);

      tournamentsData = rawTour
        .filter((row) => row["PLAYERS"] || row["Name"])
        .map((row) => ({
          name: String(row["Name"] || "").trim(),
          playerName: String(row["PLAYERS"] || "").trim(),
          tournament: String(row["TOURNAMENT"] || "").trim(),
          team: String(row["Team Name Of The Player"] || "").trim(),
          matches: Number(row["M"]) || 0,
          runs: Number(row["RUN"]) || 0,
          wickets: Number(row["W"]) || 0,
          innings: Number(row["IN"]) || 0,
          notOut: Number(row["NO"]) || 0,
          fours: Number(row["4's"]) || 0,
          sixes: Number(row["6's"]) || 0,
          hatTrick: Number(row["Hat-Trick"]) || 0,
          mom: Number(row["MOM"]) || 0,
          cpom: Number(row["CPOM/SAPOM"]) || 0,
          motCpot: String(row["MOT/CPOT"] || "").trim(),
          chamRu: String(row["Cham/RU"] || "").trim(),
          time: formatExcelDate(row["TOURNAMENT TIME (Month-Year)"]),
          topScorer: Number(row["TOP SCORER"]) || 0,
          topWicket: Number(row["TOP WICKET"]) || 0,
        }));
    }

    return NextResponse.json({ players, tournaments: tournamentsData }, { status: 200 });
  } catch (error: any) {
    console.error("Error reading fcl-data.xlsx:", error);
    return NextResponse.json({ error: "Failed to parse excel file" }, { status: 500 });
  }
}