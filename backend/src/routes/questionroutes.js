const express = require("express");

const {
    addQuestion,
    getQuestionsByQuiz,
    updateQuestion,
    deleteQuestion,
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/quiz/:quizId", getQuestionsByQuiz);
router.post("/", protect, adminOnly, addQuestion);
router.put("/:id", protect, adminOnly, updateQuestion);
router.delete("/:id", protect, adminOnly, deleteQuestion);

module.exports = router;