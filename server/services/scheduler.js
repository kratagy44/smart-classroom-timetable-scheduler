// =====================================================================
//  TIMETABLE GENERATOR  —  the "brain" of the project
// =====================================================================
//
//  HARD RULES (never broken):
//    1. A teacher teaches only one lecture in a period.
//    2. A class attends only one lecture in a period.
//    3. A room holds only one lecture in a period.
//    4. Lab subjects go to lab rooms, other subjects go to classrooms,
//       and the room must be big enough for the class.
//    5. Every subject gets its "periods per week".
//
//  SOFT RULE (followed when possible):
//    - Do not put the same subject twice on the same day.
//
//  METHOD: "greedy algorithm with random restarts"
//    - Greedy: place lectures one by one, each in the best free slot.
//    - Random restarts: if some lectures do not fit, try again in a
//      slightly different order, and keep the best result.
// =====================================================================

const MAX_TRIES = 50;

// Turns an ObjectId (or a populated document) into a plain string id.
const id = (x) => String(x && x._id ? x._id : x);

// Mixes an array into a random order (Fisher–Yates shuffle).
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Step 1: one "lecture" for every period of every subject.
// Example: DBMS with 4 periods/week -> DBMS is added 4 times.
function makeLectureList(subjects) {
  const lectures = [];
  for (const subject of subjects) {
    for (let i = 0; i < subject.periodsPerWeek; i++) lectures.push(subject);
  }
  return lectures;
}

// How hard is a subject to place? Harder ones are placed first,
// so they get first pick of the free slots.
function difficulty(subject, teacherLoad, classLoad) {
  let score = 0;
  if (subject.needsLab) score += 100; // labs are few, so lab subjects are hard
  score += teacherLoad[id(subject.teacher)]; // busy teachers are hard
  score += classLoad[id(subject.classGroup)];
  return score;
}

// One try at building the full timetable.
// "randomness" = 0 on the first try, more on later tries.
function buildOnce(lectures, rooms, days, periodsPerDay, randomness) {
  const busy = new Set(); // e.g. "T:<teacherId>:Mon:2" means that teacher is busy Mon period 2
  const subjectOnDay = new Set(); // e.g. "<subjectId>:Mon"
  const usualRoom = {}; // class -> room it used last time (keeps a class in the same room)
  const slots = [];
  const failed = [];

  for (const subject of lectures) {
    const teacherId = id(subject.teacher);
    const classId = id(subject.classGroup);
    const subjectId = id(subject);
    const roomType = subject.needsLab ? "lab" : "classroom";

    // Rooms of the right type and big enough, smallest first (save big rooms for big classes).
    const fittingRooms = rooms
      .filter((r) => r.type === roomType && r.capacity >= subject.classGroup.strength)
      .sort((a, b) => a.capacity - b.capacity);

    let best = null;

    for (const day of days) {
      for (let period = 1; period <= periodsPerDay; period++) {
        // Rule 1 and 2: teacher and class must be free.
        if (busy.has(`T:${teacherId}:${day}:${period}`)) continue;
        if (busy.has(`C:${classId}:${day}:${period}`)) continue;

        // Rule 3 and 4: a suitable room must be free.
        const freeRooms = fittingRooms.filter((r) => !busy.has(`R:${id(r)}:${day}:${period}`));
        if (freeRooms.length === 0) continue;
        const room = freeRooms.find((r) => id(r) === usualRoom[classId + roomType]) || freeRooms[0];

        // Lower score = better slot.
        let score = period; // prefer earlier periods
        if (subjectOnDay.has(`${subjectId}:${day}`)) score += 100; // soft rule
        score += Math.random() * randomness;

        if (!best || score < best.score) best = { day, period, room, score };
      }
    }

    if (!best) {
      failed.push(subject);
      continue;
    }

    // Place the lecture and mark everyone as busy in that slot.
    const { day, period, room } = best;
    busy.add(`T:${teacherId}:${day}:${period}`);
    busy.add(`C:${classId}:${day}:${period}`);
    busy.add(`R:${id(room)}:${day}:${period}`);
    subjectOnDay.add(`${subjectId}:${day}`);
    usualRoom[classId + roomType] = id(room);

    slots.push({
      day,
      period,
      classGroup: classId,
      subject: subjectId,
      teacher: teacherId,
      room: id(room),
    });
  }

  return { slots, failed };
}

// Explains in simple words why a subject could not be fully placed.
function explain(subject, rooms, teacherLoad, classLoad, slotsPerWeek) {
  const roomType = subject.needsLab ? "lab" : "classroom";
  const strength = subject.classGroup.strength;

  if (!rooms.some((r) => r.type === roomType && r.capacity >= strength)) {
    return `No ${roomType} has space for ${strength} students. Add a bigger ${roomType}.`;
  }
  if (teacherLoad[id(subject.teacher)] > slotsPerWeek) {
    return `${subject.teacher.name} has ${teacherLoad[id(subject.teacher)]} periods, but a week has only ${slotsPerWeek} slots.`;
  }
  if (classLoad[id(subject.classGroup)] > slotsPerWeek) {
    return `${subject.classGroup.name} needs ${classLoad[id(subject.classGroup)]} periods, but a week has only ${slotsPerWeek} slots.`;
  }
  return "No time where the teacher, the class and a suitable room are all free. Try adding rooms, adding periods per day, or reducing periods per week.";
}

// MAIN FUNCTION
// subjects must have teacher and classGroup filled in (populated).
function generateTimetable({ subjects, rooms, days, periodsPerDay }) {
  const slotsPerWeek = days.length * periodsPerDay;

  // Count total periods for every teacher and every class.
  const teacherLoad = {};
  const classLoad = {};
  for (const s of subjects) {
    teacherLoad[id(s.teacher)] = (teacherLoad[id(s.teacher)] || 0) + s.periodsPerWeek;
    classLoad[id(s.classGroup)] = (classLoad[id(s.classGroup)] || 0) + s.periodsPerWeek;
  }

  let bestResult = null;

  for (let tryNo = 0; tryNo < MAX_TRIES; tryNo++) {
    // Order the lectures: hardest first. From the 2nd try, add some randomness.
    const lectures = shuffle(makeLectureList(subjects));
    const noise = tryNo === 0 ? 0 : 30;
    const priority = new Map(
      subjects.map((s) => [s, difficulty(s, teacherLoad, classLoad) + Math.random() * noise])
    );
    lectures.sort((a, b) => priority.get(b) - priority.get(a));

    const result = buildOnce(lectures, rooms, days, periodsPerDay, tryNo === 0 ? 0 : 3);

    if (!bestResult || result.failed.length < bestResult.failed.length) bestResult = result;
    if (bestResult.failed.length === 0) break; // perfect timetable found
  }

  // Group the failed lectures by subject, with a reason.
  const unplacedMap = new Map();
  for (const s of bestResult.failed) {
    if (!unplacedMap.has(s)) {
      unplacedMap.set(s, {
        subject: s.name,
        classGroup: s.classGroup.name,
        teacher: s.teacher.name,
        missing: 0,
        reason: explain(s, rooms, teacherLoad, classLoad, slotsPerWeek),
      });
    }
    unplacedMap.get(s).missing++;
  }

  return { slots: bestResult.slots, unplaced: [...unplacedMap.values()] };
}

module.exports = { generateTimetable };
