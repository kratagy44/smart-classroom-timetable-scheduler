// All the pages of the app and who can open them.
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Rooms from "./pages/Rooms";
import Subjects from "./pages/Subjects";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import GenerateTimetable from "./pages/GenerateTimetable";
import ViewTimetable from "./pages/ViewTimetable";
import FreeRooms from "./pages/FreeRooms";

// Wraps a page: only admins can open it.
const adminOnly = (page) => <ProtectedRoute roles={["admin"]}>{page}</ProtectedRoute>;
// Wraps a page: anyone logged in can open it.
const loggedIn = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  const { user } = useAuth();

  return (
    <div className={user ? "layout" : ""}>
      {user && <Sidebar />}
      <main className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

          <Route path="/" element={loggedIn(<Dashboard />)} />
          <Route path="/timetable" element={loggedIn(<ViewTimetable />)} />
          <Route path="/free-rooms" element={loggedIn(<FreeRooms />)} />

          <Route path="/teachers" element={adminOnly(<Teachers />)} />
          <Route path="/classes" element={adminOnly(<Classes />)} />
          <Route path="/rooms" element={adminOnly(<Rooms />)} />
          <Route path="/subjects" element={adminOnly(<Subjects />)} />
          <Route path="/users" element={adminOnly(<Users />)} />
          <Route path="/settings" element={adminOnly(<Settings />)} />
          <Route path="/generate" element={adminOnly(<GenerateTimetable />)} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
