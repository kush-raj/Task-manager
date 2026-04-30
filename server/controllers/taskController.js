const Task = require('../models/Task');

// @desc    Create new task
// @route   POST /api/tasks (Admin only)
const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;
  const task = new Task({ title, description, projectId, assignedTo, status, priority, dueDate });
  const createdTask = await task.save();
  const populated = await Task.findById(createdTask._id).populate('assignedTo', 'name email avatar');
  res.status(201).json(populated);
};

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
const getTasksByProject = async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.projectId })
    .populate('assignedTo', 'name email avatar');
  res.json(tasks);
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// Admin: full update | Member: can only update their own assigned tasks (status only)
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const isAdmin = req.user.role === 'Admin';
  const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssigned) {
    return res.status(403).json({ message: 'Not authorized. You can only update tasks assigned to you.' });
  }

  const { title, description, assignedTo, status, priority, dueDate } = req.body;

  if (isAdmin) {
    // Admin can change everything
    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
    task.status = status !== undefined ? status : task.status;
    task.priority = priority !== undefined ? priority : task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
  } else {
    // Member can only update status of their assigned task
    task.status = status !== undefined ? status : task.status;
  }

  const updatedTask = await task.save();
  const populated = await Task.findById(updatedTask._id).populate('assignedTo', 'name email avatar');
  res.json(populated);
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id (Admin only)
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };
