import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import useTaskStore from "../store/useTaskStore";
import TaskForm from "../components/TaskForm";
import PageTransition from "../components/PageTransition";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const statusColors = {
  todo: "bg-lime-400",
  "in-progress": "bg-orange-400",
  done: "bg-emerald-400",
};

// Use local date to avoid UTC timezone shift (Thailand UTC+7)
function toDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MAX_LANES = 3;

export default function CalendarPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, outside: true, date: new Date(year, month - 1, prevMonthDays - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, outside: false, date: new Date(year, month, i) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, outside: true, date: new Date(year, month + 1, i) });
    }
    return days;
  }, [year, month]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      w.push(calendarDays.slice(i, i + 7));
    }
    return w;
  }, [calendarDays]);

  // Build task ranges using local dates
  const taskRanges = useMemo(() => {
    return tasks
      .filter((t) => (t.startDate || t.dueDate) && t.status !== "done")
      .map((t) => ({
        ...t,
        rangeStart: t.startDate ? toDateKey(t.startDate) : toDateKey(t.dueDate),
        rangeEnd: t.dueDate ? toDateKey(t.dueDate) : t.startDate ? toDateKey(t.startDate) : null,
      }));
  }, [tasks]);

  // For a given week, compute task bars with lane assignments
  const getWeekBars = (week) => {
    const weekStartKey = toDateKey(week[0].date);
    const weekEndKey = toDateKey(week[6].date);

    const bars = [];
    taskRanges.forEach((t) => {
      if (!t.rangeEnd || t.rangeEnd < weekStartKey || t.rangeStart > weekEndKey) return;

      let startCol = 0;
      let endCol = 6;

      for (let i = 0; i < 7; i++) {
        if (toDateKey(week[i].date) >= t.rangeStart) { startCol = i; break; }
      }
      for (let i = 6; i >= 0; i--) {
        if (toDateKey(week[i].date) <= t.rangeEnd) { endCol = i; break; }
      }

      bars.push({
        task: t,
        startCol,
        endCol,
        isStart: t.rangeStart >= weekStartKey,
        isEnd: t.rangeEnd <= weekEndKey,
      });
    });

    // Greedy lane assignment
    const lanes = [];
    bars.forEach((bar) => {
      let lane = 0;
      while (true) {
        if (!lanes[lane]) lanes[lane] = [];
        const conflict = lanes[lane].some(
          (b) => !(bar.endCol < b.startCol || bar.startCol > b.endCol)
        );
        if (!conflict) {
          lanes[lane].push(bar);
          bar.lane = lane;
          break;
        }
        lane++;
      }
    });

    return { bars, laneCount: lanes.length };
  };

  const todayKey = toDateKey(new Date());

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleDayClick = (dateObj) => {
    setSelectedDate(toDateKey(dateObj));
    setIsFormOpen(true);
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {MONTHS[month]} {year}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="btn-outline text-sm px-4 py-1.5">
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-2 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-gray-400 hover:text-white hover:border-[#3e3e3e] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-gray-400 hover:text-white hover:border-[#3e3e3e] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          {[
            { label: "Todo", color: "bg-lime-400" },
            { label: "In Progress", color: "bg-orange-400" },
            { label: "Done", color: "bg-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card-dark-strong overflow-hidden"
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#1e1e1e]">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs text-gray-500 uppercase tracking-wider py-2.5 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Week rows */}
          {weeks.map((week, wi) => {
            const { bars, laneCount } = getWeekBars(week);
            const visibleLanes = Math.min(laneCount, MAX_LANES);
            const overflowCount = bars.filter((b) => b.lane >= MAX_LANES).length;

            return (
              <div key={wi} className="border-b border-[#1e1e1e] last:border-b-0">
                {/* Day number cells */}
                <div className="grid grid-cols-7">
                  {week.map((d, di) => {
                    const dayKey = toDateKey(d.date);
                    const isToday = dayKey === todayKey;

                    return (
                      <div
                        key={di}
                        onClick={() => handleDayClick(d.date)}
                        className={`px-2 pt-1.5 pb-0.5 cursor-pointer border-r border-[#1e1e1e] last:border-r-0 transition-colors hover:bg-[#1a1a1a] ${
                          d.outside ? "bg-[#0c0c0c]" : ""
                        } ${isToday ? "bg-[#161e10]" : ""}`}
                      >
                        <span
                          className={`text-xs ${
                            isToday
                              ? "text-lime-400 font-bold"
                              : d.outside
                                ? "text-gray-700"
                                : "text-gray-400"
                          }`}
                        >
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Task bar lanes */}
                <div
                  className="grid grid-cols-7"
                  style={{
                    minHeight: visibleLanes > 0 ? `${visibleLanes * 22 + 6}px` : "28px",
                  }}
                >
                  {/* Clickable day columns (background, for click-to-create) */}
                  {week.map((d, di) => (
                    <div
                      key={`bg-${di}`}
                      onClick={() => handleDayClick(d.date)}
                      className={`cursor-pointer border-r border-[#1e1e1e] last:border-r-0 transition-colors hover:bg-[#1a1a1a] ${
                        d.outside ? "bg-[#0c0c0c]" : ""
                      } ${toDateKey(d.date) === todayKey ? "bg-[#161e10]" : ""}`}
                      style={{ gridColumn: di + 1, gridRow: "1 / -1" }}
                    />
                  ))}

                  {/* Task bars */}
                  {bars
                    .filter((b) => b.lane < MAX_LANES)
                    .map((bar) => (
                      <Link
                        key={`${bar.task._id}-${wi}`}
                        to={`/task/${bar.task._id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          gridColumn: `${bar.startCol + 1} / ${bar.endCol + 2}`,
                          gridRow: 1,
                          marginTop: `${bar.lane * 22 + 2}px`,
                          height: "18px",
                          zIndex: 10,
                        }}
                        className={`relative block text-[10px] leading-[18px] px-2 text-black font-medium truncate no-underline hover:brightness-110 transition-all ${
                          statusColors[bar.task.status] || "bg-gray-400"
                        } ${bar.isStart ? "rounded-l-md ml-0.5" : ""} ${
                          bar.isEnd ? "rounded-r-md mr-0.5" : ""
                        }`}
                      >
                        {bar.isStart ? bar.task.title : ""}
                      </Link>
                    ))}

                  {/* Overflow indicator */}
                  {overflowCount > 0 && (
                    <div
                      className="text-[10px] text-gray-500 px-2 relative z-10"
                      style={{
                        gridColumn: "1 / 2",
                        gridRow: 1,
                        marginTop: `${MAX_LANES * 22 + 2}px`,
                      }}
                    >
                      +{overflowCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        <TaskForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setSelectedDate(""); }}
          defaultDate={selectedDate}
        />
      </div>
    </PageTransition>
  );
}
