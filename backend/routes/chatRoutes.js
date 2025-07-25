const express = require("express");
const {accessChat, fetchChats ,createGroupChat, removeFromGroup, renameGroup, addToGroup} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(protect, accessChat); //only loged user can access
router.route("/").get(protect, fetchChats); 
router.route("/group").put(protect, createGroupChat); 
router.route("/rename").put(protect, renameGroup); 
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);


module.exports = router;
