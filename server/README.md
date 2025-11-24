# Healthcare Backend API

A comprehensive healthcare management backend built with Node.js, Express, TypeScript, PostgreSQL, and Sequelize.

## Features

- 🔐 JWT-based authentication with access and refresh tokens
- 👥 Role-based authorization (Patient, Doctor, Finance)
- 📅 Appointment management with race condition protection
- 💊 Treatment tracking with automatic total calculation
- 🔍 Advanced search and filtering for finance team
- ✅ Request validation using Yup
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting, XSS Protection)
- 📝 Comprehensive logging with Pino
- 🚀 CI/CD with GitHub Actions

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize v6
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Yup
- **Security**: Helmet, CORS, express-rate-limit, xss-clean
- **Logging**: Pino

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   NODE_ENV=development
   PORT=4000
   DATABASE_URL=postgres://username:password@localhost:5432/healthcare_db
   JWT_ACCESS_SECRET=your_random_secret_min_32_chars
   JWT_REFRESH_SECRET=your_random_secret_min_32_chars
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=10
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Create the database**
   ```bash
   createdb healthcare_db
   ```

5. **Build the database schema**
   ```bash
   npm run build:db
   ```
   
   This will create all tables based on the Sequelize models.
   
   **Note**: To reset the database (drop all tables and recreate), use:
   ```bash
   npm run reset:db
   ```

## Running the Application

### Development
```bash
npm run dev
```

The server will start on `http://localhost:4000`

### Production
```bash
npm run build
npm start
```

## Database Setup

The database schema is automatically created from Sequelize models using `npm run build:db`. This will:
- Create all tables if they don't exist
- Alter existing tables to match the models (add/remove columns)

**Note**: The database is built from models, not migrations. All schema changes should be made directly in the model files.

## API Endpoints

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

**Note**: This endpoint prevents a doctor from having more than one appointment in progress. If a doctor tries to start a second appointment while one is in progress, it returns HTTP 409.

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
- `appointmentId`: Filter by exact appointment ID
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

### Health & Metrics

#### Health Check
```http
GET /health
```

#### Metrics
```http
GET /metrics
```

## Database Management

### Build Database Schema
Builds the database schema from Sequelize models (creates/alters tables):
```bash
npm run build:db
```

### Reset Database
**Warning**: This will drop all tables and recreate them (data will be lost):
```bash
npm run reset:db
```

### Schema Changes
To modify the database schema:
1. Update the corresponding model file in `src/models/`
2. Run `npm run build:db` to apply changes

The `build:db` script uses Sequelize's `sync()` method with `alter: true`, which will:
- Create tables that don't exist
- Add new columns to existing tables
- Remove columns that no longer exist in models (be careful!)

## Deployment

### Railway

1. Create a new Railway project
2. Add PostgreSQL service
3. Connect your GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy

### Heroku

1. Install Heroku CLI
2. Create a new app:
   ```bash
   heroku create your-app-name
   ```
3. Add PostgreSQL addon:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```
4. Set environment variables:
   ```bash
   heroku config:set JWT_ACCESS_SECRET=your_secret
   heroku config:set JWT_REFRESH_SECRET=your_secret
   # ... other variables
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```
6. Run migrations:
   ```bash
   heroku run npm run migrate
   heroku run npm run seed
   ```

### Docker (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

## Project Structure

```
server/
├── src/
│   ├── config/          # Database and JWT configuration
│   ├── models/          # Sequelize models
│   ├── migrations/      # Database migrations
│   ├── seeders/         # Database seeders
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── validators/      # Yup validation schemas
│   ├── middlewares/     # Express middlewares
│   ├── routes/          # Route definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Key Features Explained

### Race Condition Protection

The appointment start endpoint uses database transactions with row-level locking (`SELECT ... FOR UPDATE`) to prevent a doctor from starting multiple appointments simultaneously. This ensures atomicity and prevents race conditions.

### Automatic Total Calculation

When treatments are added or removed, the appointment's `total_amount` is automatically recalculated within the same transaction, ensuring data consistency.

### Security

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **XSS Protection**: Sanitizes user input
- **JWT**: Secure token-based authentication
- **bcrypt**: Password hashing with configurable salt rounds

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Check database credentials and permissions

### Database Build Errors

- Ensure database exists
- Check database connection string in `.env`
- Verify PostgreSQL is running
- Review model files for syntax errors

### Authentication Issues

- Verify JWT secrets are set and at least 32 characters
- Check token expiration settings
- Ensure refresh tokens are being stored correctly

## License

ISC

## Support

For issues and questions, please open an issue on the repository.

