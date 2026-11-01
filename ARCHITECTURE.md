# Smart Classroom and Timetable Scheduler — Architecture

This document explains **how the project is built**, in simple words.
Read it before writing code, and use it for your project report and viva.

---

## 1. What does this project do?

In many colleges, the timetable is made by hand. This takes days, and mistakes happen:
- one teacher is given two classes at the same time,
- two classes are given the same room,
- a lab subject is put in a normal classroom.

**Our app fixes this.** The admin enters teachers, subjects, classes and rooms.
Then the admin clicks **"Generate Timetable"**, and the app makes a full weekly
timetable with **no clashes**. Teachers and students can log in and see their own timetable.
Anyone can also see which classrooms are **free right now** (the "smart classroom" part).

---

## 2. Tech stack (what we use and why)

| Part | Technology | Why we use it |
|------|-----------|---------------|
| Frontend (what the user sees) | **React** (with **Vite**) | Builds the pages from small reusable parts called *components*. Vite makes it start fast. |
| Page navigation | **React Router** | Moves between pages (Login, Dashboard, Timetable…) without reloading. |
| Talking to the server | **Axios** | Sends requests from React to the Node.js server. |
| Styling | **Plain CSS** | Easy to understand; no extra library to learn. |
| PDF export | **jsPDF** + **jspdf-autotable** | Creates the timetable PDF file directly in the browser, so it works even where the print window does not. |
| Backend (the server) | **Node.js + Express** | Runs JavaScript on the server and gives us an API (a list of URLs the frontend can call). |
| Database | **MongoDB** + **Mongoose** | Stores data as JSON-like documents, which fits JavaScript well. Mongoose makes it easy to define the shape of the data. |
| Login / security | **JWT** + **bcrypt** | bcrypt hides (hashes) passwords. JWT is a "token" that proves the user is logged in. |

This combination (MongoDB, Express, React, Node) is called the **MERN stack**.

---

## 3. Big picture

```
 ┌──────────────────────┐        HTTP requests (JSON)       ┌──────────────────────┐        ┌─────────────┐
 │   React Frontend     │  ───────────────────────────────▶ │  Node.js + Express   │ ─────▶ │  MongoDB    │
 │   (runs in browser)  │  ◀─────────────────────────────── │  Backend (API)       │ ◀───── │  Database   │
 │   localhost:5173     │        responses (JSON)           │  localhost:5000      │        │             │
 └──────────────────────┘                                   └──────────────────────┘        └─────────────┘
```

**Simple flow:**
1. The user clicks something in React (for example, "Generate Timetable").
2. React sends a request to the backend, e.g. `POST /api/timetable/generate`.
3. The backend checks the user is allowed (login token), does the work, and reads/writes MongoDB.
4. The backend sends back JSON data.
5. React shows the data on the screen.

---

## 4. Who uses the app? (roles)

| Role | What they can do |
|------|------------------|
| **Admin** | Add/edit/delete teachers, subjects, classes, rooms. Generate the timetable. See everything. |
| **Teacher** | Log in, see **their own** weekly timetable, see free rooms. |
| **Student** | Log in, see **their class's** timetable, see free rooms. |

---

## 5. Main modules (features)

1. **Login module** — log in with email + password. The server returns a JWT token.
2. **Master data module** — admin manages:
   - Teachers (name, email, department)
   - Subjects (name, code, teacher, class, periods per week, needs lab yes/no)
   - Classes / sections (e.g. "CSE 3rd Year – A", number of students)
   - Rooms (name, capacity, type: `classroom` or `lab`)
   - Settings (working days, periods per day, period timings)
3. **Timetable generator** — the "brain" of the project (see section 9).
4. **Timetable viewer** — weekly grid by class, by teacher, or by room. Preview as a PDF, then download or print it.
5. **Smart classroom module** — pick a day and period (or "now") to see which rooms are free or busy.
6. **Dashboard** — counts (teachers, rooms, classes) and quick links.

---

## 6. Folder structure

