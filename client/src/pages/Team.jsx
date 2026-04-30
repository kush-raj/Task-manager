import React, { useState, useEffect } from 'react';
import { userAPI, authAPI } from '../services/api';
import { Mail, Shield, User, UserPlus, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Team = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [editUser, setEditUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getUsers();
      setUsers(data);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(newUser);
      toast.success('Member created successfully!');
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Member' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create member');
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateUser(editUser._id, editUser);
      toast.success('Member updated successfully!');
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update member');
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userAPI.deleteUser(userToDelete._id);
      toast.success('Member deleted successfully!');
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  const roleColor = (role) =>
    role === 'Admin'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-slate-500 dark:text-slate-400">All registered users in the workspace.</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <UserPlus size={18} /> Create Member
          </button>
        )}
      </div>

      {/* Role legend */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
            <Shield size={12} className="text-white" />
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-400">Admin — full project & task control</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
            <User size={12} className="text-white" />
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-400">Member — view & update assigned tasks only</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="text-center">
            <User size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No team members yet</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((member, idx) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              className="glass-card flex flex-col items-center text-center relative group"
            >
              {/* You badge */}
              {member._id === currentUser?._id && (
                <span className="absolute top-4 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">You</span>
              )}
              
              {/* Admin Actions */}
              {currentUser?.role === 'Admin' && member._id !== currentUser?._id && (
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditUser(member); setShowEditModal(true); }}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setUserToDelete(member)}
                    className="p-1.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Avatar */}
              <div className="relative mb-4 mt-2">
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white dark:border-slate-800 shadow-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center shadow-md ${member.role === 'Admin' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                  {member.role === 'Admin' ? <Shield size={13} className="text-white" /> : <User size={13} className="text-white" />}
                </div>
              </div>

              <h3 className="text-lg font-bold mb-1">{member.name}</h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full mb-4 ${roleColor(member.role)}`}>
                {member.role}
              </span>

              <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <Mail size={14} className="flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>

              <div className="flex mt-4 w-full">
                <button 
                  onClick={() => setSelectedProfile(member)}
                  className="w-full py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Member Modal (Admin only) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <UserPlus size={22} className="text-indigo-500" /> Create New Member
              </h2>
              <form onSubmit={handleCreateMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Name *</label>
                  <input
                    type="text" required placeholder="John Doe"
                    className="input-field"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email *</label>
                  <input
                    type="email" required placeholder="john@example.com"
                    className="input-field"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password *</label>
                    <input
                      type="password" required placeholder="••••••••"
                      className="input-field"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Role *</label>
                    <select className="input-field py-2.5" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProfile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-white dark:border-slate-800 shadow-xl mb-4">
                {selectedProfile.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mb-1">{selectedProfile.name}</h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full mb-6 ${roleColor(selectedProfile.role)}`}>
                {selectedProfile.role}
              </span>
              
              <div className="w-full space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
                    <Mail size={14} className="text-indigo-500" /> {selectedProfile.email}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Account Status</label>
                  <p className="font-medium text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active Member
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedProfile(null)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors"
              >
                Close Profile
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Member Modal (Admin only) */}
      <AnimatePresence>
        {showEditModal && editUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Edit2 size={22} className="text-indigo-500" /> Edit Member
              </h2>
              <form onSubmit={handleUpdateMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Name *</label>
                  <input
                    type="text" required
                    className="input-field"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email *</label>
                  <input
                    type="email" required
                    className="input-field"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                    <input
                      type="password" placeholder="Leave blank to keep current"
                      className="input-field"
                      onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Role *</label>
                    <select className="input-field py-2.5" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setUserToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Member?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to remove <span className="font-bold text-slate-700 dark:text-slate-300">{userToDelete.name}</span> from the workspace? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;
