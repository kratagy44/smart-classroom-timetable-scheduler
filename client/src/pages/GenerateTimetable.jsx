// The admin clicks one button and the server makes the timetable.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios";

export default function GenerateTimetable() {
  const [check, setCheck] = useState(null); // simple numbers shown before generating
  const [result, setResult] = useState(null); // the timetable after generating
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data for the "before you generate" check, and the current timetable.
  useEffect(() => {
    Promise.all([api.get("/subjects"), api.get("/classes"), api.get("/settings")])
      .then(([s, c, st]) => {
        const slotsPerWeek = st.data.days.length * st.data.periodsPerDay;
        const perClass = c.data.map((cls) => {
          const needed = s.data
            .filter((sub) => sub.classGroup && sub.classGroup._id === cls._id)
            .reduce((total, sub) => total + sub.periodsPerWeek, 0);
          return { name: cls.name, needed, ok: needed <= slotsPerWeek };
        });
        setCheck({ subjects: s.data.length, slotsPerWeek, perClass });
      })
      .catch((err) => setError(errorMessage(err)));

    api
      .get("/timetable")
      .then((res) => setResult(res.data))
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/timetable/generate");
      setResult({ ...res.data, justMade: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Generate Timetable</h1>
      <p className="intro">
        The app places every lecture so that no teacher, class or room is used twice at the same time.
        Lab subjects go to labs, and the same subject is spread across different days.
      </p>

      {check && (
        <div className="card">
          <h2>Before you generate</h2>
          <p>
            <b>{check.subjects}</b> subjects · <b>{check.slotsPerWeek}</b> slots per class per week
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Class</th><th>Periods needed</th><th>Status</th></tr>
              </thead>
              <tbody>
                {check.perClass.map((c) => (
                  <tr key={c.name}>
                    <td data-label="Class">{c.name}</td>
                    <td data-label="Periods needed">{c.needed} / {check.slotsPerWeek}</td>
                    <td data-label="Status">
                      {c.ok ? <span className="text-success">✔ fits</span> : <span className="text-danger">✖ too many periods</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="generate-box">
        <button className="btn btn-big" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "⚡ Generate Timetable"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card">
          <h2>{result.justMade ? "Done!" : "Current timetable"}</h2>
          <p>
            <b>{result.slots.length}</b> lectures placed · generated on {new Date(result.createdAt).toLocaleString()}
          </p>

          {result.unplaced.length === 0 ? (
            <div className="alert alert-success">Every lecture was placed with no clashes.</div>
          ) : (
            <>
              <div className="alert alert-error">Some lectures could not be placed. See why below.</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Subject</th><th>Class</th><th>Teacher</th><th>Missing</th><th>Reason</th></tr>
                  </thead>
                  <tbody>
                    {result.unplaced.map((u, i) => (
                      <tr key={i}>
                        <td data-label="Subject">{u.subject}</td>
                        <td data-label="Class">{u.classGroup}</td>
                        <td data-label="Teacher">{u.teacher}</td>
                        <td data-label="Missing">{u.missing}</td>
                        <td data-label="Reason">{u.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <Link className="btn" to="/timetable">View timetable</Link>
        </div>
      )}
    </div>
  );
}
