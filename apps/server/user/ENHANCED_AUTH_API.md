# Enhanced Authentication API with Database Session Storage

The authentication API has been upgraded to work seamlessly with database session storage, providing better session management, persistence, and tracking capabilities.

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "position": "Developer",
  "phone": "+1234567890"
}
```

#### POST `/api/auth/login`
Authenticate user and create a database-stored session.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "position": "Developer",
      "image_url": null,
      "phone": "+1234567890"
    },
    "sessionId": "session_id_string",
    "loginTime": "2025-09-17T10:30:00.000Z"
  }
}
```

#### POST `/api/auth/logout`
Destroy session and logout user (removes from database).

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "sessionId": "session_id_string",
    "logoutTime": "2025-09-17T11:30:00.000Z"
  }
}
```

### Profile Management

#### GET `/api/auth/profile`
Get current user profile with session information.

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "position": "Developer",
      "image_url": null,
      "phone": "+1234567890"
    },
    "sessionId": "session_id_string",
    "sessionData": {
      "loginTime": "2025-09-17T10:30:00.000Z",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

#### GET `/api/auth/me`
Get current authenticated user information.

**Response:**
```json
{
  "success": true,
  "message": "User info retrieved successfully",
  "data": {
    "user": { /* user object */ },
    "sessionId": "session_id_string",
    "isAuthenticated": true
  }
}
```

#### PUT `/api/auth/profile`
Update user profile information.

**Body:**
```json
{
  "fullName": "Jane Doe",
  "position": "Senior Developer",
  "phone": "+9876543210",
  "image_url": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { /* updated user object */ },
    "sessionId": "session_id_string",
    "updatedAt": "2025-09-17T11:45:00.000Z"
  }
}
```

### Session Management

#### GET `/api/auth/session`
Get detailed current session information.

**Response:**
```json
{
  "success": true,
  "message": "Session info retrieved successfully",
  "data": {
    "sessionId": "session_id_string",
    "user": { /* user object */ },
    "sessionDatabase": {
      "id": "db_session_id",
      "sessionId": "session_id_string",
      "userId": "user_id",
      "expiresAt": "2025-09-18T10:30:00.000Z",
      "createdAt": "2025-09-17T10:30:00.000Z",
      "updatedAt": "2025-09-17T10:30:00.000Z"
    },
    "isAuthenticated": true,
    "sessionMemory": {
      "loginTime": "2025-09-17T10:30:00.000Z",
      "userAgent": "Mozilla/5.0...",
      "userId": "user_id"
    }
  }
}
```

#### GET `/api/auth/sessions`
Get all active sessions for the current user.

**Response:**
```json
{
  "success": true,
  "message": "User sessions retrieved successfully",
  "data": {
    "currentSessionId": "current_session_id",
    "sessions": [
      {
        "id": "db_session_id_1",
        "sessionId": "session_id_1",
        "expiresAt": "2025-09-18T10:30:00.000Z",
        "createdAt": "2025-09-17T10:30:00.000Z",
        "updatedAt": "2025-09-17T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

## Enhanced Features

### Database Session Storage
- Sessions are stored in PostgreSQL using Prisma
- Automatic cleanup of expired sessions
- Persistent sessions across server restarts
- Support for multiple concurrent sessions per user

### Session Data Tracking
- Login time tracking
- User agent information
- Session activity monitoring
- Proper session lifecycle management

### Enhanced Security
- Secure cookie configuration
- Proper session destruction on logout
- Database-level session cleanup
- Session validation endpoints

### Error Handling
- Comprehensive error responses
- Proper HTTP status codes
- Database error handling
- Session-specific error messages

### Logging
- Authentication event logging
- Session creation/destruction logging
- Error logging with context
- User activity tracking

## Session Configuration

The session is configured with:
- **Storage**: PostgreSQL database via custom Prisma store
- **Duration**: 24 hours by default
- **Security**: HTTP-only, secure in production
- **Cleanup**: Automatic expired session removal every hour
- **Persistence**: Survives server restarts and scales across instances

## Testing Session Features

Use the test endpoints for session validation:
- `/api/session/test-session` - Test session storage functionality
- `/api/session/sessions` - View all sessions in database
- `/api/session/sessions` (DELETE) - Clear all sessions for testing

This enhanced API provides robust session management with database persistence, comprehensive tracking, and improved security for your attendance application.