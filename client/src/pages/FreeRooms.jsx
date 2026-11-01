// "Smart classroom": shows which rooms are free or busy in a chosen period.
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios";
import { today, currentPeriod } from "../utils/time";

export default function FreeRooms() {
  const [settings, setSettings] = useState(null);
  const [day, setDay] = useState("");
  const [period, setPeriod] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Load settings, then jump to "right now" if college is open.
  useEffect(() => {
    api
      .get("/settings")
      .then((res) => {
        setSettings(res.data);
        const now = currentPeriod(res.data.periodTimes);
        if (res.data.days.includes(today()) && now) {
          setDay(today());
          setPeriod(now);
        } else {
          setDay(res.data.days[0]);
        }
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  // Load room status whenever day or period changes.
  useEffect(() => {
    if (!day) return;
    api
      .get("/rooms/free", { params: { day, period } })
      .then((res) => {
        setRooms(res.data);
        setError("");
      })
      .catch((err) => setError(errorMessage(err)));
  }, [day, period]);

  function showNow() {
    const now = currentPeriod(settings.periodTimes);
    if (!settings.days.includes(today()) || !now) {
      setNote("College is closed right now, so there is no current period.");
      return;
    }
    setNote("");
    setDay(today());
    setPeriod(now);
  }

  if (!settings) return error ? <div className="alert alert-error">{error}</div> : <p>Loading...</p>;

  const freeCount = rooms.filter((r) => !r.busy).length;

  return (
    <div>
      <h1>Free Rooms</h1>
      <p className="intro">Need a room for an extra class or a meeting? Pick a day and period to see which rooms are free.</p>

      <div className="card controls">
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {settings.days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
          {Array.from({ length: settings.periodsPerDay }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Period {i + 1} {settings.periodTimes[i] ? `(${settings.periodTimes[i]})` : ""}
            </option>
          ))}
        </select>
        <button className="btn btn-light" onClick={showNow}>Right now</button>
      </div>

      {note && <div className="alert alert-info">{note}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <p>
        <b>{freeCount}</b> free · <b>{rooms.length - freeCount}</b> busy
      </p>

      <div className="room-grid">
        {rooms.map(({ room, busy, usedBy }) => (
          <div key={room._id} className={busy ? "room-card busy" : "room-card free"}>
            <div className="room-head">
              <b>{room.name}</b>
              <span className="room-status">{busy ? "Busy" : "Free"}</span>
            </div>
            <div className="muted">
              {room.type === "lab" ? "Lab" : "Classroom"} · {room.capacity} seats
            </div>
            {usedBy && (
              <div className="room-used">
                {usedBy.subject} — {usedBy.classGroup}
                <br />
                {usedBy.teacher}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
