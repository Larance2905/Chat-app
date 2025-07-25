const express = require("express");
const { regUser, authUser, allUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Route to register a new user and get all users
router.route("/").post(regUser).get(protect,allUsers);

// Route to login a user
router.post("/login", authUser);

module.exports = router;
