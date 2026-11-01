import CrudPage from "../components/CrudPage";

export default function Classes() {
  return (
    <CrudPage
      title="Classes"
      intro="A class (or section) is a group of students who sit together, like CSE-3A. Strength = number of students; it decides which rooms are big enough."
      endpoint="/classes"
      fields={[
        { name: "name", label: "Class name", required: true, placeholder: "CSE-3A" },
        { name: "year", label: "Year", type: "number", min: 1, max: 6 },
        { name: "department", label: "Department", placeholder: "CSE" },
        { name: "strength", label: "No. of students", type: "number", required: true, min: 1 },
      ]}
      columns={[
        { label: "Class", render: (c) => c.name },
        { label: "Year", render: (c) => c.year || "-" },
        { label: "Department", render: (c) => c.department || "-" },
        { label: "Students", render: (c) => c.strength },
      ]}
    />
  );
}
