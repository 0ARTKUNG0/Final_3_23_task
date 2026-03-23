const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const { protectedRoute } = require("../middleware/auth.middleware");

router.post("/register", userController.signUp);
router.post("/login", userController.signIn);
router.post("/logout", userController.signOut);
router.get("/check-auth", protectedRoute, userController.checkAuth);
router.get("/me", protectedRoute, userController.getUsers);

module.exports = router;