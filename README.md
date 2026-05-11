NaijPoll API
A production-ready NestJS backend for a Nigerian voting/poll platform with JWT authentication, refresh tokens, role-based access control, and poll management.
Tech Stack
Framework: NestJS v11
Database: PostgreSQL (via TypeORM)
Cache/Session: Redis (Upstash)
Auth: Passport.js + JWT + bcrypt
Validation: class-validator + class-transformer
Security: Helmet, Throttler (rate limiting)
Prerequisites
Node.js v20+
PostgreSQL
Redis (Upstash)
Environment Variables
Create a .env file:
env
Copy
NODE_ENV=development
PORT=3000

# Database

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_DATABASE=naij_poll

# JWT

JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRATION=30m
JWT_REFRESH_SECRET=your-refresh-secret-different-from-above
REFRESH_EXPIRATION=7d

# Redis

NB: Your internet connection needs to be turned on to connect to the redis upstash remote database.

# For Upstash: rediss://default:password@host.upstash.io:6379

Setup
bash
Copy

# Install dependencies

npm install

# Run in development

npm run start:dev

# Build for production

npm run build

# Run production build

npm run start:prod
Project Structure
plain
Copy
src/
├── auth/ # Authentication (login, register, refresh, logout)
│ ├── strategies/ # Passport JWT & Local strategies
│ ├── guards/ # JwtAuthGuard, RolesGuard
│ └── decorators/ # @Roles(), @CurrentUser()
├── users/ # User management
├── polls/ # Poll CRUD (admin only for create/update/delete)
├── votes/ # Voting & results
├── redis/ # Redis connection module
├── global/ # Exception filter, transform interceptor
└── middlewares/ # Logger middleware
API Overview
Authentication
Table
Method Endpoint Auth Description
POST /api/v1/auth/register No Create account
POST /api/v1/auth/login No Login, sets refresh cookie
POST /api/v1/auth/refresh Cookie Get new access token
POST /api/v1/auth/logout Bearer Clear session
GET /api/v1/auth/me Bearer Current user
Users
Table
Method Endpoint Auth Description
GET /api/v1/users/me Bearer Profile (name, email, state)
GET /api/v1/users Admin List all users
Polls (Admin)
Table
Method Endpoint Auth Description
POST /api/v1/polls Admin Create poll with 2-4 options
GET /api/v1/polls No List polls (paginated, filter by status)
GET /api/v1/polls/:id No Single poll
PATCH /api/v1/polls/:id Admin (owner) Update poll
POST /api/v1/polls/:id/close Admin (owner) Close poll
DELETE /api/v1/polls/:id Admin (owner) Delete poll
Voting
Table
Method Endpoint Auth Description
POST /api/v1/polls/:pollId/votes Bearer Submit vote (one per user)
GET /api/v1/polls/:pollId/votes/results No Results, optional ?state= filter
GET /api/v1/polls/:pollId/votes/results/by-state No State breakdown
Auth Flow
Register/Login → Returns access_token + sets refresh_token HttpOnly cookie
Protected routes → Send Authorization: Bearer <access_token>
Token expired → Call /auth/refresh with cookie to get new access token
Logout → Clears cookie + revokes refresh token in Redis
Key Features
Password hashing with bcrypt
JWT access tokens (short-lived)
Refresh token rotation with Redis storage
Role-based access control (user/admin)
Ownership checks — admins can only edit/delete their own polls
State-based aggregation — votes tracked by Nigerian state
Rate limiting via @nestjs/throttler
Security headers via Helmet
Request/response transformation via global interceptor and exception filter
Deployment
Set environment variables on your platform (Render, Railway, etc.)
Ensure PostgreSQL and Redis are accessible
Build: npm ci && npm run build
Start: npm run start:prod
