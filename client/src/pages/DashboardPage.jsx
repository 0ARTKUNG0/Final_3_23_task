import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListFilter, Inbox } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useTaskStore from "../store/useTaskStore";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import LoadingSkeleton from "../components/LoadingSkeleton";
import AnimatedCounter from "../components/AnimatedCounter";
import ProgressRing from "../components/ProgressRing";
import Confetti from "../components/Confetti";
import PageTransition from "../components/PageTransition";

const statusFilters = [
  { value: "", label: "All" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const priorityFilters = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { authUser } = useAuthStore();
  const { tasks, isLoading, fetchTasks, deleteTask, confettiTrigger } = useTaskStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Keyboard shortcut: N = new task
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "n" || e.key === "N") setIsFormOpen(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const completionPercent = taskCounts.total > 0
    ? Math.round((taskCounts.done / taskCounts.total) * 100) : 0;

  const stats = [
    { label: "Total", value: taskCounts.total, color: "text-white" },
    { label: "Todo", value: taskCounts.todo, color: "text-lime-400" },
    { label: "In Progress", value: taskCounts.inProgress, color: "text-orange-400" },
    { label: "Completed", value: taskCounts.done, color: "text-emerald-400" },
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Confetti trigger={confettiTrigger} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              TASK BOARD
            </h1>
            <p className="text-gray-500">
              Welcome, <span className="text-white font-medium">{authUser?.fullName}</span> —{" "}
              <span className="text-lime-400 font-medium">{taskCounts.todo}</span> to do,{" "}
              <span className="text-orange-400 font-medium">{taskCounts.inProgress}</span> in progress,{" "}
              <span className="text-emerald-400 font-medium">{taskCounts.done}</span> completed
            </p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="btn-lime flex items-center gap-2 hidden sm:flex">
            <Plus size={18} />
            New Task
          </button>
        </motion.div>

        {/* Stats + Progress Ring */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants} className="card-dark p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                <AnimatedCounter value={stat.value} />
              </p>
            </motion.div>
          ))}
          <motion.div variants={itemVariants} className="card-dark p-4 flex items-center justify-center col-span-2 sm:col-span-1">
            <ProgressRing percent={completionPercent} size={90} strokeWidth={6} />
          </motion.div>
        </motion.div>

        {/* Animated Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="card-dark p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-bold text-lime-400">{completionPercent}%</span>
          </div>
          <div className="h-2 bg-[#111111] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card-dark p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm">
            <ListFilter size={16} />
            <span>Filters</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {statusFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={statusFilter === f.value ? "pill-tab-active" : "pill-tab"}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Priority</label>
              <div className="flex flex-wrap gap-1.5">
                {priorityFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setPriorityFilter(f.value)}
                    className={
                      priorityFilter === f.value
                        ? "px-4 py-2 text-sm rounded-full bg-orange-500 text-white font-medium border border-orange-500 transition-all duration-200"
                        : "pill-tab"
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Task Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-dark p-12 text-center"
          >
            <Inbox size={48} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-lg text-gray-400 font-medium mb-1">No tasks found</h3>
            <p className="text-gray-600 text-sm">
              {tasks.length === 0
                ? "Create your first task to get started!"
                : "Try adjusting your filters"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Floating Action Button - Mobile */}
        <motion.button
          onClick={() => setIsFormOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-lime-400 text-black flex items-center justify-center shadow-[0_0_25px_rgba(163,230,53,0.3)] z-40"
        >
          <Plus size={24} />
        </motion.button>

        {/* Task Form Modal */}
        <TaskForm isOpen={isFormOpen} onClose={handleCloseForm} task={editingTask} />
      </div>
    </PageTransition>
  );
}
