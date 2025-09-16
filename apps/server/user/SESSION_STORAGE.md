# Session Management with Database Storage

This project has been configured to store sessions in the database using a custom Prisma session store implementation.

## Features

- **Database Persistence**: Sessions are stored in PostgreSQL using Prisma ORM
- **Automatic Cleanup**: Expired sessions are automatically cleaned up every hour
- **Custom Session Store**: Implements the express-session Store interface for seamless integration
- **Type Safety**: Proper TypeScript support for session data

## Files Modified/Created

1. **`src/lib/prisma-session-store.ts`** - Custom session store implementation
2. **`src/lib/session.ts`** - Updated session configuration to use database store
3. **`src/routes/session-test.ts`** - Test routes for session functionality
4. **`prisma/schema.prisma`** - Session model (already existed)

## Session Schema

The session is stored in the `sessions` table with the following structure:

```prisma
model Session {
  id        String   @id @default(cuid())
  sessionId String   @unique
  userId    String
  data      String   // JSON-serialized session data
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Testing Session Storage

Use the following endpoints to test session functionality:

### Test Session Storage
```
GET /api/session/test-session
```
- Creates/increments a visit counter in the session
- Returns session ID and visit count

### View All Sessions
```
GET /api/session/sessions
```
- Returns all sessions stored in the database
- Useful for debugging and monitoring

### Clear All Sessions
```
DELETE /api/session/sessions
```
- Removes all sessions from the database
- Useful for testing and cleanup

## Configuration

Key configuration options in `src/lib/session.ts`:

- **Store**: Uses `PrismaSessionStore` for database persistence
- **Session Duration**: 24 hours by default
- **Cleanup Interval**: Expired sessions cleaned every hour
- **Security**: HTTP-only cookies, secure in production

## Environment Variables

Ensure you have the following environment variables set:

```env
SESSION_SECRET=your-secure-session-secret
DATABASE_URL=your-database-connection-string
NODE_ENV=development|production
```

## Benefits of Database Session Storage

1. **Persistence**: Sessions survive server restarts
2. **Scalability**: Multiple server instances can share sessions
3. **Security**: Better control over session data
4. **Monitoring**: Ability to track and analyze session usage
5. **Cleanup**: Automatic removal of expired sessions