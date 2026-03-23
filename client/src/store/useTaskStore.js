import { create } from "zustand";
import axiosInstance from "../services/axios";
import toast from "react-hot-toast";

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  confettiTrigger: 0,

  fetchTasks: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
      if (filters.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
      const query = params.toString();
      const res = await axiosInstance.get(`/tasks${query ? `?${query}` : ""}`);
      set({ tasks: res.data.tasks });
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch tasks";
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/tasks", taskData);
      set({ tasks: [res.data.task, ...get().tasks] });
      toast.success("Task created!");
      return res.data.task;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create task";
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, taskData) => {
    set({ error: null });
    try {
      const res = await axiosInstance.put(`/tasks/${id}`, taskData);
      set({
        tasks: get().tasks.map((t) => (t._id === id ? res.data.task : t)),
      });
      toast.success("Task updated!");
      if (taskData.status === "done") {
        set({ confettiTrigger: get().confettiTrigger + 1 });
      }
      return res.data.task;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update task";
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ error: null });
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      set({ tasks: get().tasks.filter((t) => t._id !== id) });
      toast.success("Task deleted!");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete task";
      set({ error: message });
      toast.error(message);
    }
  },
}));

export default useTaskStore;
