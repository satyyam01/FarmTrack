# 🐄 FarmTrack - RFID-Based Smart Livestock & Farm Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> **FarmTrack** is a modern, full-stack farm management platform that leverages RFID and cloud technology to provide real-time animal tracking, health monitoring, yield management, and operational analytics for farms of all sizes. Built with the MERN stack, FarmTrack empowers farm owners, veterinarians, and workers with a seamless, secure, and scalable solution.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🏥 Health & Medication Management
- Track vaccinations, treatments, and medical history
- Schedule and manage veterinary checkups
- Monitor medication schedules and dosages
- Automated health alerts and reminders

### 📊 Yield & Production Analytics
- Log and analyze daily yields (milk, eggs, etc.)
- Performance analytics for individual animals and herds
- Yield forecasting and quality tracking

### 🏃 Animal Movement & RFID Tracking
- Real-time location tracking with RFID tags
- Night return monitoring and alerts for missing animals
- Complete movement history and geofencing

### 👥 Multi-User & Role-Based Access
- Owners, veterinarians, and workers with custom permissions
- Multiple farms under single ownership
- User profiles, activity logging, and secure authentication

### 📱 Modern UI/UX
- Responsive, mobile-friendly design
- Real-time updates and notifications
- Intuitive dashboards and dark/light mode

---

## 🛠 Technology Stack

**Backend:**  
- Node.js, Express.js, MongoDB (Atlas), Mongoose, JWT, bcryptjs

**Frontend:**  
- React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router

**DevOps & Tooling:**  
- Nodemon, Concurrently, ESLint, Jest, Git

---

## 🏗 Architecture

```
farmtrack/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── migrations/
│   ├── scheduler/
│   ├── scripts/
│   ├── utils/
│   └── app.js, package.json, ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── lib/
│   │   ├── types/
│   │   └── App.tsx, main.tsx, ...
│   └── public/
├── documentation/
│   └── API_DOCUMENTATION.md, ...
├── testing/
│   └── mailTest.js, ...
└── .gitignore, README.md, ...
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/farmtrack.git
   cd farmtrack
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   cd ../frontend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env` in both `backend/` and `frontend/` as needed.
   - Set your environment variables (MongoDB URI, JWT secret, email config, etc.).

4. **Database Setup**
   ```bash
   # Run migrations if needed
   cd backend
   node scripts/run-migration.js
   ```

5. **Start Development Servers**
   ```bash
   # From project root, run both servers
   npm run dev
   # Or start individually
   npm run backend
   npm run frontend
   ```

6. **Access the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

---

## 📚 API Documentation

- See [documentation/API_DOCUMENTATION.md](documentation/API_DOCUMENTATION.md) for full API reference.
- All endpoints (except login/register) require a JWT in the `Authorization` header.

---

## 🔐 User Roles & Permissions

- **Owner:** Full access to all features and settings.
- **Veterinarian:** Can view and update animal health records.
- **Worker:** Can log yields, check returns, and view assigned animals.

---

## 🚀 Deployment

- Use environment variables for all secrets and config.
- Set up production builds for both backend and frontend.
- Use a process manager (e.g., PM2) for backend in production.
- Configure HTTPS and secure your MongoDB Atlas cluster.

---

## 🤝 Contributing

1. Fork the repo and create your branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Create a new Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

**FarmTrack** — Smart, secure, and scalable farm management for the next generation of agriculture. 