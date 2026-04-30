# 🚀 TaskFlow — Team Task Manager (MERN)

A full-stack collaborative task management platform built with the MERN stack. Designed with a modern UI, role-based access control, and a Kanban workflow for efficient team collaboration.

---

## 🔑 Demo Credentials

| Role  | Email                                     | Password |
| ----- | ----------------------------------------- | -------- |
| Admin | [admin@gmail.com](mailto:admin@gmail.com) | Raj123   |

---

## 📁 Project Structure

```
Task/
├── server/                  # Node.js + Express backend
│   ├── config/db.js         # MongoDB connection
│   ├── controllers/         # Business logic
│   ├── middleware/auth.js   # JWT + RBAC middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── seeder.js            # Admin user seed script
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables
│
└── client/                  # React + Vite frontend
    └── src/
        ├── components/      # UI components
        ├── context/         # Auth context
        ├── pages/           # App pages
        └── services/api.js  # API layer (Axios)
```

---

## ⚙️ Setup & Run

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

---

### 2. Start backend

```bash
cd server
npm start
```

---

### 3. Start frontend

```bash
cd client
npm run dev
```

---

### 4. Seed admin user (optional)

```bash
cd server
node seeder.js
```

---

## 🔌 API Endpoints

| Method | Endpoint                      | Auth   | Description     |
| ------ | ----------------------------- | ------ | --------------- |
| POST   | /api/auth/register            | Public | Register user   |
| POST   | /api/auth/login               | Public | Login           |
| GET    | /api/users                    | User   | Get users       |
| GET    | /api/projects                 | User   | Get projects    |
| POST   | /api/projects                 | Admin  | Create project  |
| PUT    | /api/projects/:id             | Admin  | Update project  |
| DELETE | /api/projects/:id             | Admin  | Delete project  |
| GET    | /api/tasks/project/:projectId | User   | Get tasks       |
| POST   | /api/tasks                    | Admin  | Create task     |
| PUT    | /api/tasks/:id                | User   | Update task     |
| DELETE | /api/tasks/:id                | Admin  | Delete task     |
| GET    | /api/dashboard/stats          | User   | Dashboard stats |

---

## ✨ Features

* 🎨 Modern UI with glassmorphism design
* 🌙 Dark / Light mode support
* 🔐 JWT authentication with role-based access
* 📊 Dashboard with analytics charts
* 📁 Project and team management
* 🗂️ Kanban board with drag-and-drop
* 👥 Team collaboration with roles
* 🔔 Toast notifications
* ⚡ Smooth animations
* 📱 Fully responsive design

---

## 🚀 Deployment

### Backend

Deploy on Railway and connect your repository.

### Frontend

Deploy on Vercel and set environment variable:

```bash
VITE_API_URL=https://your-backend-url
```

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **Auth:** JWT
* **UI & Animations:** Framer Motion
* **Drag & Drop:** @hello-pangea/dnd

---

## 📌 Notes

* Update `.env` variables before running in production
* Never expose secrets in your repository
* Use MongoDB Atlas for cloud database

---

## 👨‍💻 Author

Raj Kushwaha

---
