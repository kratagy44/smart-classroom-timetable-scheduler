// Makes a real PDF file of a timetable (shown in a preview, then downloaded).
// We build the PDF ourselves (with the jsPDF library) instead of using the browser's
// print window, because the print window does not open in every browser.
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { colorFor, cellDetails } from "./timetable.js";

// Builds the PDF and returns it.
// timetable = { days, periodsPerDay, periodTimes, slots }
// mode      = "class" | "teacher" | "room"
// title     = e.g. "Class: CSE-2A"
export function buildTimetablePdf(timetable, mode, title) {
  const { days, periodsPerDay, periodTimes = [], slots } = timetable;
  const periods = Array.from({ length: periodsPerDay }, (_, i) => i + 1);

  // Quick lookup: "Mon-2" -> slot
  const byCell = {};
  for (const slot of slots) byCell[`${slot.day}-${slot.period}`] = slot;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Smart Timetable", 14, 16);
  doc.setFontSize(13);
  doc.text(title, 14, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Printed on ${new Date().toLocaleString()}`, pageWidth - 14, 16, { align: "right" });
  doc.setTextColor(0);

  // Table header: "Day", "Period 1 (09:00-10:00)", ...
  const head = [
    "Day",
    ...periods.map((p) => (periodTimes[p - 1] ? `Period ${p}\n${periodTimes[p - 1]}` : `Period ${p}`)),
  ];

  // One row per day. Each cell: subject name + two detail lines.
  const body = days.map((day) => [
    day,
    ...periods.map((p) => {
      const slot = byCell[`${day}-${p}`];
      if (!slot) return "-";
      // Add "(Lab)" for lab subjects, unless the name already says "Lab".
      const { name: subjectName, needsLab } = slot.subject;
      const name = needsLab && !/lab/i.test(subjectName) ? `${subjectName} (Lab)` : subjectName;
      return [name, ...cellDetails(slot, mode)].join("\n");
    }),
  ]);

  // All period columns get the same width.
  const dayColumnWidth = 16;
  const periodWidth = (pageWidth - 28 - dayColumnWidth) / periodsPerDay;
  const columnStyles = { 0: { fontStyle: "bold", halign: "center", cellWidth: dayColumnWidth, fillColor: [243, 244, 246] } };
  for (const p of periods) columnStyles[p] = { cellWidth: periodWidth };

  autoTable(doc, {
    startY: 30,
    margin: { left: 14, right: 14 },
    head: [head],
    body,
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2.5, valign: "middle", lineColor: [220, 220, 230], lineWidth: 0.2 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, halign: "center", fontStyle: "bold" },
    columnStyles,
    // Colour each lecture cell like on the screen.
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index === 0) return;
      const slot = byCell[`${days[data.row.index]}-${data.column.index}`];
      if (slot) {
        data.cell.styles.fillColor = colorFor(slot.subject.name);
      } else {
        data.cell.styles.halign = "center";
        data.cell.styles.textColor = 190;
      }
    },
  });

  return doc;
}

// Builds the PDF and gives back a temporary link to it (for the preview and the download),
// plus a file name like "Timetable - CSE-2A.pdf".
export function makeTimetablePdf(timetable, mode, title, name) {
  const doc = buildTimetablePdf(timetable, mode, title);
  const safeName = name.replace(/[\\/:*?"<>|]/g, "-"); // remove characters not allowed in file names
  return {
    url: URL.createObjectURL(doc.output("blob")),
    fileName: `Timetable - ${safeName}.pdf`,
  };
}
