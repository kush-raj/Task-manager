const express = require('express');
const { createTask, getTasksByProject, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// Admin creates tasks, all logged-in users can view
router.route('/').post(protect, admin, createTask);

// Get all tasks for a project (any logged-in user)
router.get('/project/:projectId', protect, getTasksByProject);

// Update: any logged-in user (RBAC enforced in controller)
// Delete: Admin only
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

module.exports = router;
