const Task = require("../model/task.model");
const mongoose = require("mongoose");

const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, startDate, dueDate } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const task = await Task.create({
            title,
            description,
            status,
            priority,
            startDate: startDate || null,
            dueDate: dueDate || null,
            user: req.user._id
        });
        res.status(201).json({ task });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error while creating task" });
    }
};

const getTasks = async (req, res) => {
    try {
        const filter = {};
        // If ?mine=true, show only the logged-in user's tasks
        if (req.query.mine === "true") {
            filter.user = req.user._id;
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.priority) {
            filter.priority = req.query.priority;
        }
        if (req.query.dueDateFrom || req.query.dueDateTo) {
            filter.dueDate = {};
            if (req.query.dueDateFrom) filter.dueDate.$gte = new Date(req.query.dueDateFrom);
            if (req.query.dueDateTo) filter.dueDate.$lte = new Date(req.query.dueDateTo);
        }
        const tasks = await Task.find(filter).populate("user", "fullName profilePic").sort({ createdAt: -1 });
        res.status(200).json({ tasks });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error while fetching tasks" });
    }
};

const getTaskById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await Task.findById(req.params.id).populate("user", "fullName profilePic");
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ task });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error while fetching task" });
    }
};

const updateTask = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        const updates = {};
        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.description !== undefined) updates.description = req.body.description;
        if (req.body.status !== undefined) updates.status = req.body.status;
        if (req.body.priority !== undefined) updates.priority = req.body.priority;
        if ("startDate" in req.body) updates.startDate = req.body.startDate || null;
        if ("dueDate" in req.body) updates.dueDate = req.body.dueDate || null;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        res.status(200).json({ task: updatedTask });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error while updating task" });
    }
};

const deleteTask = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error while deleting task" });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};
