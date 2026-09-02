/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shift {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  job: string;  // e.g. "BK", "DNA"
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  hours: number;
  notes: string;
  hourlyRate?: number; // Job-specific hourly rate
  earnings?: number;   // Calculated earnings
}

export interface JobConfig {
  name: string;
  hourlyRate: number;
  color: string; // Tailwind color class or hex
}

export interface ConnectionConfig {
  webAppUrl: string;
  lastImported?: string; // Date string
  lastExported?: string; // Date string
}

export interface ImportLog {
  timestamp: string;
  success: boolean;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  skippedDetails: string[];
}
