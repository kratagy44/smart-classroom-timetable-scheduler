// Home page. Admin sees counts and the steps to follow.
// Teachers and students see their classes for today.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { today, currentPeriod } from "../utils/time";

function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all(["/teachers", "/classes", "/rooms", "/subjects"].map((url) => api.get(url)))
      .then(([t, c, r, s]) =>
        setCounts({ teachers: t.data.length, classes: c.data.length, rooms: r.data.length, subjects: s.data.length })
      )
      .catch((err) => setError(errorMessage(err)));

    api
      .get("/timetable")
      .then((res) => setTimetable(res.data))
      .catch(() => setTimetable(null)); // 404 = not generated yet
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!counts) return <p>Loading...</p>;

  const stats = [
    ["Teachers", counts.teachers, "/teachers"],
    ["Classes", counts.classes, "/classes"],
    ["Rooms", counts.rooms, "/rooms"],
    ["Subjects", counts.subjects, "/subjects"],
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div className="stats">
        {stats.map(([label, value, link]) => (
          <Link key={label} to={link} className="card stat">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2>Timetable status</h2>
        {timetable ? (
          <p>
            Last generated on <b>{new Date(timetable.createdAt).toLocaleString()}</b> —{" "}
            <b>{timetable.slots.length}</b> lectures placed.{" "}
            {timetable.unplaced.length > 0 ? (
              <span className="text-danger">{timetable.unplaced.length} subject(s) could not be fully placed.</span>
            ) : (
              <span className="text-success">No clashes, no problems.</span>
            )}
          </p>
        ) : (
          <p className="muted">No timetable yet.</p>
        )}
        <div className="button-row">
          <Link className="btn" to="/generate">Generate timetable</Link>
          <Link className="btn btn-light" to="/timetable">View timetable</Link>
          <Link className="btn btn-light" to="/free-rooms">Free rooms</Link>
        </div>
      </div>

      <div className="card">
        <h2>How to make a timetable</h2>
        <ol className="steps">
          <li>Set working days and periods on the <Link to="/settings">Settings</Link> page.</li>
          <li>Add <Link to="/teachers">Teachers</Link>, <Link to="/classes">Classes</Link> and <Link to="/rooms">Rooms</Link>.</li>
          <li>Add <Link to="/subjects">Subjects</Link> (who teaches what to which class, and how many periods a week).</li>
          <li>Click <Link to="/generate">Generate</Link>. The app makes a timetable with no clashes.</li>
          <li>Create logins on the <Link to="/users">Users</Link> page so teachers and students can see it.</li>
        </ol>
      </div>
    </div>
  );
}

function UserDashboard({ user }) {
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState("");

  // A teacher login is linked to a teacher, a student login to a class.
  const linkedId = user.role === "teacher" ? user.teacher : user.classGroup;

  useEffect(() => {
    if (!linkedId) {
      setError("Your login is not linked to a teacher or class yet. Ask the admin to fix it.");
      return;
    }
    api
      .get(`/timetable/${user.role === "teacher" ? "teacher" : "class"}/${linkedId}`)
      .then((res) => setTimetable(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [user.role, linkedId]);

  const day = today();

  return (
    <div>
      <h1>Hello, {user.name}</h1>
      <div className="card">
        <h2>Today ({day})</h2>
        {error && <p className="muted">{error}</p>}
        {!error && !timetable && <p>Loading...</p>}
        {timetable && <TodayList timetable={timetable} day={day} role={user.role} />}
        <div className="button-row">
          <Link className="btn" to="/timetable">Full week timetable</Link>
          <Link className="btn btn-light" to="/free-rooms">Find a free room</Link>
        </div>
      </div>
    </div>
  );
}

// List of today's lectures; the one going on now is highlighted.
function TodayList({ timetable, day, role }) {
  const lectures = timetable.slots.filter((s) => s.day === day).sort((a, b) => a.period - b.period);
  const now = currentPeriod(timetable.periodTimes || []);

  if (!timetable.days.includes(day)) return <p className="muted">Today is a holiday. Enjoy!</p>;
  if (lectures.length === 0) return <p className="muted">No lectures today.</p>;

  return (
    <ul className="today-list">
      {lectures.map((s) => (
        <li key={s.period} className={s.period === now ? "now" : ""}>
          <div className="today-period">
            P{s.period}
            <small>{timetable.periodTimes[s.period - 1]}</small>
          </div>
          <div>
            <b>{s.subject.name}</b> {s.period === now && <span className="tag tag-now">Now</span>}
            <div className="muted">
              {role === "teacher" ? s.classGroup.name : s.teacher.name} · {s.room.name}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === "admin" ? <AdminDashboard /> : <UserDashboard user={user} />;
}
