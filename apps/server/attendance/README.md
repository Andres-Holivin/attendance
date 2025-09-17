# User Authentication Service

A robust Express.js API with session-based authentication using Prisma and Passport.js.

## Features

- 🔐 **Session-based Authentication** with Passport.js
- 🛡️ **Security First** with Helmet, CORS, and Rate Limiting
- 📊 **Database Integration** with Prisma ORM
- ✅ **Input Validation** with express-validator
- 👥 **User Management** with role-based access control
- 🔄 **Health Monitoring** with built-in health checks
- 🚀 **Production Ready** with proper error handling and graceful shutdown

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport.js with local strategy
- **Session Store**: Express Session
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env
```

3. **Configure environment variables** in `.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_users?schema=public"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

4. **Database Setup**:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (for production)
npm run db:migrate
```

5. **Start Development Server**:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/password` | Update password | Yes |
| GET | `/session` | Check session status | No |

### User Management Endpoints (`/api/users`) - Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users with pagination |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id/status` | Activate/deactivate user |
| PUT | `/users/:id/role` | Update user role |
| DELETE | `/users/:id` | Delete user |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |

## API Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

### Get Profile (requires authentication)

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

## User Roles

- **USER**: Default role with basic access
- **MODERATOR**: Extended permissions for content moderation
- **ADMIN**: Full system access including user management

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Session Security**: HTTP-only cookies, secure flags in production
- **Rate Limiting**: General (100 req/15min) and auth-specific (5 req/15min)
- **Input Validation**: Comprehensive validation with express-validator
- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Implemented via Helmet.js

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  firstName String?
  lastName  String?
  isActive  Boolean  @default(true)
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessions  Session[]
}
```

## Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (dev)
npm run db:migrate   # Run migrations (production)
npm run db:studio    # Open Prisma Studio
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "errors": [] // Validation errors when applicable
}
```

## Development

### Project Structure

```
src/
├── config/
│   ├── database.ts    # Prisma client configuration
│   └── passport.ts    # Passport.js configuration
├── middleware/
│   ├── auth.ts        # Authentication middleware
│   └── validation.ts  # Input validation rules
├── routes/
│   ├── auth.ts        # Authentication routes
│   └── users.ts       # User management routes
└── index.ts           # Main application file
```

### Adding New Features

1. Create new route files in `src/routes/`
2. Add middleware in `src/middleware/`
3. Update Prisma schema if needed
4. Run migrations: `npm run db:migrate`
5. Test endpoints

## Production Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use managed PostgreSQL service
3. **Security**: 
   - Set `NODE_ENV=production`
   - Use strong `SESSION_SECRET`
   - Configure proper CORS origins
   - Use HTTPS (secure cookies enabled automatically)
4. **Monitoring**: Monitor health endpoint `/health`

## License

MIT