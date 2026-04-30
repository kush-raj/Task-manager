import React, { useState, useEffect } from 'react';
import { dashboardAPI, taskAPI } from '../services/api';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );

  const kpiCards = [
    { title: 'Total Tasks',   value: stats.totalTasks,     icon: ListTodo,     color: 'text-blue-500',    bg: 'bg-blue-500/10' },
    { title: 'Completed',     value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'In Progress',   value: stats.pendingTasks,   icon: Clock,        color: 'text-purple-500',  bg: 'bg-purple-500/10' },
    { title: 'Overdue',       value: stats.overdueTasks,   icon: AlertCircle,  color: 'text-rose-500',    bg: 'bg-rose-500/10' },
  ];

  const hasChartData = stats.statusStats.some(s => s.value > 0);
  const hasUserData  = stats.userTasks.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your team's productivity and task distribution.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <TrendingUp size={18} />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold">{card.value}</h3>
            </div>
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card h-[360px] flex flex-col"
        >
          <h3 className="text-lg font-bold mb-4">Tasks by Status</h3>
          {hasChartData ? (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.statusStats} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                    {stats.statusStats.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <ListTodo size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No tasks yet</p>
                <p className="text-sm">Create tasks to see distribution</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card h-[360px] flex flex-col"
        >
          <h3 className="text-lg font-bold mb-4">Tasks per Team Member</h3>
          {hasUserData ? (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.userTasks}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" name="Tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No assignments yet</p>
                <p className="text-sm">Assign tasks to team members</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
