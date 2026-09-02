/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shift, JobConfig } from "../types";

// Helper to find a column index using aliases (case-insensitive)
export function findColumnIndex(headers: string[], aliases: string[]): number {
  const normalized = headers.map(h => String(h).trim().toLowerCase());
  
  // 1. Exact or direct match
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias.toLowerCase());
    if (idx !== -1) return idx;
  }
  
  // 2. Partial match
  for (const alias of aliases) {
    const idx = normalized.findIndex(h => h.includes(alias.toLowerCase()));
    if (idx !== -1) return idx;
  }
  
  return -1;
}

// Parse dates of various formats
export function parseDateCell(val: any): string | null {
  if (val === undefined || val === null || val === "") return null;

  // If it is a JS date or an ISO-8601 string
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }

  const strVal = String(val).trim();

  // Try parsing ISO date format (e.g., 2026-06-16)
  if (/^\d{4}-\d{2}-\d{2}/.test(strVal)) {
    return strVal.substring(0, 10);
  }

  // Handle standard "16-Jun" or "16-Jun-2026" or "16 Jun 2026"
  const wordMonthMatch = strVal.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,9})(?:[-/ ](\d{2,4}))?$/);
  if (wordMonthMatch) {
    const day = parseInt(wordMonthMatch[1], 10);
    const monthStr = wordMonthMatch[2].toLowerCase().substring(0, 3);
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    if (months[monthStr] !== undefined) {
      const month = months[monthStr];
      // Default to current year if not specified
      let year = wordMonthMatch[3] ? parseInt(wordMonthMatch[3], 10) : new Date().getFullYear();
      if (year < 100) year += 2000; // standard 2-digit year conversion
      
      // Create date safely in local timezone
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }
  }

  // Handle formatted MM/DD/YYYY or DD/MM/YYYY fallback
  const datePartsMatch = strVal.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (datePartsMatch) {
    const part1 = parseInt(datePartsMatch[1], 10);
    const part2 = parseInt(datePartsMatch[2], 10);
    let year = parseInt(datePartsMatch[3], 10);
    if (year < 100) year += 2000;

    // We can try to resolve whether it's US format (MM/DD) or international (DD/MM).
    // If part1 > 12, it must be DD/MM. If part2 > 12, it must be MM/DD.
    let month = part1 - 1;
    let day = part2;
    if (part1 > 12) {
      month = part2 - 1;
      day = part1;
    }

    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  // Handle Excel / Google Sheets Serial Date Number
  const numVal = Number(strVal);
  if (!isNaN(numVal) && numVal > 30000 && numVal < 60000) {
    // 25569 is Excel base offset for JS epoch, 86400 seconds in a day
    const date = new Date((numVal - 25569) * 86400000);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  // Direct Date.parse try
  const timestamp = Date.parse(strVal);
  if (!isNaN(timestamp)) {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return null;
}

// Parse times of various formats (returns "HH:MM")
export function parseTimeCell(val: any): string | null {
  if (val === undefined || val === null || val === "") return null;

  // If Google Sheets returns a full ISO string (e.g. 1899-12-30T17:00:00.000Z)
  const strVal = String(val).trim();
  if (strVal.includes("T")) {
    const date = new Date(strVal);
    if (!isNaN(date.getTime())) {
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }
  }

  // If it is a string representation like "17:00" or "07:30"
  const timeMatch = strVal.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2];
    const ampm = timeMatch[4];
    
    if (ampm) {
      if (ampm.toUpperCase() === "PM" && h < 12) h += 12;
      if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
    }
    
    return `${String(h).padStart(2, "0")}:${m}`;
  }

  // Handle serial fractional day format (e.g. 17:00 is 17/24 = 0.708333)
  const numVal = Number(strVal);
  if (!isNaN(numVal) && numVal >= 0 && numVal < 1) {
    const totalMinutes = Math.round(numVal * 24 * 60);
    const h = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const m = String(totalMinutes % 60).padStart(2, "0");
    return `${h}:${m}`;
  }

  return null;
}

