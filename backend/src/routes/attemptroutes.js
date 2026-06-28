const express = require("express");

const {
    submitAttempt,
    getMyAttempts,
    getAttemptById,
    getAllAttempts,
    getMyStats,
} = require("../controllers/attemptController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/submit", protect, submitAttempt);
router.get("/my-attempts", protect, getMyAttempts);
router.get("/my-stats", protect, getMyStats);
router.get("/all", protect, adminOnly, getAllAttempts);
router.get("/:id", protect, getAttemptById);

module.exports = router;