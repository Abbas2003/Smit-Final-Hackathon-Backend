import express from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment.model.js';
import Joi from 'joi';

const router = express.Router();

// Joi validation schemas
const createAssignmentSchema = Joi.object({
    trainer: Joi.string().required(),
    batchNo: Joi.string().required(),
    course: Joi.string().required(),
    section: Joi.string().required(),
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    status: Joi.string().valid("inactive", "active", "completed").default("active"),
    dueDate: Joi.date().required(),
});

const updateAssignmentSchema = Joi.object({
    trainer: Joi.string(),
    batchNo: Joi.string(),
    course: Joi.string(),
    section: Joi.string(),
    title: Joi.string().trim(),
    description: Joi.string().trim(),
    status: Joi.string().valid("inactive", "active", "completed"),
    dueDate: Joi.date(),
});

// POST API to create an assignment
router.post('/add-assignment', async (req, res) => {
    try {
        const { error } = createAssignmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
        }

        const { trainer, batchNo, course, section, title, description, status, dueDate } = req.body;

        const newAssignment = new Assignment({
            trainer,
            batchNo,
            course,
            section,
            title,
            description,
            status,
            dueDate,
        });

        const savedAssignment = await newAssignment.save();

        res.status(201).json({
            message: 'Assignment created successfully',
            data: savedAssignment,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating assignment',
            error: error.message,
        });
    }
});

// GET API to retrieve all assignments
router.get('/all-assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('trainer', 'name email')
            .populate('batchNo', 'batchName')
            .populate('course', 'courseName')
            .populate('section', 'sectionName');

        res.status(200).json({
            message: 'Assignments retrieved successfully',
            data: assignments,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving assignments',
            error: error.message,
        });
    }
});

// GET API to retrieve a single assignment
router.get('/single-assignment/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid assignment ID' });
        }

        const assignment = await Assignment.findById(id)
            .populate('trainer', 'name email')
            .populate('batchNo', 'batchName')
            .populate('course', 'courseName')
            .populate('section', 'sectionName');

        if (!assignment) {
            return res.status(404).json({
                message: 'Assignment not found',
            });
        }

        res.status(200).json({
            message: 'Assignment retrieved successfully',
            data: assignment,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving the assignment',
            error: error.message,
        });
    }
});

// Update an assignment (PUT request)
router.put('/update-assignment/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid assignment ID' });
        }

        const { error } = updateAssignmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
        }

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updatedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({
            message: 'Assignment updated successfully',
            data: updatedAssignment,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating assignment',
            error: error.message,
        });
    }
});

// Delete an assignment (DELETE request)
router.delete('/delete-assignment/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid assignment ID' });
        }

        const deletedAssignment = await Assignment.findByIdAndDelete(id);

        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting assignment', error: error.message });
    }
});

export default router;
