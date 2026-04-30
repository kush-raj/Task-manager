import React, { useState, useEffect } from 'react';
import { projectAPI, userAPI } from '../services/api';
import { Plus, Briefcase, Users, Calendar, MoreVertical, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', members: [] });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        projectAPI.getProjects(),
        userAPI.getUsers()
      ]);
      setProjects(projRes.data);
      setUsers(userRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.createProject(newProject);
      toast.success('Project created!');
      setShowModal(false);
      setNewProject({ title: '', description: '', members: [] });
      fetchData();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const toggleMember = (userId) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your workspace and team projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        <AnimatePresence>
          {filteredProjects.length === 0 && !loading ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No projects found</p>
            </div>
          ) : (
            filteredProjects.map((project, idx) => (
              <motion.div 
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col h-full'}`}
              >
                <div className={`flex justify-between items-start ${viewMode === 'list' ? 'mb-0' : 'mb-4'}`}>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  <Briefcase size={24} />
                </div>
                  <button className={`p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${viewMode === 'list' ? 'hidden' : ''}`}>
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className={`text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-2 ${viewMode === 'list' ? 'mb-2' : ''}`}>
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className={`space-y-4 ${viewMode === 'list' ? 'w-64 shrink-0' : ''}`}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-indigo-500">{project.progress || 0}% Complete</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((member, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold overflow-hidden" title={member.name}>
                        {member.avatar ? <img src={member.avatar} alt="" /> : member.name.charAt(0)}
                      </div>
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                    <Users size={14} />
                    {project.members.length} members
                  </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg glass rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Project Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Website Redesign"
                  className="input-field"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Description</label>
                <textarea 
                  rows="3"
                  placeholder="What is this project about?"
                  className="input-field resize-none"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Add Team Members</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {users.map(u => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => toggleMember(u._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newProject.members.includes(u._id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
