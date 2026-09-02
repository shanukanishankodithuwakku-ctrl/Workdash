import React from "react";
import { FileSpreadsheet } from "lucide-react";

interface SetupProps {
  onCopy: () => void;
}

export const SetupGuide: React.FC<SetupProps> = ({ onCopy }) => {
  return (
    <div id="apps-script-instructions" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <FileSpreadsheet className="w-5.5 h-5.5 text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-100 font-sans uppercase">Setup Guide: Deploy Your Connected Google Sheet Backend</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          To enable automated 2-way sync with your personal rosters, deploy a Google Apps Script linked to your active spreadsheet.
          Follow these simple steps:
        </p>

        <div className="space-y-4 text-xs mb-6">
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-bold text-indigo-400 border border-slate-850 text-[10px] shrink-0 font-mono">1</div>
            <div>
              <p className="font-bold text-slate-200">Create Sheet</p>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Create a Google Sheet and name your active rosters tab <code className="text-indigo-300 font-mono bg-slate-950 px-1 py-0.5 rounded text-[11px]">WorkDash Import</code> with headers: Date, Job, Start, End, Hours, Notes.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-bold text-indigo-400 border border-slate-850 text-[10px] shrink-0 font-mono">2</div>
            <div>
              <p className="font-bold text-slate-200">Open Script Editor</p>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Click <strong className="text-slate-300 font-sans">Extensions &gt; Apps Script</strong> inside Google Sheets, clean out the script editor, and paste the code below.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-bold text-indigo-400 border border-slate-850 text-[10px] shrink-0 font-mono">3</div>
            <div>
              <p className="font-bold text-slate-200">Deploy as Web App</p>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Tap <strong className="text-slate-300 font-sans">Deploy &gt; New Deployment</strong>, choose "Web app", configure Execute as: "Me", Who has access: "Anyone", copy the Web App URL, and paste it into WorkDash.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apps Script code codebox */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">google_apps_script.js</span>
          <button 
            onClick={onCopy}
            className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white transition text-slate-300 rounded-md"
          >
            Copy Script Code
          </button>
        </div>
        <pre className="text-[10px] text-slate-500 font-mono overflow-x-auto p-1 leading-relaxed max-h-48">
{`const PUSH_SHEET = "WorkDash Export";
const IMPORT_SHEET = "WorkDash Import";

// Called by WorkDash to WRITE shifts into your sheet
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(PUSH_SHEET);
    if (!sheet) sheet = ss.insertSheet(PUSH_SHEET);
    
    sheet.clear();
    sheet.appendRow(payload.headers);
    payload.rows.forEach(row => sheet.appendRow(row));
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, rowsWritten: payload.rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Called by WorkDash to READ shifts from your sheet
function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(IMPORT_SHEET);
    if (!sheet) throw new Error("Roster tab 'WorkDash Import' was not found.");
    
    const values = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify({ status: "success", headers: values[0] || [], rows: values.slice(1) }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
        </pre>
      </div>

    </div>
  );
};
