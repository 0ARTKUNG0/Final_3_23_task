import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, Calendar, Clock, AlertTriangle, CheckCircle2, Circle, PlayCircle, CalendarDays } from "lucide-react";
import axiosInstance from "../services/axios";
import useTaskStore from "../store/useTaskStore";
import useAuthStore from "../store/useAuthStore";
import TaskForm from "../components/TaskForm";
import PageTransition from "../components/PageTransition";
import toast from "react-hot-toast";

const statusConfig = {
  todo: { label: "Todo", color: "text-lime-400 bg-lime-400/10 border-lime-400/30", icon: Circle, step: 0 },
  "in-progress": { label: "In Progress", color: "text-orange-400 bg-orange-400/10 border-orange-400/30", icon: PlayCircle, step: 1 },
  done: { label: "Done", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", icon: CheckCircle2, step: 2 },
};

const priorityConfig = {
  low: { label: "Low", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
  medium: { label: "Medium", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  high: { label: "High", color: "text-red-400 bg-red-400/10 border-red-400/30" },
};

const timelineSteps = [
  { key: "todo", label: "Todo", icon: Circle, color: "lime" },
  { key: "in-progress", label: "In Progress", icon: PlayCircle, color: "orange" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "emerald" },
];

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteTask } = useTaskStore();
  const { authUser } = useAuthStore();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await axiosInstance.get(`/tasks/${id}`);
      setTask(res.data.task);
    } catch {
      toast.error("Task not found");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    await deleteTask(id);
    navigate("/");
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchTask();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card-dark p-8 animate-pulse">
          <div className="h-8 bg-[#2a2a2a] rounded-lg w-1/2 mb-4" />
          <div className="h-4 bg-[#1e1e1e] rounded-lg w-full mb-2" />
          <div className="h-4 bg-[#1e1e1e] rounded-lg w-3/4 mb-6" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-[#1e1e1e] rounded-full" />
            <div className="h-8 w-20 bg-[#1e1e1e] rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const StatusIcon = status.icon;
  const currentStep = status.step;

  const isOwner = authUser?._id === (task.user?._id || task.user);
  const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          {/* Task detail card */}
          <div className={`card-dark-strong p-8 ${isOverdue ? "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : ""}`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-white">{task.title}</h1>
              {isOwner && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="p-2 rounded-lg text-gray-500 hover:text-lime-400 hover:bg-[#1e1e1e] transition-all"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-[#1e1e1e] transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {task.description && (
              <p className="text-gray-300 leading-relaxed mb-6">{task.description}</p>
            )}

            {!task.description && (
              <p className="text-gray-600 italic mb-6">No description provided</p>
            )}

            {/* Badges */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${status.color}`}>
                <StatusIcon size={14} />
                {status.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${priority.color}`}>
                <AlertTriangle size={14} />
                {priority.label} Priority
              </span>
              {isOverdue && (
                <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border text-red-400 bg-red-400/10 border-red-400/30 animate-pulse">
                  <Clock size={14} />
                  Overdue
                </span>
              )}
            </div>

            {/* Owner */}
            {task.user?.fullName && (
              <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
                {task.user.profilePic && (
                  <img src={task.user.profilePic} alt="" className="w-6 h-6 rounded-full object-cover" />
                )}
                <span>Created by <span className="text-gray-300">{task.user.fullName}</span></span>
              </div>
            )}

            {/* Dates Section */}
            {(task.startDate || task.dueDate) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-t border-[#2a2a2a] pt-4 mb-6"
              >
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <CalendarDays size={16} />
                  <span>Schedule</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {task.startDate && (
                    <div className="card-dark p-3">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Start Date</p>
                      <p className="text-sm text-lime-400 font-medium">{formatDate(task.startDate)}</p>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className={`card-dark p-3 ${isOverdue ? "border-red-500/30" : ""}`}>
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Due Date</p>
                      <p className={`text-sm font-medium ${isOverdue ? "text-red-400" : "text-orange-400"}`}>
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-t border-[#2a2a2a] pt-4 mb-6"
            >
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-4">Progress Timeline</p>
              <div className="flex items-center justify-between relative">
                {/* Connecting line (background) */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-[#2a2a2a]" />
                {/* Connecting line (progress) */}
                <motion.div
                  className="absolute top-5 left-[10%] h-0.5 bg-gradient-to-r from-lime-400 via-orange-400 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: currentStep === 0 ? "0%" : currentStep === 1 ? "40%" : "80%" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                />

                {timelineSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const colorMap = {
                    lime: { active: "text-lime-400 bg-lime-400/15 border-lime-400/50", ring: "shadow-[0_0_12px_rgba(163,230,53,0.3)]" },
                    orange: { active: "text-orange-400 bg-orange-400/15 border-orange-400/50", ring: "shadow-[0_0_12px_rgba(251,146,60,0.3)]" },
                    emerald: { active: "text-emerald-400 bg-emerald-400/15 border-emerald-400/50", ring: "shadow-[0_0_12px_rgba(52,211,153,0.3)]" },
                  };
                  const colors = colorMap[step.color];

                  return (
                    <motion.div
                      key={step.key}
                      className="flex flex-col items-center gap-2 relative z-10"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 200 }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isActive ? `${colors.active} ${isCurrent ? colors.ring : ""}` : "text-gray-700 bg-[#111] border-[#2a2a2a]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span className={`text-xs font-medium ${isActive ? "text-gray-300" : "text-gray-700"}`}>
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Timestamps */}
            <div className="border-t border-[#2a2a2a] pt-4 flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                Created: {new Date(task.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                Updated: {new Date(task.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <TaskForm isOpen={isFormOpen} onClose={handleFormClose} task={task} />
      </div>
    </PageTransition>
  );
}