The project has two separate apps in one folder: `client` (React) and `server` (Node.js).

```
Smart classroom and timetable scheduler/
├── ARCHITECTURE.md            ← this file
├── README.md                  ← how to install and run
│
├── client/                    ← FRONTEND (React + Vite)
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx           ← starting point of React
│       ├── App.jsx            ← sets up all page routes
│       ├── api/
│       │   └── axios.js       ← one place for the server URL + attaches the login token
│       ├── context/
│       │   └── AuthContext.jsx← remembers who is logged in
│       ├── components/        ← small reusable pieces
│       │   ├── Sidebar.jsx          ← side menu (slides in on phones)
│       │   ├── Icon.jsx             ← small SVG icons used in the menu
│       │   ├── ProtectedRoute.jsx   ← blocks pages if not logged in / wrong role
│       │   ├── TimetableGrid.jsx    ← draws the days × periods table
│       │   ├── CrudPage.jsx         ← reusable "form + table" page (add / edit / delete)
│       │   └── PdfPreview.jsx       ← pop-up that shows the PDF before downloading
│       ├── pages/             ← one file per screen
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Teachers.jsx
│       │   ├── Subjects.jsx
│       │   ├── Classes.jsx
│       │   ├── Rooms.jsx
│       │   ├── Users.jsx
│       │   ├── Settings.jsx
│       │   ├── GenerateTimetable.jsx
│       │   ├── ViewTimetable.jsx
│       │   └── FreeRooms.jsx
│       ├── utils/
│       │   ├── time.js        ← "today" and "which period is it now?"
│       │   ├── timetable.js   ← subject colours + cell text (shared by screen and PDF)
│       │   └── pdf.js         ← makes the timetable PDF file (jsPDF library)
│       └── styles/
│           └── app.css
│
└── server/                    ← BACKEND (Node.js + Express)
    ├── package.json
    ├── .env                   ← secret settings (DB link, JWT secret) — never share this
    ├── server.js              ← starts the server
    ├── config/
    │   └── db.js              ← connects to MongoDB
    ├── models/                ← shape of the data (Mongoose schemas)
    │   ├── User.js
    │   ├── Teacher.js
    │   ├── Subject.js
    │   ├── ClassGroup.js
    │   ├── Room.js
    │   ├── Settings.js
    │   └── Timetable.js
    ├── routes/                ← which URL goes to which function
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── teacherRoutes.js
    │   ├── subjectRoutes.js
    │   ├── classRoutes.js
    │   ├── roomRoutes.js
    │   ├── settingsRoutes.js
    │   └── timetableRoutes.js
    ├── controllers/           ← the actual work for each URL
    │   ├── crudController.js  ← add/list/edit/delete, shared by teachers, classes, rooms, subjects
    │   ├── authController.js
    │   ├── userController.js
    │   ├── settingsController.js
    │   └── timetableController.js  ← generate, view, free rooms
    ├── middleware/
    │   ├── auth.js            ← checks the JWT token
    │   └── role.js            ← checks if user is admin / teacher / student
    ├── services/
    │   └── scheduler.js       ← the timetable-making algorithm
    └── seed/
        └── seed.js            ← fills the database with sample data for demo
```

**Why `routes` → `controllers` → `models`?**
It keeps code tidy. *Routes* say "this URL exists", *controllers* say "do this when the URL is called",
*models* say "this is what the data looks like". This pattern is called **MVC**-style
(Model–View–Controller; React is the View).

---

## 7. Database design (MongoDB collections)

```
User         { name, email, password (hashed), role: "admin" | "teacher" | "student",
               teacherId?  (if role is teacher), classId? (if role is student) }

Teacher      { name, email, department }

ClassGroup   { name: "CSE-3A", year, department, strength (no. of students) }

Room         { name: "Room 101", capacity, type: "classroom" | "lab" }

Subject      { name: "DBMS", code: "CS301", teacherId, classId,
               periodsPerWeek: 4, needsLab: false }

Settings     { days: ["Mon","Tue","Wed","Thu","Fri"], periodsPerDay: 6,
               periodTimes: ["9:00-10:00", "10:00-11:00", ...] }

Timetable    { createdAt, slots: [
                 { day: "Mon", period: 1, classId, subjectId, teacherId, roomId }
               ] }
```

