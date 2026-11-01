// Working days, periods per day and the time of each period.
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Settings() {
  const [days, setDays] = useState([]);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);
  const [periodTimes, setPeriodTimes] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/settings")
      .then((res) => {
        setDays(res.data.days);
        setPeriodsPerDay(res.data.periodsPerDay);
        setPeriodTimes(res.data.periodTimes);
      })
      .catch((err) => setMessage({ type: "error", text: errorMessage(err) }))
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(day) {
    setDays(days.includes(day) ? days.filter((d) => d !== day) : [...days, day]);
  }

  function changeTime(index, value) {
    const copy = [...periodTimes];
    copy[index] = value;
    setPeriodTimes(copy);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.put("/settings", { days, periodsPerDay, periodTimes });
      setDays(res.data.days);
      setPeriodTimes(res.data.periodTimes);
      setMessage({ type: "success", text: "Saved. Generate the timetable again to use the new settings." });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  }

  if (loading) return <p>Loading...</p>;

  const count = Number(periodsPerDay) || 0;

  return (
    <div>
      <h1>Settings</h1>
      <p className="intro">These settings decide the size of the weekly timetable.</p>

      <form className="card" onSubmit={handleSave}>
        <h2>Working days</h2>
        <div className="day-picker">
          {ALL_DAYS.map((day) => (
            <label key={day} className={days.includes(day) ? "day-chip selected" : "day-chip"}>
              <input type="checkbox" checked={days.includes(day)} onChange={() => toggleDay(day)} />
              {day}
            </label>
          ))}
        </div>

        <h2>Periods per day</h2>
        <input
          type="number"
          min="1"
          max="12"
          value={periodsPerDay}
          onChange={(e) => setPeriodsPerDay(e.target.value)}
          className="small-input"
        />

        <h2>Period timings</h2>
        <p className="muted">Format: 09:00-10:00 (24-hour clock). Used to show "Now" on the dashboard and free rooms page.</p>
        <div className="times-grid">
          {Array.from({ length: Math.min(count, 12) }, (_, i) => (
            <label key={i}>
              <span>Period {i + 1}</span>
              <input
                value={periodTimes[i] || ""}
                onChange={(e) => changeTime(i, e.target.value)}
                placeholder="09:00-10:00"
              />
            </label>
          ))}
        </div>

        <p className="muted">
          Total slots in a week: <b>{days.length * count}</b> per class.
        </p>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <button className="btn" type="submit">Save settings</button>
      </form>
    </div>
  );
}
