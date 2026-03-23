const express = require("express");
const router = express.Router();
const taskController = require("../controller/task.controller");
const { protectedRoute } = require("../middleware/auth.middleware");

router.post("/", protectedRoute, taskController.createTask);
router.get("/", protectedRoute, taskController.getTasks);
router.get("/:id", protectedRoute, taskController.getTaskById);
router.put("/:id", protectedRoute, taskController.updateTask);
router.delete("/:id", protectedRoute, taskController.deleteTask);

module.exports = router;
