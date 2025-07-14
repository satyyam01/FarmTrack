# 🐄 FarmTrack – RFID-Based Smart Livestock & Farm Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> **FarmTrack** is a modern, full-stack farm management platform leveraging RFID, cloud, and real-time analytics to provide comprehensive animal tracking, health monitoring, yield management, and operational intelligence for farms of all sizes. Built with the MERN stack, FarmTrack empowers farm owners, veterinarians, and workers with a seamless, secure, and scalable solution.

---

## 📋 Table of Contents
- [Features](#features)
- [Premium & Unique Features](#premium--unique-features)
- [Technology Stack](#technology-stack)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Getting Started](#getting-started)
- [Environment & Configuration](#environment--configuration)
- [API Overview](#api-overview)
- [User Roles, Permissions & Cascading Deletes](#user-roles-permissions--cascading-deletes)
- [Email & OTP System](#email--otp-system)
- [Night Check Automation & Alerts](#night-check-automation--alerts)
- [Testing & Troubleshooting](#testing--troubleshooting)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [References & Documentation](#references--documentation)

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
- Intuitive dashboards, dark/light mode

---

## 💎 Premium & Unique Features
- **Chatbot Integration:** AI-powered assistant for farm queries and support
- **Fencing Alerts:** Real-time boundary breach detection and notifications
- **Night Check Automation:** Scheduled checks for animal returns, with alerts and logs
- **Cascading Deletes:** Role-based, safe, and auditable data deletion (see [CASCADING_DELETE_ACTIONS.md](documentation/CASCADING_DELETE_ACTIONS.md))
- **SendGrid OTP System:** Secure, email-based user verification (see [SENDGRID_OTP_SETUP.md](documentation/SENDGRID_OTP_SETUP.md))
- **Farm-Specific Scheduling:** Customizable cron jobs for night checks per farm
- **Bulk Email & Alert Templates:** Professional, branded, and responsive email notifications
- **Pro/Premium Farm Features:** Multi-role support, advanced analytics, and more

---

## 🛠 Technology Stack

**Backend:**  
Node.js, Express.js, MongoDB (Atlas), Mongoose, JWT, bcryptjs, Nodemailer, SendGrid, Redis, Razorpay

**Frontend:**  
React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, Lucide Icons

**DevOps & Tooling:**  
Nodemon, Concurrently, ESLint, Jest, Git, PM2

---

## 🏗 Architecture & Directory Structure

```
farmtrack/
├── backend/
│   ├── controllers/         # Business logic for all resources
│   ├── models/              # Mongoose schemas for all entities
│   ├── routes/              # Express route definitions
│   ├── middleware/          # Auth, validation, and other middleware
│   ├── migrations/          # DB migration scripts
│   ├── scheduler/           # Cron jobs (night check, etc.)
│   ├── scripts/             # Utility and test scripts
│   ├── utils/               # Email, OTP, caching, RAG, etc.
│   └── app.js, package.json, ...
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (cards, dialogs, widgets)
│   │   ├── pages/           # Route-based pages (dashboard, animals, etc.)
│   │   ├── services/        # API clients
│   │   ├── contexts/        # React context (user, etc.)
│   │   ├── lib/             # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx, main.tsx, ...
│   └── public/
├── documentation/           # All project documentation
│   ├── API_DOCUMENTATION.md
│   ├── CASCADING_DELETE_ACTIONS.md
│   ├── EMAIL_CONFIGURATION.md
│   ├── NIGHT_CHECK_TESTING.md
│   ├── SENDGRID_OTP_SETUP.md
│   └── ...
└── README.md, package.json, ...
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
   - Set your environment variables (see [Environment & Configuration](#environment--configuration)).
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

## ⚙️ Environment & Configuration

### Backend `.env` Example
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
EMAIL_HOST=mail.satyyam.site
EMAIL_PORT=465
EMAIL_USER=farmtrack@satyyam.site
EMAIL_PASS=your_email_password_here
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDER_EMAIL=farmtrack@satyyam.site
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
REDIS_URL=your_redis_url
```

### Frontend `.env` Example
```env
VITE_API_URL=http://localhost:3000/api
```

- See [EMAIL_CONFIGURATION.md](documentation/EMAIL_CONFIGURATION.md) and [SENDGRID_OTP_SETUP.md](documentation/SENDGRID_OTP_SETUP.md) for full details.

---

## 📚 API Overview

- Full API reference: [API_DOCUMENTATION.md](documentation/API_DOCUMENTATION.md)
- All endpoints (except login/register) require a JWT in the `Authorization` header.
- Key resources: animals, yields, checkups, medications, notifications, alerts, users, farms, settings, payments, chatbot, etc.
- Example endpoints:
  - `POST /api/animals` – Create animal
  - `GET /api/yields` – List yields
  - `POST /api/notifications/test-night-check` – Trigger night check test
  - `POST /api/verification/send-otp` – Send registration OTP

---

## 🛡 User Roles, Permissions & Cascading Deletes

### Roles
- **Owner (admin):** Full access to all features and settings
- **Veterinarian:** Can view/update animal health records
- **Worker:** Can log yields, check returns, view assigned animals
- **User:** Read-only or limited access

### Cascading Deletes
- Role-based, safe, and auditable deletions
- Farm owner deletion removes all farm data (animals, yields, logs, users, etc.)
- Non-owner deletions preserve medical/activity records (marked as "Unknown User/Vet/Worker")
- See [CASCADING_DELETE_ACTIONS.md](documentation/CASCADING_DELETE_ACTIONS.md) for full logic, safety, and best practices

---

## ✉️ Email & OTP System
- Uses **SendGrid** for OTP (One-Time Password) verification (see [SENDGRID_OTP_SETUP.md](documentation/SENDGRID_OTP_SETUP.md))
- Professional, branded HTML email templates for alerts and notifications
- Bulk email support, retry logic, and error handling
- All credentials and API keys are environment variables
- See [EMAIL_CONFIGURATION.md](documentation/EMAIL_CONFIGURATION.md) for setup and testing

---

## 🌙 Night Check Automation & Alerts
- Automated night return checks via cron (default 9 PM, farm-specific schedules supported)
- Alerts for missing animals, fencing breaches, and barn checks
- Manual and API-triggered test endpoints for night check logic
- See [NIGHT_CHECK_TESTING.md](documentation/NIGHT_CHECK_TESTING.md) for testing, troubleshooting, and expected results

---

## 🧪 Testing & Troubleshooting
- **Backend:** Jest for unit/integration tests (`npm run test` in backend)
- **Night Check:** Manual and API-based test scripts ([NIGHT_CHECK_TESTING.md](documentation/NIGHT_CHECK_TESTING.md))
- **Email/OTP:** Test scripts for SendGrid and email ([EMAIL_CONFIGURATION.md](documentation/EMAIL_CONFIGURATION.md), [SENDGRID_OTP_SETUP.md](documentation/SENDGRID_OTP_SETUP.md))
- **Database:** Check logs and collections for orphaned or missing data after destructive actions
- **Troubleshooting:**
  - Check logs for emoji-coded messages
  - Verify environment variables and credentials
  - See documentation for common issues and solutions

---

## 🚀 Deployment
- Use environment variables for all secrets and config
- Production builds for backend (`npm run build` if applicable) and frontend (`npm run build` in frontend)
- Use a process manager (e.g., PM2) for backend in production
- Configure HTTPS and secure your MongoDB Atlas cluster
- Set up monitoring for scheduled jobs and email delivery

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

## 📚 References & Documentation
- [API Documentation](documentation/API_DOCUMENTATION.md)
- [Cascading Delete Actions](documentation/CASCADING_DELETE_ACTIONS.md)
- [Email Configuration](documentation/EMAIL_CONFIGURATION.md)
- [Night Check Testing Guide](documentation/NIGHT_CHECK_TESTING.md)
- [SendGrid OTP Setup](documentation/SENDGRID_OTP_SETUP.md)
- [Project Journey (PDF)](documentation/farmtrack-journey.pdf)

---

**FarmTrack** — Smart, secure, and scalable farm management for the next generation of agriculture. 