// Calculate duration in hours between start and end "HH:MM"
export function calculateShiftHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  
  let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
  
  if (diffMinutes <= 0) {
    // Crosses midnight, add 24 hours
    diffMinutes += 24 * 60;
  }
  
  return Math.round((diffMinutes / 60) * 100) / 100;
}

// Main parser to convert Google Apps Script output to Shift objects
export function parseShiftsFromSheet(
  headers: string[],
  rows: any[][],
  jobConfigs: JobConfig[]
): { shifts: Shift[]; skippedDetails: string[]; successCount: number } {
  const shifts: Shift[] = [];
  const skippedDetails: string[] = [];
  let successCount = 0;

  // Find column indices
  const dateIdx = findColumnIndex(headers, ["date", "shift date", "day", "when"]);
  const jobIdx = findColumnIndex(headers, ["job", "role", "employer", "company", "workplace"]);
  const startIdx = findColumnIndex(headers, ["start", "start time", "check in", "in"]);
  const endIdx = findColumnIndex(headers, ["end", "end time", "check out", "out"]);
  const hoursIdx = findColumnIndex(headers, ["hours", "hours worked", "duration", "total hours"]);
  const notesIdx = findColumnIndex(headers, ["notes", "description", "comments", "memo"]);

  if (dateIdx === -1 || jobIdx === -1) {
    skippedDetails.push("Missing core headers: Date and/or Job columns could not be identified.");
    return { shifts, skippedDetails, successCount: 0 };
  }

  rows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 2; // Row number in sheet (header is row 1)
    
    // Core check: is row empty or are basic values missing?
    const rawDate = row[dateIdx];
    const rawJob = row[jobIdx];

    if (rawDate === undefined || rawDate === null || String(rawDate).trim() === "") {
      skippedDetails.push(`Row ${rowNum}: Skipped because 'Date' is empty.`);
      return;
    }
    if (rawJob === undefined || rawJob === null || String(rawJob).trim() === "") {
      skippedDetails.push(`Row ${rowNum}: Skipped because 'Job' is empty.`);
      return;
    }

    // Parse values robustly
    const parsedDate = parseDateCell(rawDate);
    if (!parsedDate) {
      skippedDetails.push(`Row ${rowNum}: Skipped because 'Date' ("${rawDate}") could not be parsed.`);
      return;
    }

    const job = String(rawJob).trim();

    const rawStart = startIdx !== -1 ? row[startIdx] : "";
    const rawEnd = endIdx !== -1 ? row[endIdx] : "";
    
    const parsedStart = parseTimeCell(rawStart) || "09:00"; // default if missing
    const parsedEnd = parseTimeCell(rawEnd) || "17:00";     // default if missing

    // Parse hours: try to use sheets value, fallback to calculation
    let hours = 0;
    const rawHours = hoursIdx !== -1 ? row[hoursIdx] : null;
    if (rawHours !== undefined && rawHours !== null && String(rawHours).trim() !== "") {
      hours = parseFloat(String(rawHours));
    }
    
    if (isNaN(hours) || hours <= 0) {
      hours = calculateShiftHours(parsedStart, parsedEnd);
    }

    const notes = notesIdx !== -1 && row[notesIdx] !== undefined && row[notesIdx] !== null
      ? String(row[notesIdx]).trim()
      : "";

    // Find custom rate if exists
    const jobConfig = jobConfigs.find(jc => jc.name.toLowerCase() === job.toLowerCase());
    const hourlyRate = jobConfig ? jobConfig.hourlyRate : 15; // default $15/hr if not matched
    const earnings = parseFloat((hours * hourlyRate).toFixed(2));

    shifts.push({
      id: `${parsedDate}_${job}_${parsedStart.replace(":", "")}`,
      date: parsedDate,
      job,
      start: parsedStart,
      end: parsedEnd,
      hours,
      notes,
      hourlyRate,
      earnings
    });

    successCount++;
  });

  return { shifts, skippedDetails, successCount };
}