**How they connect:**

```
Teacher ──teaches──▶ Subject ◀──belongs to── ClassGroup
                        │
                        ▼
                 Timetable slot ──uses──▶ Room
```

One **slot** = one lecture = (day, period, class, subject, teacher, room).
A timetable is just a list of slots.

---

## 8. API endpoints (the backend URLs)

All URLs start with `http://localhost:5000/api`.
🔒 = must be logged in. 👑 = admin only.

| Method | URL | What it does |
|--------|-----|--------------|
| POST | `/auth/login` | Log in, get a token |
| GET | `/auth/me` 🔒 | Get the logged-in user's details |
| GET / POST | `/users` 👑 | List login accounts / create one |
| DELETE | `/users/:id` 👑 | Delete a login account |
| GET / POST | `/teachers` 🔒 / 👑 | List teachers / add a teacher |
| PUT / DELETE | `/teachers/:id` 👑 | Edit / delete a teacher |
| GET / POST | `/subjects` 🔒 / 👑 | List / add subjects |
| PUT / DELETE | `/subjects/:id` 👑 | Edit / delete a subject |
| GET / POST | `/classes` 🔒 / 👑 | List / add classes |
| PUT / DELETE | `/classes/:id` 👑 | Edit / delete a class |
| GET / POST | `/rooms` 🔒 / 👑 | List / add rooms |
| PUT / DELETE | `/rooms/:id` 👑 | Edit / delete a room |
| GET / PUT | `/settings` 🔒 / 👑 | Read / change days and periods |
| POST | `/timetable/generate` 👑 | Run the algorithm and save a new timetable |
| GET | `/timetable` 🔒 | Get the latest timetable |
| GET | `/timetable/class/:id` 🔒 | Timetable for one class |
| GET | `/timetable/teacher/:id` 🔒 | Timetable for one teacher |
| GET | `/timetable/room/:id` 🔒 | Timetable for one room |
| GET | `/rooms/free?day=Mon&period=2` 🔒 | Which rooms are free at that time |

---

## 9. The timetable algorithm (the most important part)

File: `server/services/scheduler.js`

### The rules (constraints)
**Hard rules** — must never break:
1. A **teacher** can be in only one place in a period.
2. A **class** can have only one lecture in a period.
3. A **room** can hold only one lecture in a period.
4. A lab subject must go to a **lab** room; the room must be big enough for the class.
5. Each subject gets exactly its **periods per week**.

**Soft rule** — try to follow:
- Don't put the same subject twice on the same day (spread it across the week).

### The steps (in simple words)
```
1. Make a list of "lectures to place".
   Example: DBMS has 4 periods/week → add DBMS 4 times to the list.

2. Sort the list: hardest first (lab subjects, teachers with many classes).
   Hard ones get first pick of the free slots.

3. For each lecture in the list:
     look at every (day, period):
        - is the teacher free?        (check teacherBusy)
        - is the class free?          (check classBusy)
        - is there a free room of the right type and size?  (check roomBusy)
        - is this subject already on this day? (prefer days where it is not)
     If yes → place it there and mark teacher, class, room as busy.
     If no slot works → note it as "could not place".

4. If some lectures could not be placed:
     shuffle the order a little and try again (up to 50 tries).
     Keep the best result (the one with fewest unplaced lectures).

5. Save the timetable to MongoDB and send it back to React,
   along with a list of anything that could not be placed and why.
```

This method is called a **greedy algorithm with random restarts**.
"Greedy" = at each step take the first good slot. "Random restarts" = if it gets stuck, try again in a
different order. It is simple to explain and works well for a college-sized timetable.

### How we check "busy" quickly
We keep three simple lookup tables (JavaScript objects / Sets):
```
teacherBusy["teacherId-Mon-2"] = true
classBusy["classId-Mon-2"]     = true
roomBusy["roomId-Mon-2"]       = true
```
Checking if something is busy is then just one lookup.

