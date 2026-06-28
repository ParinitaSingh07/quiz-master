const express = require("express");

const {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.post("/", protect, adminOnly, createQuiz);
router.put("/:id", protect, adminOnly, updateQuiz);
router.delete("/:id", protect, adminOnly, deleteQuiz);

module.exports = router;