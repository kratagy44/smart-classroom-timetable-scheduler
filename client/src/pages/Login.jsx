// Login page. Left: what the app does. Right: the login form.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/axios";
import Icon from "../components/Icon";

// Sample accounts made by "npm run seed". Clicking one fills the form.
const DEMO_ACCOUNTS = [
  ["Admin", "admin@college.edu", "admin123"],
  ["Teacher", "anil.sharma@college.edu", "teacher123"],
  ["Student", "cse2a@college.edu", "student123"],
];

const FEATURES = [
  ["zap", "One-click timetable", "No teacher, class or room clash — ever."],
  ["pin", "Free room finder", "See which rooms are free right now."],
  ["calendar", "PDF export", "Preview, download and print any timetable."],
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail, demoPassword) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="login-brand">
          <span className="brand-logo big">
            <Icon name="calendar" size={26} />
          </span>
          <span>Smart Timetable</span>
        </div>
        <h1>Clash-free college timetables in one click.</h1>
        <p>Add teachers, classes, rooms and subjects once. The app does the rest.</p>
        <ul className="hero-features">
          {FEATURES.map(([icon, title, text]) => (
            <li key={title}>
              <span className="hero-icon">
                <Icon name={icon} size={18} />
              </span>
              <div>
                <b>{title}</b>
                <small>{text}</small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="login-side">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Welcome back 👋</h2>
          <p className="muted">Log in to see your timetable.</p>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              required
              autoFocus
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="demo-box">
            <span className="demo-title">Try a demo account</span>
            <div className="demo-buttons">
              {DEMO_ACCOUNTS.map(([label, demoEmail, demoPassword]) => (
                <button
                  key={label}
                  type="button"
                  className={email === demoEmail ? "demo-chip active" : "demo-chip"}
                  onClick={() => fillDemo(demoEmail, demoPassword)}
                >
                  {label}
                </button>
              ))}
            </div>
            <small className="hint">Works after running <code>npm run seed</code>.</small>
          </div>
        </form>
      </section>
    </div>
  );
}
