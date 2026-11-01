import CrudPage from "../components/CrudPage";

export default function Rooms() {
  return (
    <CrudPage
      title="Rooms"
      intro="Lab subjects are only placed in rooms of type Lab. A room is used only if its capacity is enough for the class."
      endpoint="/rooms"
      fields={[
        { name: "name", label: "Room name", required: true, placeholder: "Room 101" },
        { name: "capacity", label: "Capacity", type: "number", required: true, min: 1 },
        {
          name: "type",
          label: "Type",
          type: "select",
          required: true,
          default: "classroom",
          options: [
            { value: "classroom", label: "Classroom" },
            { value: "lab", label: "Lab" },
          ],
        },
      ]}
      columns={[
        { label: "Room", render: (r) => r.name },
        { label: "Capacity", render: (r) => r.capacity },
        {
          label: "Type",
          render: (r) => <span className={`tag tag-${r.type}`}>{r.type === "lab" ? "Lab" : "Classroom"}</span>,
        },
      ]}
    />
  );
}
