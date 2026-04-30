import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { projectAPI, taskAPI, userAPI } from '../services/api';
import { Plus, Calendar, MoreHorizontal, Flag, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = {
  'Todo':        { id: 'Todo',        title: 'To Do',       color: 'bg-slate-400' },
  'In Progress': { id: 'In Progress', title: 'In Progress', color: 'bg-amber-400' },
  'Done':        { id: 'Done',        title: 'Done',        color: 'bg-emerald-500' },
};

const KanbanBoard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [projects, setProjects]         = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks]               = useState({ 'Todo': [], 'In Progress': [], 'Done': [] });
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask]           = useState({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);
  useEffect(() => { if (selectedProject) fetchTasks(); }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data } = await projectAPI.getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]._id);
    } catch { toast.error('Failed to load projects'); }
  };

  const fetchUsers = async () => {
    try { const { data } = await userAPI.getUsers(); setUsers(data); }
    catch { /* silently ignore */ }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await taskAPI.getTasksByProject(selectedProject);
      const grouped = { 'Todo': [], 'In Progress': [], 'Done': [] };
      data.forEach(task => { if (grouped[task.status]) grouped[task.status].push(task); });
      setTasks(grouped);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = Array.from(tasks[source.droppableId]);
    const destCol   = Array.from(tasks[destination.droppableId]);
    const [moved]   = sourceCol.splice(source.index, 1);

    // Members can only move tasks assigned to them
    if (!isAdmin && moved.assignedTo?._id !== user._id && moved.assignedTo !== user._id) {
      toast.error('You can only move tasks assigned to you.');
      return;
    }

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, moved);
      setTasks({ ...tasks, [source.droppableId]: sourceCol });
    } else {
      moved.status = destination.droppableId;
      destCol.splice(destination.index, 0, moved);
      setTasks({ ...tasks, [source.droppableId]: sourceCol, [destination.droppableId]: destCol });
      try {
        await taskAPI.updateTask(draggableId, { status: destination.droppableId });
        toast.success('Task status updated');
      } catch (error) {
        const msg = error.response?.data?.message || 'Sync failed';
        toast.error(msg);
        fetchTasks();
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.createTask({ ...newTask, projectId: selectedProject, status: 'Todo' });
      toast.success('Task created!');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });
      fetchTasks();
    } catch { toast.error('Failed to create task'); }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.deleteTask(taskId);
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Failed to delete task'); }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':   return 'text-rose-600   bg-rose-50   dark:bg-rose-900/20';
      case 'Medium': return 'text-amber-600  bg-amber-50  dark:bg-amber-900/20';
      default:       return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isAdmin ? 'Full control — create, move, and delete tasks.' : 'You can move tasks assigned to you.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {projects.length > 0 ? (
            <select
              className="input-field py-2 text-sm font-semibold w-full md:w-64"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          ) : (
            <p className="text-slate-400 text-sm italic">No projects yet. Create one first.</p>
          )}
          {isAdmin && projects.length > 0 && (
            <button onClick={() => setShowTaskModal(true)} className="btn-primary py-2 flex items-center gap-2 whitespace-nowrap">
              <Plus size={18} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Task count badge */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2 md:gap-3">
          {Object.entries(tasks).map(([col, list]) => (
            <span key={col} className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {COLUMNS[col].title}: {list.length}
            </span>
          ))}
        </div>
      )}

      {/* Board */}
      {projects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <Flag size={56} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">Create a project first, then add tasks here.</p>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-nowrap md:grid md:grid-cols-3 gap-6 flex-1 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
            {Object.values(COLUMNS).map(column => (
              <div key={column.id} className="flex flex-col min-w-[280px] w-[85vw] md:w-auto md:min-w-0 snap-center">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300">
                      {column.title}
                    </h3>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                      {tasks[column.id].length}
                    </span>
                  </div>
                  <MoreHorizontal size={16} className="text-slate-400" />
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`kanban-column flex-1 ${snapshot.isDraggingOver ? 'bg-indigo-50/60 dark:bg-indigo-900/10 ring-2 ring-indigo-400/30' : ''}`}
                    >
                      {loading ? (
                        [1,2].map(i => (
                          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl mb-3" />
                        ))
                      ) : tasks[column.id].length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-slate-300 dark:text-slate-600 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                          Drop tasks here
                        </div>
                      ) : (
                        tasks[column.id].map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-card group ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 rotate-1 scale-105' : ''}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityStyle(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  {isAdmin && (
                                    <button
                                      onClick={(e) => handleDeleteTask(task._id, e)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all rounded"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>

                                <h4 className="font-semibold text-sm mb-1 leading-snug">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                                )}

                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                    <Calendar size={11} />
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                  </div>
                                  <div
                                    className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[9px] font-bold text-indigo-600 border border-white dark:border-slate-800 shadow-sm"
                                    title={task.assignedTo?.name || 'Unassigned'}
                                  >
                                    {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : <User size={10} />}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Create Task Modal (Admin only) */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowTaskModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Plus size={22} className="text-indigo-500" /> Create New Task
              </h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Task Title *</label>
                  <input
                    type="text" required placeholder="What needs to be done?"
                    className="input-field"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                  <textarea
                    rows="3" placeholder="Add details..."
                    className="input-field resize-none"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Priority</label>
                    <select className="input-field py-2.5" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Due Date</label>
                    <input type="date" className="input-field py-2.5" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Assign To</label>
                  <select className="input-field py-2.5" value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                    <option value="">— Unassigned —</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowTaskModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95">
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KanbanBoard;
