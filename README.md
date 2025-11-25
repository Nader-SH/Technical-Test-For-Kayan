# Technical Test For Kayan - Healthcare Management System

A comprehensive healthcare management system that includes appointment management, treatments, and financial reviews. Consists of a Backend (Node.js + Express + TypeScript) and Frontend (React + TypeScript).

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Frontend Documentation](#frontend-documentation)
- [User Flows](#user-flows)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 Overview

This project is a complete healthcare management system that supports three main roles:

- **Patient**: Can book appointments and view their appointments
- **Doctor**: Can start and finish visits, add/delete treatments
- **Finance**: Can search for appointments and review them

## ✨ Features

### Backend
- 🔐 JWT-based authentication with access and refresh tokens
- 👥 Role-based authorization (Patient, Doctor, Finance)
- 📅 Appointment management with race condition protection
- 💊 Treatment tracking with automatic total calculation
- 🔍 Advanced search and filtering for finance team
- ✅ Request validation using Yup
- 🛡️ Security middleware (Helmet, CORS, XSS Protection)
- 📝 Comprehensive logging with Pino
- 🚀 CI/CD with GitHub Actions

### Frontend
- ⚛️ React 19 with TypeScript
- 🎨 Material-UI + TailwindCSS for design
- 🔄 React Query for data fetching and caching
- 📝 React Hook Form + Yup for validation
- 🔐 Axios interceptors for automatic authentication
- 🛣️ Route protection based on roles
- 📱 Responsive design

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize v6
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Yup
- **Security**: Helmet, CORS, xss-clean
- **Logging**: Pino

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Material-UI
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Form Handling**: React Hook Form + Yup
- **HTTP Client**: Axios
- **Routing**: React Router v7

## 📦 Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Technical-Test-For-Kayan
```

### 2. Backend Setup

```bash
cd server
npm ci
```

Create a `.env` file in the `server` directory:

```env
# Environment
NODE_ENV=development

# Server Port
PORT=4000

# Database Connection (PostgreSQL)
# Format: postgres://username:password@host:port/database_name
# For local: postgres://postgres:password@localhost:5432/healthcare_db
# For Neon/Cloud: Use the connection string from your database provider
DATABASE_URL=postgres://username:password@localhost:5432/healthcare_db

# JWT Secrets (REQUIRED - Must be at least 32 characters long)
# Generate secure random strings for production:
# - Use: openssl rand -base64 32
# - Or: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_ACCESS_SECRET=your_random_secret_min_32_characters_long
JWT_REFRESH_SECRET=your_random_secret_min_32_characters_long

# JWT Token Expiration
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# CORS Configuration
# For local development: http://localhost:5173
# For production: Your frontend URL (e.g., https://your-frontend.onrender.com)
CORS_ORIGIN=http://localhost:5173
```

### Environment Variables Explanation

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode (`development` or `production`) | `development` |
| `PORT` | No | Server port number | `4000` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | - |
| `JWT_ACCESS_SECRET` | **Yes** | Secret key for access tokens (min 32 chars) | - |
| `JWT_REFRESH_SECRET` | **Yes** | Secret key for refresh tokens (min 32 chars) | - |
| `ACCESS_TOKEN_EXPIRES_IN` | No | Access token expiration time | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Refresh token expiration time | `7d` |
| `BCRYPT_SALT_ROUNDS` | No | Number of salt rounds for password hashing | `10` |
| `CORS_ORIGIN` | No | Allowed origin for CORS requests | `http://localhost:5173` |

### Generating Secure JWT Secrets

For production, generate secure random secrets:

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Create the database:

```bash
createdb healthcare_db
```

Build the database schema:

```bash
npm run build:db
```

### 3. Frontend Setup

```bash
cd ../client
npm ci
```

Create a `.env` file in the `client` directory:

```env
# Backend API URL
# For local development: http://localhost:4000
# For production: Your backend URL (e.g., https://your-backend.onrender.com)
# Important: No trailing slash at the end
VITE_API_URL=http://localhost:4000

# App Name (optional)
# Used in API request headers
VITE_APP_NAME=healthcare-app
```

### Frontend Environment Variables Explanation

| Variable | Required | Description | Default | Example |
|----------|----------|-------------|---------|---------|
| `VITE_API_URL` | No | Backend API base URL (no trailing slash) | `http://localhost:4000` | `https://kayan-backend.onrender.com` |
| `VITE_APP_NAME` | No | Application name sent in request headers | `healthcare-app` | `healthcare-app` |

### Important Notes for Frontend Environment Variables

- **All Vite environment variables must be prefixed with `VITE_`** to be accessible in the frontend code
- **Variables are embedded at build time**, not runtime - you need to rebuild after changing them
- **No trailing slashes** in URLs (e.g., use `https://api.example.com` not `https://api.example.com/`)
- **For production deployment**, set these in your hosting platform's environment variables:
  - Render: Static Site → Environment → Add Variable
  - Vercel: Project Settings → Environment Variables
  - Netlify: Site Settings → Environment Variables

### Example for Different Environments

**Local Development:**
```env
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=healthcare-app
```

**Production (Render/Vercel):**
```env
VITE_API_URL=https://kayan-healthcare-backend.onrender.com
VITE_APP_NAME=healthcare-app
```

## ▶️ Running the Application

### Development

**Backend:**
```bash
cd server
npm run dev
```
The server will run on `http://localhost:4000`

**Frontend:**
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 📁 Project Structure

```
Technical-Test-For-Kayan/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database & JWT configuration
│   │   ├── models/         # Sequelize models
│   │   ├── controllers/    # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── validators/     # Yup validation schemas
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # Route definitions
│   │   ├── utils/          # Utility functions
│   │   ├── scripts/        # Database scripts
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── README.md
│
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── schemas/        # Validation schemas
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── README.md
│
├── FLOWS.md                # Detailed user flows documentation
└── README.md               # This file
```

## 📚 API Documentation

### Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "doctor123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "full_name": "Dr. John Smith",
      "email": "doctor@example.com",
      "role": "doctor"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

#### Logout
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "..."
}
```

### Patient Endpoints

#### Create Appointment
```http
POST /patients/:patientId/appointments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "doctor_id": "uuid",
  "scheduled_time": "2024-12-25T10:00:00Z"
}
```

#### Get Patient Appointments
```http
GET /patients/:patientId/appointments
Authorization: Bearer <access_token>
```

### Doctor Endpoints

#### Get Doctor Appointments
```http
GET /doctors/:doctorId/appointments
Authorization: Bearer <access_token>
```

#### Start Appointment
```http
POST /appointments/:id/start
Authorization: Bearer <access_token>
```

**Note**: Prevents a doctor from starting more than one appointment at a time. If a doctor tries to start a second appointment while one is still in progress, it returns HTTP 409.

#### Finish Appointment
```http
POST /appointments/:id/finish
Authorization: Bearer <access_token>
```

#### Add Treatment
```http
POST /appointments/:id/treatments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "X-Ray",
  "cost": 150.00
}
```

#### Delete Treatment
```http
DELETE /appointments/:id/treatments/:treatmentId
Authorization: Bearer <access_token>
```

### Finance Endpoints

#### Search Appointments
```http
GET /finance/appointments?doctor=Smith&patient=Doe&status=completed&from=2024-01-01&to=2024-12-31&limit=20&page=1
Authorization: Bearer <access_token>
```

Query Parameters:
- `doctor`: Filter by doctor name (case-insensitive partial match)
- `patient`: Filter by patient name (case-insensitive partial match)
- `appointmentId`: Filter by appointment ID
- `status`: Filter by status (scheduled, in_progress, completed, cancelled)
- `from`: Filter appointments from this date
- `to`: Filter appointments to this date
- `limit`: Number of results per page (default: 20, max: 100)
- `page`: Page number (default: 1)

#### Review Appointment
```http
POST /finance/appointments/:id/review
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "approved": true,
  "notes": "Approved for payment"
}
```

### User Endpoints

#### Get All Doctors
```http
GET /doctors
Authorization: Bearer <access_token>
```

#### Get Profile
```http
GET /profile
Authorization: Bearer <access_token>
```

### Health & Metrics

#### Health Check
```http
GET /health
```

## 🎨 Frontend Documentation

### Pages

- **Login** (`/login`) - Login page
- **Signup** (`/signup`) - Sign up page
- **Profile** (`/profile`) - User profile page

#### Patient Pages
- `/patient/doctors` - List of doctors
- `/patient/appointments/new` - Book new appointment
- `/patient/appointments` - Patient appointments

#### Doctor Pages
- `/doctor/appointments` - List of doctor appointments
- `/doctor/appointment/:id` - Appointment details (start/finish/add treatments)

#### Finance Pages
- `/finance/search` - Search and review appointments

### Authentication Flow

1. User logs in via `/login`
2. `accessToken` is stored in memory
3. `refreshToken` is stored in localStorage
4. When `accessToken` expires, it is automatically refreshed via axios interceptor
5. Redirect based on role:
   - Patient → `/patient/doctors`
   - Doctor → `/doctor/appointments`
   - Finance → `/finance/search`

### State Management

- **React Query**: For data fetching and caching
- **AuthContext**: For managing user state and tokens
- **React Hook Form**: For form management

## 🔄 User Flows

For detailed documentation of all flows, see [FLOWS.md](./FLOWS.md)

### Patient Flow
1. Sign Up/Login
2. View list of doctors
3. Book new appointment
4. View their appointments

### Doctor Flow
1. Login
2. View list of appointments
3. Start visit
4. Add/delete treatments
5. Finish visit

### Finance Flow
1. Login
2. Search for appointments (with filtering)
3. Review appointments
4. View previous reviews

## 🗄️ Database Management

### Build Database Schema
```bash
cd server
npm run build:db
```
Creates/alters tables based on Sequelize models.

### Reset Database
**Warning**: This will drop all tables and recreate them (data will be lost):
```bash
cd server
npm run reset:db
```

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create a new Web Service** on Render
2. **Connect GitHub repository**
3. **Configure settings:**
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
4. **Add PostgreSQL database** (or use external service like Neon)
5. **Set Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-database-connection-string>
   JWT_ACCESS_SECRET=<generate-secure-random-string>
   JWT_REFRESH_SECRET=<generate-secure-random-string>
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=10
   CORS_ORIGIN=<your-frontend-url>
   ```
