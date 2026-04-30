# 🚀 TaskFlow — Team Task Manager (MERN)

A production-ready, full-stack collaborative task management platform built with the MERN stack. Featuring a premium UI with glassmorphism, Kanban drag-and-drop, role-based access control, and real-time-like analytics.

---

## 🌐 Live URLs (Local)
| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5174        |
| Backend   | http://localhost:5000        |

## 🔑 Demo Credentials
| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@gmail.com    | Raj123   |

---

## 📁 Project Structure

```
Task/
├── server/                  # Node.js + Express backend
│   ├── config/db.js         # MongoDB connection
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── dashboardController.js
│   ├── middleware/auth.js   # JWT + RBAC middleware
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/              # Express routers
│   ├── seeder.js            # Admin user seed script
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables
│
└── client/                  # React + Vite + Tailwind v4
    └── src/
        ├── components/
        │   └── Layout/      # Sidebar, Navbar, MainLayout
        ├── context/         # AuthContext (JWT session)
        ├── pages/           # Dashboard, Projects, KanbanBoard, Team, Login, Signup
        └── services/api.js  # Axios + interceptors
```

---

## ⚙️ Setup & Run

### 1. Install dependencies
```bash
# Root
npm install

# Backend
cd server && npm install

# Frontend
cd client && npm install
```

### 2. Start backend
```bash
cd server
npm start
```

### 3. Start frontend
```bash
cd client
npm run dev
```

### 4. Seed admin user (already done)
```bash
cd server
node seeder.js
```

---

## 🔌 API Endpoints

| Method | Endpoint                          | Auth     | Description           |
|--------|-----------------------------------|----------|-----------------------|
| POST   | /api/auth/register                | Public   | Register new user     |
| POST   | /api/auth/login                   | Public   | Login                 |
| GET    | /api/users                        | User     | Get all users         |
| GET    | /api/projects                     | User     | Get projects          |
| POST   | /api/projects                     | Admin    | Create project        |
| PUT    | /api/projects/:id                 | Admin    | Update project        |
| DELETE | /api/projects/:id                 | Admin    | Delete project        |
| GET    | /api/tasks/project/:projectId     | User     | Get tasks by project  |
| POST   | /api/tasks                        | Admin    | Create task           |
| PUT    | /api/tasks/:id                    | User     | Update task / status  |
| DELETE | /api/tasks/:id                    | Admin    | Delete task           |
| GET    | /api/dashboard/stats              | User     | Analytics stats       |

---

## ✨ Features

- 🎨 Glassmorphism + gradient UI
- 🌙 Dark / Light mode toggle
- 🔐 JWT auth + RBAC (Admin / Member)
- 📊 Analytics dashboard with Pie + Bar charts (Recharts)
- 📁 Project management with member assignment
- 🗂️ Kanban board with drag & drop (`@hello-pangea/dnd`)
- 👥 Team page with role badges
- 🔔 Toast notifications (`react-hot-toast`)
- ⚡ Framer Motion animations
- 📱 Responsive layout

---

## 🚀 Deployment (Railway)

1. Push to GitHub
2. Create Railway project → link repo
3. Add services: **Node API** + **React Static** + **MongoDB Atlas**
4. Set environment variables from `server/.env`
5. Set `VITE_API_URL` in client to the deployed backend URL
