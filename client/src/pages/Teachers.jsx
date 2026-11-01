import CrudPage from "../components/CrudPage";

export default function Teachers() {
  return (
    <CrudPage
      title="Teachers"
      intro="Add every teacher here. Then add the subjects they teach on the Subjects page."
      endpoint="/teachers"
      fields={[
        { name: "name", label: "Name", required: true, placeholder: "Dr. A. Sharma" },
        { name: "email", label: "Email", type: "email", placeholder: "name@college.edu" },
        { name: "department", label: "Department", placeholder: "CSE" },
      ]}
      columns={[
        { label: "Name", render: (t) => t.name },
        { label: "Email", render: (t) => t.email || "-" },
        { label: "Department", render: (t) => t.department || "-" },
      ]}
    />
  );
}