6. **Deploy**

### Frontend Deployment (Render Static Site / Vercel)

#### Option 1: Render Static Site

1. **Create a new Static Site** on Render
2. **Connect GitHub repository**
3. **Configure settings:**
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Set Environment Variables:**
   ```env
   VITE_API_URL=<your-backend-url>
   VITE_APP_NAME=healthcare-app
   ```
5. **Deploy**

#### Option 2: Vercel (Recommended for Frontend)

1. **Connect GitHub repository** to Vercel
2. **Configure settings:**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Set Environment Variables:**
   ```env
   VITE_API_URL=<your-backend-url>
   VITE_APP_NAME=healthcare-app
   ```
4. **Deploy**

### Environment Variables for Production

#### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) | Generate with `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) | Generate with `openssl rand -base64 32` |
| `CORS_ORIGIN` | Frontend URL | `https://your-frontend.onrender.com` |

#### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com` |

### Important Notes

- **Never commit `.env` files** to version control
- **Generate new JWT secrets** for production (don't reuse development secrets)
- **Use HTTPS** in production for both frontend and backend
- **Ensure CORS_ORIGIN** matches your frontend URL exactly (no trailing slash)
- **Database connection strings** should use SSL in production (add `?sslmode=require`)

## 📝 Scripts

### Backend Scripts
- `npm run dev` - Run server in development mode
- `npm run build` - Build project for production
- `npm run start` - Run server in production mode
- `npm run build:db` - Build database schema
- `npm run reset:db` - Reset database

### Frontend Scripts
- `npm run dev` - Run dev server
- `npm run build` - Build project for production
- `npm run preview` - Preview build
- `npm run test` - Run tests

## 🔒 Security Features

- **JWT Authentication**: Access tokens (15 min) and Refresh tokens (7 days)
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **XSS Protection**: Input sanitization
- **Rate Limiting**: (Can be removed if needed)

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Check credentials and permissions

### Authentication Issues
- Ensure JWT secrets exist and are at least 32 characters long
- Check token expiration settings
- Ensure refresh tokens are being stored correctly

### Frontend API Connection Issues
- Ensure `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

