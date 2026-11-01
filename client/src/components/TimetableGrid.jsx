// Draws a weekly timetable: days are rows, periods are columns.
//
// Props:
//   timetable - { days, periodsPerDay, periodTimes, slots }
//   mode      - "class" | "teacher" | "room"  (decides what extra info each cell shows)
import { colorFor, cellDetails } from "../utils/timetable";

export default function TimetableGrid({ timetable, mode }) {
  const { days, periodsPerDay, periodTimes = [], slots } = timetable;
  const periods = Array.from({ length: periodsPerDay }, (_, i) => i + 1);

  // Quick lookup: "Mon-2" -> slot
  const byCell = {};
  for (const slot of slots) byCell[`${slot.day}-${slot.period}`] = slot;

  return (
    <div className="table-wrap">
      <table className="timetable">
        <thead>
          <tr>
            <th>Day</th>
            {periods.map((p) => (
              <th key={p}>
                Period {p}
                {periodTimes[p - 1] && <div className="period-time">{periodTimes[p - 1]}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <th>{day}</th>
              {periods.map((p) => {
                const slot = byCell[`${day}-${p}`];
                if (!slot) return <td key={p} className="free-cell">—</td>;
                return (
                  <td key={p} style={{ background: colorFor(slot.subject.name) }}>
                    <div className="subject-name">
                      {slot.subject.name}
                      {slot.subject.needsLab && <span className="lab-badge">LAB</span>}
                    </div>
                    {cellDetails(slot, mode).map((line) => (
                      <div key={line} className="cell-detail">
                        {line}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
