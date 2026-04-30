import axios from 'axios';

const API = axios.create({
  baseURL: 'https://task-eta-tan.vercel.app/api',
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem('userInfo')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`;
  }
  return req;
});

export const authAPI = {
  login: (formData) => API.post('/auth/login', formData),
  register: (formData) => API.post('/auth/register', formData),
};

export const userAPI = {
  getUsers: () => API.get('/users'),
  updateUser: (id, data) => API.put(`/users/${id}`, data),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

export const projectAPI = {
  getProjects: () => API.get('/projects'),
  createProject: (data) => API.post('/projects', data),
  updateProject: (id, data) => API.put(`/projects/${id}`, data),
  deleteProject: (id) => API.delete(`/projects/${id}`),
};

export const taskAPI = {
  getTasksByProject: (projectId) => API.get(`/tasks/project/${projectId}`),
  createTask: (data) => API.post('/tasks', data),
  updateTask: (id, data) => API.put(`/tasks/${id}`, data),
  deleteTask: (id) => API.delete(`/tasks/${id}`),
};

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export default API;
