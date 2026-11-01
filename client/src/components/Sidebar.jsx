// Side menu. On big screens it is always visible on the left.
// On phones it is hidden, and the ☰ button in the top bar slides it in.
// Admins see more links than teachers and students.
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

// Menu groups: [group title, [[path, label, icon], ...]]
const mainLinks = [
  ["/", "Dashboard", "home"],
  ["/timetable", "Timetable", "calendar"],
  ["/free-rooms", "Free Rooms", "pin"],
];

const adminGroups = [
  ["Main", mainLinks],
  [
    "Manage",
    [
      ["/teachers", "Teachers", "teachers"],
      ["/classes", "Classes", "classes"],
      ["/rooms", "Rooms", "rooms"],
      ["/subjects", "Subjects", "subjects"],
      ["/users", "Users", "users"],
    ],
  ],
  [
    "Scheduling",
    [
      ["/generate", "Generate", "zap"],
      ["/settings", "Settings", "settings"],
    ],
  ],
];

const userGroups = [["Main", mainLinks]];

// "Dr. Anil Sharma" -> "AS"
function initials(name) {
  const words = name.replace(/^(Dr|Prof|Mr|Mrs|Ms)\.?\s+/i, "").split(" ");
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false); // phone menu open or closed

  // Close the phone menu whenever the page changes.
  useEffect(() => setOpen(false), [location.pathname]);

  const groups = user.role === "admin" ? adminGroups : userGroups;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      {/* Top bar: only shown on phones */}
      <header className="topbar no-print">
        <button className="icon-button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={22} />
        </button>
        <span className="brand-logo">
          <Icon name="calendar" size={16} />
        </span>
        <span className="brand-text">Smart Timetable</span>
      </header>

      {/* Dark background behind the open phone menu; click it to close */}
      {open && <div className="backdrop no-print" onClick={() => setOpen(false)} />}

      <aside className={open ? "sidebar open no-print" : "sidebar no-print"}>
        <div className="sidebar-brand">
          <span className="brand-logo">
            <Icon name="calendar" size={20} />
          </span>
          <div>
            <div className="brand-text">Smart Timetable</div>
            <div className="brand-sub">Classroom Scheduler</div>
          </div>
          <button className="icon-button close-button" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {groups.map(([title, links]) => (
            <div key={title} className="nav-group">
              <div className="nav-group-title">{title}</div>
              {links.map(([path, label, icon]) => (
                <NavLink key={path} to={path} end className="nav-link">
                  <Icon name={icon} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{initials(user.name)}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button className="icon-button logout-button" onClick={handleLogout} title="Logout" aria-label="Logout">
            <Icon name="logout" />
          </button>
        </div>
      </aside>
    </>
  );
}
