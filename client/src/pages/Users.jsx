// Login accounts. A teacher login is linked to a teacher; a student login to a class.
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios";
import CrudPage from "../components/CrudPage";

export default function Users() {
  const [teachers, setTeachers] = useState(null);
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/teachers"), api.get("/classes")])
      .then(([t, c]) => {
        setTeachers(t.data);
        setClasses(c.data);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!teachers || !classes) return <p>Loading...</p>;

  return (
    <CrudPage
      title="Users"
      intro="Create login accounts. Teachers see their own timetable; students see their class timetable."
      endpoint="/users"
      canEdit={false}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "password", label: "Password (min 6)", type: "password", required: true },
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          default: "student",
          options: [
            { value: "student", label: "Student" },
            { value: "teacher", label: "Teacher" },
            { value: "admin", label: "Admin" },
          ],
        },
        {
          name: "teacher",
          label: "Which teacher?",
          type: "select",
          required: true,
          showIf: (form) => form.role === "teacher",
          options: teachers.map((t) => ({ value: t._id, label: t.name })),
        },
        {
          name: "classGroup",
          label: "Which class?",
          type: "select",
          required: true,
          showIf: (form) => form.role === "student",
          options: classes.map((c) => ({ value: c._id, label: c.name })),
        },
      ]}
      columns={[
        { label: "Name", render: (u) => u.name },
        { label: "Email", render: (u) => u.email },
        { label: "Role", render: (u) => <span className={`tag tag-${u.role}`}>{u.role}</span> },
        {
          label: "Linked to",
          render: (u) => (u.teacher ? u.teacher.name : u.classGroup ? u.classGroup.name : "-"),
        },
      ]}
    />
  );
}
