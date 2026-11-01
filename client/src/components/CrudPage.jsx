// A reusable page with a form (add / edit) and a table (list / delete).
// Teachers, Classes, Rooms, Subjects and Users pages all use it.
//
// Props:
//   title     - page heading
//   intro     - short help text under the heading
//   endpoint  - API path, e.g. "/teachers"
//   fields    - the form inputs, e.g. [{ name: "name", label: "Name", type: "text", required: true }]
//   columns   - the table columns, e.g. [{ label: "Name", render: (item) => item.name }]
//   canEdit   - show the Edit button (default true)
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios";

// An empty form: "" for text, false for checkboxes, or the field's default.
function emptyForm(fields) {
  const form = {};
  for (const f of fields) {
    form[f.name] = f.default !== undefined ? f.default : f.type === "checkbox" ? false : "";
  }
  return form;
}

export default function CrudPage({ title, intro, endpoint, fields, columns, canEdit = true }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(() => emptyForm(fields));
  const [editingId, setEditingId] = useState(null); // null = adding a new item
  const [message, setMessage] = useState(null); // { type: "error" | "success", text }
  const [loading, setLoading] = useState(true);

  // Load the list when the page opens.
  useEffect(() => {
    api
      .get(endpoint)
      .then((res) => setItems(res.data))
      .catch((err) => setMessage({ type: "error", text: errorMessage(err) }))
      .finally(() => setLoading(false));
  }, [endpoint]);

  // Update one form value when the user types.
  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingId) {
        const res = await api.put(`${endpoint}/${editingId}`, form);
        setItems(items.map((it) => (it._id === editingId ? res.data : it)));
        setMessage({ type: "success", text: "Saved." });
      } else {
        const res = await api.post(endpoint, form);
        setItems([...items, res.data]);
        setMessage({ type: "success", text: "Added." });
      }
      cancelEdit();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  }

  // Fill the form with an item so it can be changed.
  function startEdit(item) {
    const values = {};
    for (const f of fields) {
      const value = item[f.name];
      // Linked items (like a subject's teacher) come as objects; the form needs just the id.
      values[f.name] = value && typeof value === "object" ? value._id : value ?? emptyForm([f])[f.name];
    }
    setForm(values);
    setEditingId(item._id);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setForm(emptyForm(fields));
    setEditingId(null);
  }

  async function handleDelete(item) {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    setMessage(null);
    try {
      await api.delete(`${endpoint}/${item._id}`);
      setItems(items.filter((it) => it._id !== item._id));
      setMessage({ type: "success", text: "Deleted." });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  }

  // Draws one form input based on its type.
  function renderInput(f) {
    if (f.type === "select") {
      return (
        <select name={f.name} value={form[f.name]} onChange={handleChange} required={f.required}>
          <option value="">-- Choose --</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === "checkbox") {
      return <input type="checkbox" name={f.name} checked={form[f.name]} onChange={handleChange} />;
    }
    return (
      <input
        type={f.type || "text"}
        name={f.name}
        value={form[f.name]}
        onChange={handleChange}
        required={f.required}
        placeholder={f.placeholder}
        min={f.min}
        max={f.max}
      />
    );
  }

  // Some fields only show in some cases (e.g. "Class" only for students).
  const visibleFields = fields.filter((f) => !f.showIf || f.showIf(form));

  return (
    <div>
      <h1>{title}</h1>
      {intro && <p className="intro">{intro}</p>}

      <form className="card form-grid" onSubmit={handleSubmit}>
        <h2 className="form-title">{editingId ? "Edit" : "Add new"}</h2>
        {visibleFields.map((f) => (
          <label key={f.name} className={f.type === "checkbox" ? "checkbox-label" : ""}>
            <span>
              {f.label}
              {f.required && " *"}
            </span>
            {renderInput(f)}
          </label>
        ))}
        <div className="form-actions">
          <button className="btn" type="submit">
            {editingId ? "Save changes" : "Add"}
          </button>
          {editingId && (
            <button className="btn btn-light" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="muted">Nothing added yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    {columns.map((c) => (
                      <td key={c.label} data-label={c.label}>
                        {c.render(item)}
                      </td>
                    ))}
                    <td className="row-actions">
                      {canEdit && (
                        <button className="btn btn-light btn-small" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                      )}
                      <button className="btn btn-danger btn-small" onClick={() => handleDelete(item)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
