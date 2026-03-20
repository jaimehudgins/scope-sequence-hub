"use client";

import { useState, useCallback } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import { NonInstructionalDay } from "@/types";
import Papa from "papaparse";
import {
  generate2026_27Template,
  generateTemplateCSV,
  downloadCSV,
  downloadExcel,
  detectSchoolYear,
} from "@/utils/calendarTemplates";

type ImportRow = {
  date: string;
  label: string;
  type: NonInstructionalDay["type"];
  isValid: boolean;
  errorMessage?: string;
  action: "keep" | "skip";
};

export default function CalendarUploadModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    nonInstructionalDays,
    setNonInstructionalDays,
    pushSnapshot,
    addToast,
    lessons,
  } = useCalendarContext();

  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [schoolYear, setSchoolYear] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  if (!isOpen) return null;

  const handleDownloadTemplateCSV = () => {
    const template = generate2026_27Template();
    const csv = generateTemplateCSV(template, true);
    downloadCSV(csv, "school-calendar-2026-27-template.csv");
    addToast("📥 Downloaded CSV template for 2026-27");
  };

  const handleDownloadTemplateExcel = async () => {
    const template = generate2026_27Template();
    await downloadExcel(template, "school-calendar-2026-27-template.xlsx");
    addToast("📥 Downloaded Excel template for 2026-27");
  };

  const validateDate = (dateStr: string): boolean => {
    if (!dateStr || dateStr.trim() === "") return false;
    const date = new Date(dateStr + "T12:00:00");
    return !isNaN(date.getTime());
  };

  const processRows = useCallback((rawRows: any[]) => {
    const rows: ImportRow[] = [];

    for (const row of rawRows) {
      const date = row.Date || row.date || "";
      const label = row.Label || row.label || "";
      const type =
        (row.Type || row.type || "other") as NonInstructionalDay["type"];

      // Skip rows with no date or comment rows
      if (!date || date.trim() === "" || String(date).startsWith("#")) continue;

      const isValid = validateDate(date);
      const errorMessage = isValid ? undefined : "Invalid date format";

      rows.push({
        date: date.trim(),
        label: label.trim() || "Imported Event",
        type,
        isValid,
        errorMessage,
        action: isValid ? "keep" : "skip",
      });
    }

    // Sort by date
    rows.sort((a, b) => a.date.localeCompare(b.date));

    setImportData(rows);
    setSchoolYear(detectSchoolYear(rows.map((r) => r.date)));
    setStep("preview");
  }, []);

  const parseCSV = useCallback(
    (file: File) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        comments: "#",
        complete: (results) => {
          processRows(results.data as any[]);
        },
        error: (error) => {
          addToast(`❌ Error parsing CSV: ${error.message}`);
        },
      });
    },
    [addToast, processRows],
  );

  const parseExcel = useCallback(
    async (file: File) => {
      try {
        const XLSX = await import("xlsx");
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        processRows(data);
      } catch (error: any) {
        addToast(`❌ Error parsing Excel: ${error.message}`);
      }
    },
    [addToast, processRows],
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.name.endsWith(".csv")) {
          parseCSV(file);
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          parseExcel(file);
        } else {
          addToast("❌ Please upload a CSV or Excel file");
        }
      }
    },
    [parseCSV, parseExcel, addToast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        if (file.name.endsWith(".csv")) {
          parseCSV(file);
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          parseExcel(file);
        } else {
          addToast("❌ Please upload a CSV or Excel file");
        }
      }
    },
    [parseCSV, parseExcel, addToast],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleRowAction = (index: number) => {
    setImportData((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, action: row.action === "keep" ? "skip" : "keep" }
          : row,
      ),
    );
  };

  const handleImport = () => {
    const rowsToImport = importData.filter((row) => row.action === "keep");

    if (rowsToImport.length === 0) {
      addToast("⚠️ No dates selected to import");
      return;
    }

    const newDays: NonInstructionalDay[] = rowsToImport.map((row) => ({
      date: row.date,
      label: row.label,
      type: row.type,
    }));

    // Check for duplicates
    const existingDates = new Set(nonInstructionalDays.map((d) => d.date));
    const uniqueNewDays = newDays.filter((d) => !existingDates.has(d.date));
    const duplicateCount = newDays.length - uniqueNewDays.length;

    pushSnapshot(`Imported ${uniqueNewDays.length} non-instructional days`);
    setNonInstructionalDays([...nonInstructionalDays, ...uniqueNewDays]);

    const message =
      duplicateCount > 0
        ? `📅 Imported ${uniqueNewDays.length} days (${duplicateCount} duplicates skipped)`
        : `📅 Imported ${uniqueNewDays.length} non-instructional days`;

    addToast(message);
    handleClose();
  };

  const handleClose = () => {
    setStep("upload");
    setImportData([]);
    setSchoolYear("");
    onClose();
  };

  const validRowCount = importData.filter((r) => r.action === "keep").length;
  const conflictCount = importData.filter((row) => {
    if (row.action !== "keep") return false;
    return lessons.some((l) => l.scheduledDate === row.date);
  }).length;

  const typeBreakdown = importData
    .filter((r) => r.action === "keep")
    .reduce(
      (acc, row) => {
        const type = row.type || "other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200] flex items-center justify-center animate-[fade-in_0.15s_ease]"
      onClick={handleClose}
    >
      <div
        className="w-[700px] max-h-[85vh] bg-surface rounded-2xl shadow-xl flex flex-col overflow-hidden animate-[fade-in_0.15s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-serif text-[20px] font-semibold text-text">
              📅 Import School Calendar
            </h2>
            <p className="text-[13px] text-text-muted mt-[2px]">
              {step === "upload"
                ? "Upload non-instructional days for the school year"
                : `Preview - ${schoolYear} School Year`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-[30px] h-[30px] rounded-lg border border-border bg-surface cursor-pointer text-[14px] flex items-center justify-center text-text-muted hover:bg-bg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "upload" ? (
            <>
              {/* Download Template */}
              <div className="bg-green-25 border border-green-200 rounded-lg p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="text-[24px]">📥</div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-green-900 mb-1">
                      Start with our pre-filled template
                    </div>
                    <div className="text-[13px] text-green-900 mb-3 opacity-80">
                      Download a template with federal holidays for 2026-27
                      already included. Add your district-specific dates and
                      upload.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadTemplateExcel}
                        className="px-4 py-2 bg-green-700 text-white rounded-lg text-[13px] font-semibold hover:bg-green-800 transition-colors"
                      >
                        📥 Download Excel
                      </button>
                      <button
                        onClick={handleDownloadTemplateCSV}
                        className="px-4 py-2 bg-surface border border-green-700 text-green-900 rounded-lg text-[13px] font-semibold hover:bg-green-50 transition-colors"
                      >
                        📥 Download CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="mb-5">
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Upload Your Calendar
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? "border-green-700 bg-green-25"
                      : "border-border bg-bg hover:bg-neutral-50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() =>
                    document.getElementById("csv-upload")?.click()
                  }
                >
                  <div className="text-[32px] mb-2">📤</div>
                  <div className="text-[14px] font-medium text-text mb-1">
                    Drag & drop your CSV or Excel file here
                  </div>
                  <div className="text-[13px] text-text-muted">
                    or click to browse
                  </div>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Format Guide */}
              <div className="bg-bg rounded-lg border border-border p-4">
                <div className="text-[12px] font-semibold text-text mb-2">
                  Required Format (CSV or Excel):
                </div>
                <div className="bg-surface rounded border border-border p-3 font-mono text-[11px] text-text-muted">
                  Date,Label,Type
                  <br />
                  2026-09-07,Labor Day,holiday
                  <br />
                  2026-10-10,PD Day,pd
                  <br />
                  2026-11-26,Thanksgiving,holiday
                </div>
                <div className="text-[11px] text-text-muted mt-2">
                  <strong>Types:</strong> holiday, pd, testing, conference,
                  school-closed, other
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-bg rounded-lg border border-border p-4 mb-4">
                <div className="text-[13px] font-semibold text-text mb-2">
                  Import Summary
                </div>
                <div className="flex gap-4 text-[12px]">
                  <div>
                    <span className="text-text-muted">Total dates:</span>{" "}
                    <span className="font-semibold text-text">
                      {validRowCount}
                    </span>
                  </div>
                  {Object.entries(typeBreakdown).map(([type, count]) => (
                    <div key={type}>
                      <span className="text-text-muted capitalize">
                        {type}:
                      </span>{" "}
                      <span className="font-semibold text-text">{count}</span>
                    </div>
                  ))}
                </div>
                {conflictCount > 0 && (
                  <div className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
                    ⚠️ {conflictCount} date{conflictCount !== 1 ? "s" : ""} have
                    scheduled lessons (will cascade when imported)
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-y-auto max-h-[400px]">
                  <table className="w-full text-[12px]">
                    <thead className="bg-neutral-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-text-muted">
                          <input
                            type="checkbox"
                            checked={
                              importData.filter((r) => r.action === "keep")
                                .length === importData.length
                            }
                            onChange={(e) => {
                              const newAction = e.target.checked
                                ? "keep"
                                : "skip";
                              setImportData((prev) =>
                                prev.map((row) => ({ ...row, action: newAction })),
                              );
                            }}
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-text-muted uppercase tracking-[0.5px] text-[10px]">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-text-muted uppercase tracking-[0.5px] text-[10px]">
                          Label
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-text-muted uppercase tracking-[0.5px] text-[10px]">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-text-muted uppercase tracking-[0.5px] text-[10px]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.map((row, index) => {
                        const hasConflict = lessons.some(
                          (l) => l.scheduledDate === row.date,
                        );
                        const isDuplicate = nonInstructionalDays.some(
                          (d) => d.date === row.date,
                        );

                        return (
                          <tr
                            key={index}
                            className={`border-t border-border-light ${
                              row.action === "skip"
                                ? "opacity-40"
                                : hasConflict
                                  ? "bg-yellow-25"
                                  : ""
                            }`}
                          >
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={row.action === "keep"}
                                onChange={() => toggleRowAction(index)}
                                disabled={!row.isValid}
                                className="cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2 font-medium text-text">
                              {new Date(
                                row.date + "T12:00:00",
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-3 py-2 text-text">
                              {row.label}
                            </td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-1 bg-neutral-50 rounded text-[11px] text-text-muted capitalize">
                                {row.type}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[11px]">
                              {!row.isValid ? (
                                <span className="text-red-600">
                                  ⚠️ Invalid
                                </span>
                              ) : isDuplicate ? (
                                <span className="text-yellow-700">
                                  Duplicate
                                </span>
                              ) : hasConflict ? (
                                <span className="text-yellow-700">
                                  Has lessons
                                </span>
                              ) : (
                                <span className="text-green-700">✓ Ready</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-neutral-50">
          <button
            onClick={handleClose}
            className="px-4 py-[8px] rounded-lg border border-border text-[13px] font-medium text-text-muted hover:bg-bg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {step === "preview" && (
            <button
              onClick={handleImport}
              disabled={validRowCount === 0}
              className="px-5 py-[8px] rounded-lg bg-text text-white text-[13px] font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import {validRowCount} Date{validRowCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
