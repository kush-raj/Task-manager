const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Create new project
// @route   POST /api/projects
const createProject = async (req, res) => {
  const { title, description, members } = req.body;

  const project = new Project({
    title,
    description,
    createdBy: req.user._id,
    members: members || [],
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
};

// @desc    Get all projects
// @route   GET /api/projects
const getProjects = async (req, res) => {
  let projects;
  if (req.user.role === 'Admin') {
    projects = await Project.find({}).populate('createdBy', 'name email').populate('members', 'name avatar').lean();
  } else {
    projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    }).populate('createdBy', 'name email').populate('members', 'name avatar').lean();
  }

  // Calculate progress for each project
  for (let project of projects) {
    const tasks = await Task.find({ projectId: project._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    project.progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  }

  res.json(projects);
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res) => {
  const { title, description, members } = req.body;
  const project = await Project.findById(req.params.id);

  if (project) {
    project.title = title || project.title;
    project.description = description || project.description;
    project.members = members || project.members;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };
