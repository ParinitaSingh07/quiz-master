const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

// Add question - Admin only
const addQuestion = async (req, res) => {
    try {
        const { quiz, questionText, options, correctAnswer, marks } = req.body;

        if (!quiz || !questionText || !options || !correctAnswer) {
            return res.status(400).json({
                message: "Quiz, question text, options, and correct answer are required",
            });
        }

        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({
                message: "Options must be an array of exactly 4 choices",
            });
        }

        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "Correct answer must be one of the given options",
            });
        }

        const quizExists = await Quiz.findById(quiz);

        if (!quizExists) {
            return res.status(404).json({
                message: "Quiz not found",
            });
        }

        const question = await Question.create({
            quiz,
            questionText,
            options,
            correctAnswer,
            marks,
        });

        const totalQuestions = await Question.countDocuments({ quiz });

        quizExists.totalQuestions = totalQuestions;
        await quizExists.save();

        res.status(201).json({
            message: "Question added successfully",
            question,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add question",
            error: error.message,
        });
    }
};

// Get questions by quiz - Public for now
const getQuestionsByQuiz = async (req, res) => {
    try {
        const questions = await Question.find({
            quiz: req.params.quizId,
        }).sort({ createdAt: 1 });

        res.status(200).json({
            count: questions.length,
            questions,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch questions",
            error: error.message,
        });
    }
};

// Update question - Admin only
const updateQuestion = async (req, res) => {
    try {
        const { questionText, options, correctAnswer, marks } = req.body;

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                message: "Question not found",
            });
        }

        if (options) {
            if (!Array.isArray(options) || options.length !== 4) {
                return res.status(400).json({
                    message: "Options must be an array of exactly 4 choices",
                });
            }

            if (correctAnswer && !options.includes(correctAnswer)) {
                return res.status(400).json({
                    message: "Correct answer must be one of the given options",
                });
            }
        }

        question.questionText = questionText || question.questionText;
        question.options = options || question.options;
        question.correctAnswer = correctAnswer || question.correctAnswer;
        question.marks = marks || question.marks;

        const updatedQuestion = await question.save();

        res.status(200).json({
            message: "Question updated successfully",
            question: updatedQuestion,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update question",
            error: error.message,
        });
    }
};

// Delete question - Admin only
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                message: "Question not found",
            });
        }

        const quizId = question.quiz;

        await question.deleteOne();

        const quiz = await Quiz.findById(quizId);

        if (quiz) {
            const totalQuestions = await Question.countDocuments({ quiz: quizId });
            quiz.totalQuestions = totalQuestions;
            await quiz.save();
        }

        res.status(200).json({
            message: "Question deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete question",
            error: error.message,
        });
    }
};

module.exports = {
    addQuestion,
    getQuestionsByQuiz,
    updateQuestion,
    deleteQuestion,
};