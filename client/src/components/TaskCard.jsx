// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Pencil, Trash2, Clock, AlertTriangle, CheckCircle2, Circle, CalendarDays, ArrowRightCircle } from "lucide-react";
import { Link } from "react-router-dom";
import useTaskStore from "../store/useTaskStore";
import useAuthStore from "../store/useAuthStore";

const statusConfig = {
  todo: { label: "Todo", color: "text-lime-400 bg-lime-400/10 border-lime-400/30", icon: Circle },
  "in-progress": { label: "In Progress", color: "text-orange-400 bg-orange-400/10 border-orange-400/30", icon: Clock },
  done: { label: "Done", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", icon: CheckCircle2 },
};

const statusFlow = ["todo", "in-progress", "done"];

const priorityConfig = {
  low: { label: "Low", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
  medium: { label: "Medium", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  high: { label: "High", color: "text-red-400 bg-red-400/10 border-red-400/30" },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function TaskCard({ task, onEdit, onDelete, index = 0 }) {
  const { updateTask } = useTaskStore();
  const { authUser } = useAuthStore();
  const isOwner = authUser?._id === (task.user?._id || task.user);
  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const StatusIcon = status.icon;
  const isOverdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  const currentIdx = statusFlow.indexOf(task.status);
  const nextStatus = statusFlow[(currentIdx + 1) % statusFlow.length];
  const nextConfig = statusConfig[nextStatus];
  const NextIcon = nextConfig.icon;

  const handleStatusChange = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await updateTask(task._id, { status: nextStatus });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`card-dark p-5 group hover:border-[#3a3a3a] transition-colors ${
        isOverdue ? "border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.08)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link
          to={`/task/${task._id}`}
          className="text-white font-semibold text-lg no-underline hover:text-lime-400 transition-colors line-clamp-1 flex-1"
        >
          {task.title}
        </Link>
        {isOwner && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-lime-400 hover:bg-[#1e1e1e] transition-all"
              title="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-[#1e1e1e] transition-all"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {/* Clickable status badge — only owner can cycle status */}
        {isOwner ? (
          <button
            onClick={handleStatusChange}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:brightness-125 ${status.color}`}
            title={`Move to ${nextConfig.label}`}
          >
            <StatusIcon size={12} />
            {status.label}
            <ArrowRightCircle size={10} className="opacity-50 ml-0.5" />
          </button>
        ) : (
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${status.color}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
        )}
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${priority.color}`}>
          <AlertTriangle size={12} />
          {priority.label}
        </span>
      </div>

      {/* Owner name */}
      {task.user?.fullName && (
        <p className="text-xs text-gray-600 mt-2">
          by <span className="text-gray-400">{task.user.fullName}</span>
        </p>
      )}

      {(task.startDate || task.dueDate) && (
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          {task.startDate && (
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {fmtDate(task.startDate)}
            </span>
          )}
          {task.startDate && task.dueDate && <span>→</span>}
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-400 font-medium" : ""}`}>
              <Clock size={12} />
              {fmtDate(task.dueDate)}
              {isOverdue && " (Overdue)"}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
