import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import useTaskStore from "../store/useTaskStore";

export default function TaskForm({ isOpen, onClose, task = null, defaultDate = "" }) {
  const { createTask, updateTask } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    startDate: "",
    dueDate: "",
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        startDate: task.startDate ? task.startDate.slice(0, 10) : "",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        startDate: "",
        dueDate: defaultDate || "",
      });
    }
    setErrors({});
  }, [task, isOpen, defaultDate]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (form.startDate && form.dueDate && form.startDate > form.dueDate) {
      newErrors.dueDate = "Due date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...form,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
      };
      if (isEditing) {
        await updateTask(task._id, data);
      } else {
        await createTask(data);
      }
      onClose();
    } catch {
      // error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="card-dark-strong p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#2a2a2a] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`dark-input ${errors.title ? "border-orange-500/50" : ""}`}
                  placeholder="What needs to be done?"
                />
                {errors.title && <p className="text-orange-400 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="dark-input resize-none"
                  rows={3}
                  placeholder="Add some details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="dark-select"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="dark-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="dark-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className={`dark-input ${errors.dueDate ? "border-orange-500/50" : ""}`}
                  />
                  {errors.dueDate && <p className="text-orange-400 text-xs mt-1">{errors.dueDate}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-lime w-full mt-2"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
