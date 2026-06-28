const Category = require("../models/Category");

// Create category - Admin only
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required",
            });
        }

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists",
            });
        }

        const category = await Category.create({
            name,
            description,
        });

        res.status(201).json({
            message: "Category created successfully",
            category,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create category",
            error: error.message,
        });
    }
};

// Get all categories - Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            count: categories.length,
            categories,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message,
        });
    }
};

// Update category - Admin only
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        category.name = name || category.name;
        category.description = description || category.description;

        const updatedCategory = await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            category: updatedCategory,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update category",
            error: error.message,
        });
    }
};

// Delete category - Admin only
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        await category.deleteOne();

        res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete category",
            error: error.message,
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};