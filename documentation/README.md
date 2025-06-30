# 🐄 FarmTrack - RFID-Based Smart Livestock Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> **FarmTrack** is a comprehensive livestock management system that leverages RFID technology to provide real-time tracking, health monitoring, and yield management for modern farms. Built with cutting-edge technologies, it offers a seamless experience for farm owners, veterinarians, and farm workers.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🏥 **Health Management**
- **Comprehensive Health Records**: Track vaccinations, treatments, and medical history
- **Veterinary Checkups**: Schedule and manage veterinary appointments
- **Medication Tracking**: Monitor medication schedules and dosages
- **Health Alerts**: Automated notifications for health-related events

### 📊 **Yield Management**
- **Production Tracking**: Monitor milk, egg, and other product yields
- **Performance Analytics**: Analyze individual and herd performance
- **Yield Forecasting**: Predict future production based on historical data
- **Quality Metrics**: Track product quality and consistency

### 🏃 **Movement Tracking**
- **RFID Integration**: Real-time location tracking using RFID tags
- **Night Return Monitoring**: Track animals returning to shelters
- **Movement History**: Complete audit trail of animal movements
- **Geofencing**: Set up virtual boundaries and alerts

### 👥 **Multi-User System**
- **Role-Based Access**: Different permissions for owners, vets, and workers
- **Farm Management**: Multiple farms under single ownership
- **User Profiles**: Personalized dashboards and settings
- **Activity Logging**: Track all user actions and changes

### 📱 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization across all devices
- **Intuitive Interface**: User-friendly design with minimal learning curve
- **Dark/Light Mode**: Customizable theme preferences

## 🛠 Technology Stack

### **Backend**
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with MongoDB Atlas cloud hosting
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and security

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **React Router** - Client-side routing

### **Development Tools**
- **Nodemon** - Automatic server restart during development
- **Concurrently** - Run multiple commands simultaneously
- **ESLint** - Code linting and quality assurance
- **Jest** - Testing framework
- **Git** - Version control

## 🏗 Architecture

```
FarmTrack/
├── 📁 Backend (Node.js + Express)
│   ├── 📁 controllers/     # Business logic
│   ├── 📁 models/         # Database schemas
│   ├── 📁 routes/         # API endpoints
│   ├── 📁 middleware/     # Authentication & validation
│   ├── 📁 migrations/     # Database migrations
│   └── 📁 scripts/        # Utility scripts
├── 📁 Frontend (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 components/ # Reusable UI components
│   │   ├── 📁 pages/      # Page components
│   │   ├── 📁 services/   # API integration
│   │   ├── 📁 contexts/   # React contexts
│   │   ├── 📁 hooks/      # Custom React hooks
│   │   └── 📁 types/      # TypeScript type definitions
│   └── 📁 public/         # Static assets
└── 📁 Documentation       # API docs, guides, etc.
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (for cloud database)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/farmtrack.git
   cd farmtrack
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmtrack
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   node scripts/run-migration.js
   ```

5. **Start Development Servers**
   ```bash
   # Start both backend and frontend
   npm start
   
   # Or start individually
   npm run backend    # Backend only (port 3000)
   npm run frontend   # Frontend only (port 5173)
   ```

6. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000/api

### Development Commands

