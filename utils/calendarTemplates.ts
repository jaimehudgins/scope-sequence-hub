import { NonInstructionalDay } from "@/types";

/**
 * Generate a pre-filled calendar template for a school year with federal holidays.
 * 2026-27 School Year: August 2026 - June 2027
 */
export function generate2026_27Template(): NonInstructionalDay[] {
  return [
    // Fall 2026
    {
      date: "2026-09-07",
      label: "Labor Day",
      type: "holiday",
    },
    {
      date: "2026-11-26",
      label: "Thanksgiving",
      type: "holiday",
    },
    {
      date: "2026-11-27",
      label: "Thanksgiving Break",
      type: "holiday",
    },
    // Winter Break 2026-27
    {
      date: "2026-12-23",
      label: "Winter Break",
      type: "holiday",
    },
    {
      date: "2026-12-24",
      label: "Winter Break",
      type: "holiday",
    },
    {
      date: "2026-12-25",
      label: "Christmas Day",
      type: "holiday",
    },
    {
      date: "2026-12-28",
      label: "Winter Break",
      type: "holiday",
    },
    {
      date: "2026-12-29",
      label: "Winter Break",
      type: "holiday",
    },
    {
      date: "2026-12-30",
      label: "Winter Break",
      type: "holiday",
    },
    {
      date: "2026-12-31",
      label: "Winter Break",
      type: "holiday",
    },
    {
      date: "2027-01-01",
      label: "New Year's Day",
      type: "holiday",
    },
    // Spring 2027
    {
      date: "2027-01-18",
      label: "Martin Luther King Jr. Day",
      type: "holiday",
    },
    {
      date: "2027-02-15",
      label: "Presidents Day",
      type: "holiday",
    },
    {
      date: "2027-05-31",
      label: "Memorial Day",
      type: "holiday",
    },
  ];
}

/**
 * Convert NonInstructionalDay array to CSV string
 */
export function generateTemplateCSV(
  days: NonInstructionalDay[],
  includeInstructions: boolean = true,
): string {
  const headers = ["Date", "Label", "Type"];

  let csv = headers.join(",") + "\n";

  // Add pre-filled federal holidays
  for (const day of days) {
    csv += `${day.date},"${day.label}",${day.type}\n`;
  }

  // Add blank rows with instructions for common additions
  if (includeInstructions) {
    csv += "\n# Add your district-specific dates below:\n";
    csv += "# Format: YYYY-MM-DD,Label,Type\n";
    csv += "# Types: holiday, pd, testing, conference, school-closed, other\n";
    csv += "\n";
    csv += "# Professional Development Days:\n";
    csv += ",Add PD days here,pd\n";
    csv += "\n";
    csv += "# Testing Days:\n";
    csv += ",Add testing days here,testing\n";
    csv += "\n";
    csv += "# Spring Break (adjust dates for your district):\n";
    csv += "2027-04-05,Spring Break,holiday\n";
    csv += "2027-04-06,Spring Break,holiday\n";
    csv += "2027-04-07,Spring Break,holiday\n";
    csv += "2027-04-08,Spring Break,holiday\n";
    csv += "2027-04-09,Spring Break,holiday\n";
  }

  return csv;
}

/**
 * Download a CSV file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download an Excel file
 */
export async function downloadExcel(
  days: NonInstructionalDay[],
  filename: string,
) {
  const XLSX = await import("xlsx");

  // Create worksheet data
  const wsData = [
    ["Date", "Label", "Type"],
    ...days.map((day) => [day.date, day.label, day.type]),
    // Add empty rows with instructions
    [],
    ["# Add your district-specific dates below:"],
    ["# Format: YYYY-MM-DD, Label, Type"],
    [
      "# Types: holiday, pd, testing, conference, school-closed, other",
    ],
    [],
    ["# Professional Development Days:"],
    ["", "Add PD days here", "pd"],
    [],
    ["# Testing Days:"],
    ["", "Add testing days here", "testing"],
    [],
    ["# Spring Break (adjust dates for your district):"],
    ["2027-04-05", "Spring Break", "holiday"],
    ["2027-04-06", "Spring Break", "holiday"],
    ["2027-04-07", "Spring Break", "holiday"],
    ["2027-04-08", "Spring Break", "holiday"],
    ["2027-04-09", "Spring Break", "holiday"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 15 }];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "School Calendar");

  // Download
  XLSX.writeFile(wb, filename);
}

/**
 * Detect school year from dates
 * e.g., dates from Aug 2026 - Jun 2027 = "2026-27"
 */
export function detectSchoolYear(dates: string[]): string {
  if (dates.length === 0) return "Unknown";

  const years = new Set(
    dates.map((d) => new Date(d + "T12:00:00").getFullYear()),
  );
  const yearArray = Array.from(years).sort();

  if (yearArray.length === 1) {
    return yearArray[0].toString();
  }

  // Multi-year, assume school year format
  const startYear = yearArray[0];
  const endYear = yearArray[yearArray.length - 1];
  return `${startYear}-${endYear.toString().slice(2)}`;
}