---

## 10. Example: what happens when admin clicks "Generate"

```
GenerateTimetable.jsx (React)
   │  axios.post("/api/timetable/generate")   + token in header
   ▼
timetableRoutes.js  →  auth.js (is token valid?)  →  role.js (is user admin?)
   ▼
timetableController.generate()
   │  reads Teachers, Subjects, Classes, Rooms, Settings from MongoDB
   │  calls scheduler.js → returns { slots, unplaced }
   │  saves new Timetable document
   ▼
sends JSON back → React shows success message + the timetable grid
```

---

## 11. Frontend pages

| Page | Who can open it | What it shows |
|------|-----------------|---------------|
| Login | everyone | email + password form |
| Dashboard | all logged-in users | counts + quick links (admin), "my timetable" link (teacher/student) |
| Teachers / Subjects / Classes / Rooms | admin | form to add + table with edit/delete |
| Users | admin | create logins for teachers (linked to a teacher) and students (linked to a class) |
| Settings | admin | working days, periods per day, period times |
| Generate Timetable | admin | big button, result summary, list of problems if any |
| View Timetable | all | dropdown to pick class / teacher / room → weekly grid, Preview PDF button (pop-up with Download) |
| Free Rooms | all | pick day + period (or "Now") → green = free, red = busy (and who is using it) |

---

## 12. Security (basic, enough for a college project)

- Passwords are stored **hashed** with bcrypt, never as plain text.
- After login, the server gives a **JWT token**. React stores it and sends it with every request.
- The `auth` middleware rejects requests without a valid token.
- The `role` middleware makes sure only admins can change data or generate timetables.
- Secrets (MongoDB link, JWT secret) live in `server/.env`, which is not shared or uploaded.

---

## 13. Project plan (step by step)

| Phase | Work | Result you can show |
|-------|------|---------------------|
| **1. Setup** | Create `client` (Vite React) and `server` (Express). Connect MongoDB. | Server says "MongoDB connected"; React page opens. |
| **2. Backend data** | Models + CRUD routes for teachers, subjects, classes, rooms, settings. | Can add/list data using Postman or the browser. |
| **3. Login** | User model, bcrypt, JWT, auth + role middleware, seed an admin user. | Can log in and get a token. |
| **4. Frontend basics** | Login page, AuthContext, Sidebar, ProtectedRoute, Dashboard. | Log in from the website and see the dashboard. |
| **5. Admin screens** | Teachers, Subjects, Classes, Rooms, Users, Settings pages. | Admin can manage all data from the website. |
| **6. Scheduler** | Write `scheduler.js` + generate API + seed sample data. | Click "Generate" → a clash-free timetable is saved. |
| **7. Viewing** | TimetableGrid, View Timetable page, PDF preview and download. | See timetable by class / teacher / room; preview and download it as a PDF. |
| **8. Smart classroom** | Free rooms API + Free Rooms page. | See free/busy rooms for any period. |
| **9. Testing & polish** | Check no clashes, test roles, mobile layout, write README. | Ready for demo and report. |

---

## 14. How to run (after the code is written)

You need **Node.js** (v18 or newer) and **MongoDB** (installed locally, or a free MongoDB Atlas cloud database).

```
# 1. Start the backend
cd server
npm install
npm run seed      # adds sample data + an admin login
npm run dev       # runs on http://localhost:5000

# 2. Start the frontend (in a second terminal)
cd client
npm install
npm run dev       # opens on http://localhost:5173
```

---

## 15. Future ideas (for the "Future Scope" part of your report)

- Teacher leave / substitute teacher suggestions.
- Teachers can mark "unavailable" times.
- Attendance tracking per lecture.
- Email or SMS alerts when the timetable changes.
- Drag-and-drop to manually adjust the generated timetable.
- Export to Excel.
- Smarter algorithm (e.g. genetic algorithm) for very large colleges.
