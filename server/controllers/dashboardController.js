const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Done' });
    const pendingTasks = await Task.countDocuments({ status: 'In Progress' });
    const todoTasks = await Task.countDocuments({ status: 'Todo' });
    const overdueTasks = await Task.countDocuments({ 
      dueDate: { $lt: new Date() }, 
      status: { $ne: 'Done' } 
    });

    const statusStats = [
      { name: 'Todo', value: todoTasks },
      { name: 'In Progress', value: pendingTasks },
      { name: 'Done', value: completedTasks },
    ];

    // Tasks per user
    const userTasks = await Task.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          count: 1
        }
      }
    ]);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      statusStats,
      userTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
