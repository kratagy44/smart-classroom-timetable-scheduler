// Helpers shared by the timetable grid on screen and the PDF file.

// Gives every subject its own soft colour, so the timetable is easy to read.
const COLORS = ["#e0e7ff", "#dcfce7", "#fef3c7", "#fce7f3", "#e0f2fe", "#ede9fe", "#ffedd5", "#ccfbf1"];

export function colorFor(text) {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) % 1000003;
  return COLORS[hash % COLORS.length];
}

// The two small lines shown under the subject name.
// mode is "class", "teacher" or "room".
export function cellDetails(slot, mode) {
  if (mode === "teacher") return [slot.classGroup.name, slot.room.name];
  if (mode === "room") return [slot.classGroup.name, slot.teacher.name];
  return [slot.teacher.name, slot.room.name]; // class view
}
