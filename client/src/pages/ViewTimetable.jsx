// See the weekly timetable of a class, a teacher or a room. Can be printed.
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TimetableGrid from "../components/TimetableGrid";
import PdfPreview from "../components/PdfPreview";

const MODES = [
  ["class", "Class"],
  ["teacher", "Teacher"],
  ["room", "Room"],
];

export default function ViewTimetable() {
  const { user } = useAuth();

  // Start with the user's own timetable.
  const [mode, setMode] = useState(user.role === "teacher" ? "teacher" : "class");
  const [selectedId, setSelectedId] = useState(
    user.role === "teacher" ? user.teacher || "" : user.role === "student" ? user.classGroup || "" : ""
  );
  const [lists, setLists] = useState(null); // { class: [...], teacher: [...], room: [...] }
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null); // { url, fileName } while the PDF preview is open

  // Load the dropdown lists once.
  useEffect(() => {
    Promise.all([api.get("/classes"), api.get("/teachers"), api.get("/rooms")])
      .then(([c, t, r]) => {
        const newLists = { class: c.data, teacher: t.data, room: r.data };
        setLists(newLists);
        // Admin (or a login whose teacher/class was deleted): show the first item by default.
        const list = newLists[mode];
        if (!list.some((item) => item._id === selectedId)) setSelectedId(list.length > 0 ? list[0]._id : "");
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  // Load the timetable whenever the choice changes.
  useEffect(() => {
    if (!selectedId) return;
    setError("");
    api
      .get(`/timetable/${mode}/${selectedId}`)
      .then((res) => setTimetable(res.data))
      .catch((err) => {
        setTimetable(null);
        setError(errorMessage(err));
      });
  }, [mode, selectedId]);

  // Make the PDF and show it in the preview window.
  // The PDF library is big, so it is loaded only when the button is clicked.
  async function openPdfPreview(title, name) {
    const { makeTimetablePdf } = await import("../utils/pdf");
    setPreview(makeTimetablePdf(timetable, mode, title, name));
  }

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview.url);
  }, [preview]);

  function closePdfPreview() {
    setPreview(null); // the effect above frees the memory used by the PDF
  }

  function changeMode(newMode) {
    setMode(newMode);
    setTimetable(null);
    const list = lists[newMode];
    setSelectedId(list.length > 0 ? list[0]._id : "");
  }

  if (!lists) return error ? <div className="alert alert-error">{error}</div> : <p>Loading...</p>;

  const selected = lists[mode].find((item) => item._id === selectedId);
  const modeLabel = MODES.find(([m]) => m === mode)[1];

  return (
    <div>
      <h1 className="no-print">Timetable</h1>

      <div className="card controls no-print">
        <div className="tabs">
          {MODES.map(([m, label]) => (
            <button key={m} className={m === mode ? "tab active" : "tab"} onClick={() => changeMode(m)}>
              By {label}
            </button>
          ))}
        </div>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {lists[mode].map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
        <button
          className="btn"
          onClick={() => openPdfPreview(`${modeLabel}: ${selected.name}`, selected.name)}
          disabled={!timetable || !selected || timetable.slots.length === 0}
        >
          📄 Preview PDF
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {timetable && selected && (
        <div className="card print-area">
          <h2>
            {modeLabel}: {selected.name}
          </h2>
          {timetable.slots.length === 0 ? (
            <p className="muted">No lectures for this {modeLabel.toLowerCase()}.</p>
          ) : (
            <TimetableGrid timetable={timetable} mode={mode} />
          )}
        </div>
      )}

      {preview && <PdfPreview url={preview.url} fileName={preview.fileName} onClose={closePdfPreview} />}
    </div>
  );
}
