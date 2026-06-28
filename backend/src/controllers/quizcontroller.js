const Quiz = require("../models/Quiz");
const Category = require("../models/Category");

// Create quiz - Admin only
const createQuiz = async (req, res) => {
    try {
        const { title, description, category, difficulty, timeLimit, isActive } =
            req.body;

        if (!title || !category || !difficulty || !timeLimit) {
            return res.status(400).json({
                message: "Title, category, difficulty, and time limit are required",
            });
        }

        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        const quiz = await Quiz.create({
            title,
            description,
            category,
            difficulty,
            timeLimit,
            isActive,
            createdBy: req.user._id,
        });

        const populatedQuiz = await Quiz.findById(quiz._id)
            .populate("category", "name")
            .populate("createdBy", "name email");

        res.status(201).json({
            message: "Quiz created successfully",
            quiz: populatedQuiz,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create quiz",
            error: error.message,
        });
    }
};

// Get all quizzes - Public
const getQuizzes = async (req, res) => {
    try {
        const { category, difficulty } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const quizzes = await Quiz.find(filter)
            .populate("category", "name")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: quizzes.length,
            quizzes,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quizzes",
            error: error.message,
        });
    }
};

// Get single quiz - Public
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate("category", "name")
            .populate("createdBy", "name email");

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found",
            });
        }

        res.status(200).json({
            quiz,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quiz",
            error: error.message,
        });
    }
};

// Update quiz - Admin only
const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found",
            });
        }

        const { title, description, category, difficulty, timeLimit, isActive } =
            req.body;

        if (category) {
            const categoryExists = await Category.findById(category);

            if (!categoryExists) {
                return res.status(404).json({
                    message: "Category not found",
                });
            }
        }

        quiz.title = title || quiz.title;
        quiz.description = description || quiz.description;
        quiz.category = category || quiz.category;
        quiz.difficulty = difficulty || quiz.difficulty;
        quiz.timeLimit = timeLimit || quiz.timeLimit;

        if (typeof isActive === "boolean") {
            quiz.isActive = isActive;
        }

        const updatedQuiz = await quiz.save();

        const populatedQuiz = await Quiz.findById(updatedQuiz._id)
            .populate("category", "name")
            .populate("createdBy", "name email");

        res.status(200).json({
            message: "Quiz updated successfully",
            quiz: populatedQuiz,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update quiz",
            error: error.message,
        });
    }
};

// Delete quiz - Admin only
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found",
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            message: "Quiz deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete quiz",
            error: error.message,
        });
    }
};

module.exports = {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
};