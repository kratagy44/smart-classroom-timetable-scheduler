// Subjects need the list of teachers and classes for the dropdowns, so we load them first.
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios";
import CrudPage from "../components/CrudPage";

export default function Subjects() {
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
      title="Subjects"
      intro="Each row is one subject for one class, taught by one teacher. Periods per week = how many lectures in a week."
      endpoint="/subjects"
      fields={[
        { name: "name", label: "Subject name", required: true, placeholder: "DBMS" },
        { name: "code", label: "Code", placeholder: "CS301" },
        {
          name: "teacher",
          label: "Teacher",
          type: "select",
          required: true,
          options: teachers.map((t) => ({ value: t._id, label: t.name })),
        },
        {
          name: "classGroup",
          label: "Class",
          type: "select",
          required: true,
          options: classes.map((c) => ({ value: c._id, label: c.name })),
        },
        { name: "periodsPerWeek", label: "Periods per week", type: "number", required: true, min: 1, max: 20, default: 4 },
        { name: "needsLab", label: "Needs a lab room", type: "checkbox" },
      ]}
      columns={[
        { label: "Subject", render: (s) => `${s.name}${s.code ? ` (${s.code})` : ""}` },
        { label: "Class", render: (s) => (s.classGroup ? s.classGroup.name : "-") },
        { label: "Teacher", render: (s) => (s.teacher ? s.teacher.name : "-") },
        { label: "Periods/week", render: (s) => s.periodsPerWeek },
        { label: "Lab", render: (s) => (s.needsLab ? <span className="tag tag-lab">Lab</span> : "-") },
      ]}
    />
  );
}