```bash
# Start development servers
npm start              # Both backend and frontend
npm start:clean        # Kill ports and restart

# Individual servers
npm run backend        # Backend with nodemon
npm run frontend       # Frontend with Vite

# Testing
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Database operations
node scripts/fix-cloud-db-index.js    # Fix database indexes
node scripts/check-farm-animals.js    # Check farm data
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All API endpoints (except login/register) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `DELETE /auth/account` - Delete user account

#### Farms
- `POST /farms` - Create new farm
- `GET /farms` - Get all farms (admin only)
- `GET /farms/:id` - Get farm by ID
- `PUT /farms/:id` - Update farm
- `DELETE /farms/:id` - Delete farm

#### Animals
- `GET /animals` - Get all animals in user's farm
- `POST /animals` - Create new animal
- `GET /animals/:id` - Get animal by ID
- `PUT /animals/:id` - Update animal
- `DELETE /animals/:id` - Delete animal

#### Health Records
- `GET /checkups` - Get all checkups
- `POST /checkups` - Create new checkup
- `PUT /checkups/:id` - Update checkup
- `DELETE /checkups/:id` - Delete checkup

#### Medications
- `GET /medications` - Get all medications
- `POST /medications` - Create new medication
- `PUT /medications/:id` - Update medication
- `DELETE /medications/:id` - Delete medication

#### Yields
- `GET /yields` - Get all yields
- `POST /yields` - Create new yield record
- `PUT /yields/:id` - Update yield
- `DELETE /yields/:id` - Delete yield

#### Return Logs
- `GET /returnlogs` - Get all return logs
- `POST /returnlogs` - Create new return log
- `PUT /returnlogs/:id` - Update return log
- `DELETE /returnlogs/:id` - Delete return log

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 🗄 Database Schema

### Core Collections

#### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (admin, user, veterinarian, farm_worker),
  farm_id: ObjectId (ref: 'Farm'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Farms
```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  owner: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Animals
```javascript
{
  _id: ObjectId,
  tag_number: String,
  name: String,
  type: String (Cow, Hen, Horse, Sheep, Goat),
  age: Number,
  gender: String (Male, Female),
  is_producing_yield: Boolean,
  under_treatment: Boolean,
  farm_id: ObjectId (ref: 'Farm'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Checkups
```javascript
{
  _id: ObjectId,
  animal_id: ObjectId (ref: 'Animal'),
  date: String (YYYY-MM-DD),
  vet_name: String,
  notes: String,
  diagnosis: String,
  farm_id: ObjectId (ref: 'Farm'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Medications
```javascript
{
  _id: ObjectId,
  animal_id: ObjectId (ref: 'Animal'),
  name: String,
  dosage: String,
  frequency: String,
  start_date: String,
  end_date: String,
  notes: String,
  farm_id: ObjectId (ref: 'Farm'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Yields
```javascript
{
  _id: ObjectId,
  animal_id: ObjectId (ref: 'Animal'),
  date: String (YYYY-MM-DD),
  quantity: Number,
  unit: String,
  quality_grade: String,
  notes: String,
  farm_id: ObjectId (ref: 'Farm'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Return Logs
```javascript
{
  _id: ObjectId,
  animal_id: ObjectId (ref: 'Animal'),
  date: String (YYYY-MM-DD),
  returned: Boolean,
  return_reason: String,
  farm_id: ObjectId (ref: 'Farm'),
  createdAt: Date,
  updatedAt: Date
}
```

## 👥 User Roles & Permissions

### **Farm Owner (Admin)**
- ✅ Full access to all farm data
- ✅ Create, read, update, delete animals
- ✅ Manage farm settings and users
- ✅ View analytics and reports
- ✅ Delete farm and account
- ✅ Access to all features

### **Veterinarian**
- ✅ View all animals in assigned farm
- ✅ Create and manage health records
- ✅ Schedule and conduct checkups
- ✅ Prescribe medications
- ✅ View medical history
- ❌ Cannot delete animals or farm data

### **Farm Worker**
- ✅ View assigned animals
- ✅ Record daily activities
- ✅ Log yields and movements
- ✅ Basic health monitoring
- ❌ Cannot modify critical data
- ❌ No access to financial or admin features

### **User**
- ✅ View-only access to assigned data
- ✅ Basic reporting
- ❌ No modification permissions
- ❌ Limited feature access

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   PORT=3000
   FRONTEND_URL=https://your-domain.com
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy Backend**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start app.js --name farmtrack
   pm2 save
   pm2 startup
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t farmtrack .
docker run -p 3000:3000 farmtrack
```

### Cloud Platforms

- **Heroku**: Easy deployment with Git integration
- **Vercel**: Frontend deployment with automatic builds
- **AWS**: Scalable infrastructure with EC2 and RDS
- **Google Cloud**: Managed services with App Engine

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow the existing code style

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB Atlas** for cloud database hosting
- **Shadcn/ui** for beautiful React components
- **Tailwind CSS** for utility-first styling
- **Vite** for fast development experience
- **React Team** for the amazing framework

## 📞 Support

- **Documentation**: [API Documentation](API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/farmtrack/issues)
- **Email**: support@farmtrack.com

---

**FarmTrack** - Revolutionizing livestock management with modern technology 🚀 