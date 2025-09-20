# Attendance Management System

```
WEB APPLICATION DEPLOY USINNG VERCEL
- https://attendance-admin-portal.vercel.app
- https://attendance-staff-portal.vercel.app
```

A comprehensive attendance tracking system built with a microservices architecture using Turborepo monorepo structure.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database Management](#database-management)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

## 🏗️ Architecture

This project follows a microservices architecture organized as a Turborepo monorepo:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├─────────────────────┬───────────────────────────────────────┤
│   Admin Portal      │           Staff Portal                │
│   (Port: 4000)      │           (Port: 3000)               │
│   Next.js 15        │           Next.js 15                  │
└─────────────────────┴───────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Services                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│  User Service   │ Attendance Svc  │   Logging Service       │
│  (Auth & Users) │ (Tracking)      │   (Audit & Logs)        │
│  Express.js     │ Express.js      │   Express.js            │
│  Prisma         │ Prisma          │   Prisma                │
└─────────────────┴─────────────────┴─────────────────────────┘
          │                    │                    ▲
          │ Pub/Sub Events     │                    │ Subscribes
          ▼                    ▼                    │
┌─────────────────────────────────────────────────────────────┐
│              Google Cloud Pub/Sub                           │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │   USER Topic    │  │      API_LOG Topic              │   │
│  │ (User Events)   │  │    (API Logging)                │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                               │
│                   PostgreSQL                                │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with Turbopack
- **UI Framework**: React 19
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui
- **HTTP Client**: Axios
- **Date Handling**: Moment.js, date-fns

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5.9
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Passport.js with local strategy
- **Session Management**: Express Session with Prisma Session Store
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs
- **File Upload**: Multer with Cloudinary
- **Message Queue**: Google Cloud Pub/Sub
- **Event-Driven Architecture**: Pub/Sub topics for user events and API logging
- **Validation**: Zod

### Shared Packages
- **UI Components**: Custom design system with shadcn/ui
- **Validation**: Shared validation schemas
- **Utilities**: Common utility functions
- **TypeScript Config**: Shared TypeScript configurations
- **ESLint Config**: Shared linting rules

### Development Tools
- **Monorepo**: Turborepo 2.5
- **Package Manager**: Yarn 1.22
- **Code Formatting**: Prettier
- **Development Server**: tsx with watch mode
- **Build Tool**: Native TypeScript compiler

## 📁 Project Structure

```
attendance/
├── apps/
│   ├── client/
│   │   ├── admin-portal/          # Admin dashboard (Port: 4000)
│   │   └── staff-portal/          # Staff interface (Port: 3000)
│   └── server/
│       ├── attendance/            # Attendance tracking service
│       ├── user/                  # User authentication service
│       └── logging/               # Logging and audit service
├── packages/
│   ├── ui/                        # Shared UI component library
│   ├── validation/                # Shared validation schemas
│   ├── utils/                     # Common utilities
│   ├── typescript-config/         # Shared TypeScript configs
│   └── eslint-config/            # Shared ESLint configs
├── package.json                   # Root package.json
├── turbo.json                     # Turborepo configuration
└── README.md
```

## ✅ Prerequisites

Before running this project, ensure you have:

- **Node.js** 18 or higher
- **Yarn** 1.22.22
- **PostgreSQL** database
- **Google Cloud Project** with Pub/Sub API enabled
- **Google Cloud Service Account** with Pub/Sub permissions
- **Cloudinary Account** (for file uploads)
- **Firebase Project** (for authentication)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd attendance
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Configuration

Create `.env` files in each service directory:

#### Root `.env` (optional)
```env
# Global environment variables
NODE_ENV=development
```

#### `apps/server/user/.env`
```env
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_users"
SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
PORT=5001
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
GOOGLE_PROJECT_ID="your-google-project-id"
GOOGLE_PUB_SUB_CREDENTIALS_PATH="./google-account.json"
# OR use base64 encoded credentials (alternative to file path)
# GOOGLE_PUB_SUB_CREDENTIALS_BASE64="base64-encoded-service-account-json"
```

#### `apps/server/attendance/.env`
```env
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_tracking"
SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
PORT=5002
GOOGLE_PROJECT_ID="your-google-project-id"
GOOGLE_PUB_SUB_CREDENTIALS_PATH="./google-account.json"
# OR use base64 encoded credentials (alternative to file path)
# GOOGLE_PUB_SUB_CREDENTIALS_BASE64="base64-encoded-service-account-json"
```

#### `apps/server/logging/.env`
```env
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_logs"
SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
PORT=5003
GOOGLE_PROJECT_ID="your-google-project-id"
GOOGLE_PUB_SUB_CREDENTIALS_PATH="./google-account.json"
# OR use base64 encoded credentials (alternative to file path)
# GOOGLE_PUB_SUB_CREDENTIALS_BASE64="base64-encoded-service-account-json"
```

#### `apps/client/staff-portal/.env.local`
```env
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:5001
NEXT_PUBLIC_ATTENDANCE_SERVICE_URL=http://localhost:5002
```

#### `apps/client/admin-portal/.env.local`
```env
NEXT_PUBLIC_FRONTEND_URL=http://localhost:4000
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:5001
NEXT_PUBLIC_ATTENDANCE_SERVICE_URL=http://localhost:5002
```


#### Service Account Setup

1. Create a service account in Google Cloud Console
2. Grant the following roles:
   - `Pub/Sub Publisher`
   - `Pub/Sub Subscriber`
3. Download the service account key JSON file
4. Place it as `google-account.json` in each server directory:
   - `apps/server/user/google-account.json`
   - `apps/server/attendance/google-account.json`
   - `apps/server/logging/google-account.json`

Alternatively, you can use base64 encoded credentials in environment variables instead of files.

### 5. Database Setup

```bash
# Generate Prisma clients for all services
yarn turbo run db:generate

# Push database schema (for development)
yarn turbo run db:push

# Or run migrations (for production)
yarn turbo run db:migrate
```

### 6. Start Development

```bash
# Start all applications in development mode
yarn dev
```

This will start:
- Staff Portal: http://localhost:3000
- Admin Portal: http://localhost:4000
- User Service: http://localhost:5001
- Attendance Service: http://localhost:5002
- Logging Service: http://localhost:5003

## 💻 Development

### Available Scripts

```bash
# Development
yarn dev                    # Start all apps in development mode
yarn build                  # Build all apps for production
yarn start                  # Start all apps in production mode

# Code Quality
yarn lint                   # Run ESLint on all packages
yarn format                 # Format code with Prettier
yarn check-types            # Type check all TypeScript files

# Database Operations
yarn turbo run db:generate  # Generate Prisma clients
yarn turbo run db:push      # Push schema to database
yarn turbo run db:migrate   # Run database migrations
yarn turbo run db:studio    # Open Prisma Studio
yarn turbo run db:reset     # Reset database and re-run migrations
```

### Development Ports

| Service | Port | URL |
|---------|------|-----|
| Staff Portal | 3000 | http://localhost:3000 |
| Admin Portal | 4000 | http://localhost:4000 |
| User Service | 5001 | http://localhost:5001 |
| Attendance Service | 5002 | http://localhost:5002 |
| Logging Service | 5003 | http://localhost:5003 |

### Working with Individual Services

```bash
# Work on specific service
cd apps/server/user
yarn dev

# Work on specific client app
cd apps/client/staff-portal
yarn dev
```

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
yarn turbo run db:generate

# View and edit data
yarn turbo run db:studio

# Create and apply migration
yarn turbo run db:migrate

# Reset database (development only)
yarn turbo run db:reset

# Push schema without migration
yarn turbo run db:push
```

### Database Schema

Each service has its own database:

- **User Service**: Manages users, authentication, and sessions
- **Attendance Service**: Handles attendance records and tracking
- **Logging Service**: Stores audit logs and system events

## 🚀 Deployment

### Build for Production

```bash
yarn build
```

### Environment Variables for Production

Ensure all environment variables are properly set in your deployment environment. See the [Environment Variables](#environment-variables) section for the complete list.


## 🔐 Environment Variables

### Required Environment Variables

| Variable | Description | Services |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | All backend services |
| `SECRET` | JWT secret key | All backend services |
| `SESSION_SECRET` | Session encryption key | All backend services |
| `PORT` | Service port number | All backend services |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL | Client apps |
| `GOOGLE_PROJECT_ID` | Google Cloud project ID | User, Attendance, Logging services |
| `GOOGLE_PUB_SUB_CREDENTIALS_PATH` | Service account JSON file path | User, Attendance, Logging services |
| `CLOUDINARY_*` | Cloudinary configuration | User service |

### Optional Environment Variables

- `AUTH_RATE_LIMIT`: Authentication rate limiting
- `API_RATE_LIMIT`: API rate limiting
- `ALLOWED_ORIGINS`: CORS allowed origins
- `GOOGLE_PUB_SUB_CREDENTIALS_PATH`: Path to Google Cloud service account JSON
- `GOOGLE_PUB_SUB_CREDENTIALS_BASE64`: Base64 encoded service account credentials

## 🔄 Event-Driven Architecture with Pub/Sub

The system uses Google Cloud Pub/Sub for asynchronous communication between microservices:

### Pub/Sub Topics

| Topic | Description | Publisher | Subscriber |
|-------|-------------|-----------|------------|
| `user` | User lifecycle events (creation, updates) | User Service | Logging Service |
| `api-log` | API request logging and monitoring | All Services | Logging Service |

### Event Flow

1. **User Registration**: When a user registers, the User Service publishes a user creation event
2. **Attendance Logging**: Attendance events trigger API log events for audit purposes
3. **Centralized Logging**: The Logging Service subscribes to all events for centralized audit trails

### Pub/Sub Implementation

The system includes a shared Pub/Sub service with:
- **Centralized Client**: Configured in `packages/utils/src/config/pub-sub-client.ts`
- **Service Layer**: Abstracted publish/subscribe operations in `packages/utils/src/services/pub-sub.service.ts`
- **Topic Management**: Predefined topics and subscriptions with type safety
- **Error Handling**: Robust error handling and retry mechanisms

```typescript
// Example: Publishing a user event
await PubsubService.publish(PubSubTopics.USER, userData);

// Example: Subscribing to events
PubsubService.subscribe(PubSubSubscriptions.API_LOG_SUBSCRIPTION, handleLogEvent);
```

## 📚 API Documentation

### User Service (Port 5001)
- Authentication and user management
- Session handling
- File uploads

### Attendance Service (Port 5002)
- Clock in/out functionality
- Attendance tracking
- Time calculations

### Logging Service (Port 5003)
- Audit logging
- System event tracking
- Log analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Happy coding! 🎉**
