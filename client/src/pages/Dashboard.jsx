// Home page. Admin sees counts and the steps to follow.
// Teachers and students see their classes for today.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { today, currentPeriod, greeting, longDate, nextWorkingDay } from "../utils/time";
import Icon from "../components/Icon";

// Big title at the top of the dashboard: "Good morning, Anil" + today's date.
function Welcome({ name, children }) {
  return (
    <div className="page-head welcome">
      <div>
        <p className="eyebrow">{longDate()}</p>
        <h1>
          {greeting()}, {name}
        </h1>
        {children}
      </div>
    </div>
  );
}

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

  // [label, number, page, icon, colour]
  const stats = [
    ["Teachers", counts.teachers, "/teachers", "teachers", "violet"],
    ["Classes", counts.classes, "/classes", "classes", "blue"],
    ["Rooms", counts.rooms, "/rooms", "rooms", "green"],
    ["Subjects", counts.subjects, "/subjects", "subjects", "orange"],
  ];
  const hasProblems = timetable && timetable.unplaced.length > 0;

  return (
    <div>
      <Welcome name="Admin">
        <p className="intro">Here is what is happening in your college today.</p>
      </Welcome>

      <div className="stats">
        {stats.map(([label, value, link, icon, colour]) => (
          <Link key={label} to={link} className={`card stat stat-${colour}`}>
            <span className="stat-icon">
              <Icon name={icon} size={22} />
            </span>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Timetable status</h2>
          {timetable && (
            <span className={hasProblems ? "pill pill-danger" : "pill pill-success"}>
              <Icon name={hasProblems ? "alert" : "check"} size={14} />
              {hasProblems ? "Needs attention" : "All good"}
            </span>
          )}
        </div>
        {timetable ? (
          <p>
            Last generated on <b>{new Date(timetable.createdAt).toLocaleString()}</b> —{" "}
            <b>{timetable.slots.length}</b> lectures placed.{" "}
            {hasProblems ? (
              <span className="text-danger">{timetable.unplaced.length} subject(s) could not be fully placed.</span>
            ) : (
              <span className="text-success">No clashes, no problems.</span>
            )}
          </p>
        ) : (
          <p className="muted">No timetable yet. Click Generate to make one.</p>
        )}
        <div className="button-row">
          <Link className="btn" to="/generate">
            <Icon name="zap" size={16} /> Generate timetable
          </Link>
          <Link className="btn btn-light" to="/timetable">View timetable</Link>
          <Link className="btn btn-light" to="/free-rooms">Free rooms</Link>
        </div>
      </div>

      <div className="card">
        <h2>How to make a timetable</h2>
        <ol className="steps-list">
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
  const todaysLectures = timetable ? timetable.slots.filter((s) => s.day === day) : [];
  // On a holiday (or a day with no lectures) also show the next working day.
  const nextDay = timetable && todaysLectures.length === 0 ? nextWorkingDay(timetable.days, day) : null;
  const weekCount = timetable ? timetable.slots.length : 0;

  return (
    <div>
      <Welcome name={user.name}>
        {timetable && (
          <div className="summary-pills">
            <span className="pill">
              <Icon name="clock" size={14} /> {todaysLectures.length} lecture(s) today
            </span>
            <span className="pill">
              <Icon name="calendar" size={14} /> {weekCount} this week
            </span>
          </div>
        )}
      </Welcome>

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

      {nextDay && (
        <div className="card">
          <h2>Next working day ({nextDay})</h2>
          <TodayList timetable={timetable} day={nextDay} role={user.role} upcoming />
        </div>
      )}
    </div>
  );
}

// List of today's lectures; the one going on now is highlighted.
// "upcoming" = a future day, so nothing is highlighted as "Now".
function TodayList({ timetable, day, role, upcoming = false }) {
  const lectures = timetable.slots.filter((s) => s.day === day).sort((a, b) => a.period - b.period);
  const now = upcoming ? null : currentPeriod(timetable.periodTimes || []);

  if (!timetable.days.includes(day))
    return (
      <div className="empty-state">
        <Icon name="sun" size={28} />
        <p>Today is a holiday. Enjoy!</p>
      </div>
    );
  if (lectures.length === 0) return <p className="muted">No lectures {upcoming ? "on this day" : "today"}.</p>;

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
