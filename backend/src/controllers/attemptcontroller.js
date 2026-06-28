const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

// Submit quiz attempt - Logged-in user
const submitAttempt = async (req, res) => {
    try {
        const { quizId, answers, timeTaken } = req.body;

        if (!quizId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "Quiz ID and answers are required",
            });
        }

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found",
            });
        }

        const questions = await Question.find({ quiz: quizId });

        if (questions.length === 0) {
            return res.status(400).json({
                message: "This quiz has no questions",
            });
        }

        let score = 0;
        let totalMarks = 0;
        let correctCount = 0;
        let incorrectCount = 0;

        const checkedAnswers = questions.map((question) => {
            const userAnswer = answers.find(
                (ans) => ans.questionId === question._id.toString()
            );

            totalMarks += question.marks;

            const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : "";

            const isCorrect = selectedAnswer === question.correctAnswer;

            let marksAwarded = 0;

            if (isCorrect) {
                marksAwarded = question.marks;
                score += question.marks;
                correctCount++;
            } else {
                incorrectCount++;
            }

            return {
                question: question._id,
                selectedAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                marksAwarded,
            };
        });

        const percentage = Number(((score / totalMarks) * 100).toFixed(2));

        const attempt = await Attempt.create({
            user: req.user._id,
            quiz: quizId,
            answers: checkedAnswers,
            score,
            totalMarks,
            percentage,
            correctCount,
            incorrectCount,
            timeTaken: timeTaken || 0,
        });

        const populatedAttempt = await Attempt.findById(attempt._id)
            .populate("quiz", "title difficulty timeLimit")
            .populate("answers.question", "questionText options");

        res.status(201).json({
            message: "Quiz submitted successfully",
            result: populatedAttempt,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to submit quiz",
            error: error.message,
        });
    }
};

// Get logged-in user's attempt history
const getMyAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ user: req.user._id })
            .populate("quiz", "title difficulty timeLimit")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: attempts.length,
            attempts,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch attempt history",
            error: error.message,
        });
    }
};

// Get single attempt result
const getAttemptById = async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id)
            .populate("quiz", "title difficulty timeLimit")
            .populate("answers.question", "questionText options");

        if (!attempt) {
            return res.status(404).json({
                message: "Attempt not found",
            });
        }

        if (
            attempt.user.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to view this attempt",
            });
        }

        res.status(200).json({
            attempt,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch attempt result",
            error: error.message,
        });
    }
};

// Admin: Get all attempts
const getAllAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find()
            .populate("user", "name email")
            .populate("quiz", "title difficulty")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: attempts.length,
            attempts,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch all attempts",
            error: error.message,
        });
    }
};
// Get logged-in user's dashboard stats
const getMyStats = async (req, res) => {
    try {
        const attempts = await Attempt.find({ user: req.user._id })
            .populate("quiz", "title difficulty")
            .sort({ createdAt: -1 });

        const totalQuizzesPlayed = attempts.length;

        if (totalQuizzesPlayed === 0) {
            return res.status(200).json({
                totalQuizzesPlayed: 0,
                averageScore: 0,
                bestScore: 0,
                accuracy: 0,
                totalCorrectAnswers: 0,
                totalIncorrectAnswers: 0,
                recentAttempts: [],
            });
        }

        let totalPercentage = 0;
        let bestScore = 0;
        let totalCorrectAnswers = 0;
        let totalIncorrectAnswers = 0;

        attempts.forEach((attempt) => {
            totalPercentage += attempt.percentage;

            if (attempt.percentage > bestScore) {
                bestScore = attempt.percentage;
            }

            totalCorrectAnswers += attempt.correctCount;
            totalIncorrectAnswers += attempt.incorrectCount;
        });

        const averageScore = Number(
            (totalPercentage / totalQuizzesPlayed).toFixed(2)
        );

        const totalAnswers = totalCorrectAnswers + totalIncorrectAnswers;

        const accuracy =
            totalAnswers === 0
                ? 0
                : Number(((totalCorrectAnswers / totalAnswers) * 100).toFixed(2));

        const recentAttempts = attempts.slice(0, 5);

        res.status(200).json({
            totalQuizzesPlayed,
            averageScore,
            bestScore,
            accuracy,
            totalCorrectAnswers,
            totalIncorrectAnswers,
            recentAttempts,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
            error: error.message,
        });
    }
};

module.exports = {
    submitAttempt,
    getMyAttempts,
    getAttemptById,
    getAllAttempts,
    getMyStats,
};