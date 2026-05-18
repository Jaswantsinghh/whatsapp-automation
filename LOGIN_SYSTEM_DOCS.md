# WhatsApp Dashboard Login System Documentation

## Overview

This document describes the complete login and authentication system implemented for the WhatsApp webhook dashboard. The system provides role-based access control with different permission levels for managing WhatsApp messages.

## System Architecture

### Authentication Flow
1. **User Login** → JWT token generation
2. **Token Verification** → Middleware validates requests
3. **Role-based Access** → Different dashboards per role
4. **Permission-based Filtering** → Users see only permitted message types

### Database Schema

#### Core Tables

**users**
- `id`: UUID primary key
- `email`: Unique user email
- `name`: Display name
- `passwordHash`: Bcrypt hashed password
- `role`: 'admin' | 'manager' | 'agent'
- `isActive`: Boolean status
- `createdAt`, `updatedAt`, `lastActiveAt`: Timestamps

**messageTypes**
- `id`: UUID primary key
- `name`: Unique message type name
- `description`: Optional description
- `color`: Hex color code for UI
- `isActive`: Boolean status
- `createdAt`, `updatedAt`: Timestamps

**userMessageTypePermissions**
- `id`: UUID primary key
- `userId`: Foreign key to users
- `messageTypeId`: Foreign key to messageTypes
- `canView`: Boolean permission
- `canReply`: Boolean permission
- `canAssign`: Boolean permission
- `createdAt`: Timestamp

**userSessions**
- `id`: UUID primary key
- `userId`: Foreign key to users
- `token`: JWT access token
- `refreshToken`: JWT refresh token
- `expiresAt`: Token expiration
- `isRevoked`: Boolean revocation status
- `createdAt`: Timestamp

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Endpoints
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /verify` - Verify token validity

#### Protected Endpoints
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /change-password` - Change password

#### Admin-only Endpoints
- `POST /register` - Register new user
- `GET /users` - Get all users
- `PUT /users/:id` - Update user details
- `DELETE /users/:id` - Delete user
- `PUT /users/:id/permissions` - Update user permissions

### Message Types Routes (`/api/message-types`)

#### Admin Endpoints
- `GET /` - Get all message types
- `POST /` - Create message type
- `PUT /:id` - Update message type
- `DELETE /:id` - Delete message type

#### User Endpoints
- `GET /my-types` - Get accessible message types

## Frontend Pages

### `/login` - Login Page
- Email/password authentication
- Role-based redirect after login
- Demo credentials display
- Responsive glassmorphism design

### `/admin` - Admin Dashboard
- **User Management Tab**:
  - View all users
  - Edit user details
  - Manage user permissions
  - Activate/deactivate accounts
- **Message Types Tab**:
  - Create new message types
  - Edit existing types
  - Set color coding
  - Toggle active status

### `/dashboard` - User Dashboard
- View permitted message types
- See permission levels (view/reply/assign)
- Filter messages by type and priority
- Role-based action buttons

## User Roles & Permissions

### Admin
- Full system access
- User management capabilities
- Message type management
- All message permissions
- Access to admin panel

### Manager
- All message type permissions
- Cannot manage users or system settings
- Can assign messages to agents
- Limited admin functions

### Agent
- Limited message type access
- Permissions assigned by admin
- Can view and reply to assigned types
- No administrative capabilities

## Message Type Permissions

Each user can have different permission levels for each message type:

- **canView**: Can see messages of this type
- **canReply**: Can respond to messages
- **canAssign**: Can assign messages to other users

## Security Features

### Password Security
- Bcrypt hashing with salt rounds: 12
- Strong password requirements
- Password change functionality

### JWT Implementation
- Access tokens: 7 days expiration
- Refresh tokens: 30 days expiration
- HTTP-only cookies for refresh tokens
- Token revocation on logout

### Session Management
- Database-stored sessions
- Automatic token cleanup
- User activity tracking
- Audit logging for admin actions

### Rate Limiting
- Express rate limiter middleware
- 1000 requests per 15 minutes per IP
- Special handling for auth endpoints

## Demo Setup

### Default Users
```
Admin:    admin@example.com    / admin123
Manager:  manager@example.com  / manager123
Agent:    agent@example.com    / agent123
```

### Default Message Types
1. **Support Requests** (Blue #3B82F6)
2. **Complaints** (Red #EF4444)
3. **Sales Inquiries** (Green #10B981)
4. **Technical Issues** (Yellow #F59E0B)
5. **Billing Questions** (Purple #8B5CF6)

### Agent Default Permissions
- Support Requests: View + Reply
- Complaints: View only
- Technical Issues: View + Reply

### Manager Default Permissions
- All message types: View + Reply + Assign

## Installation & Setup

### 1. Database Setup
```bash
# Generate migration
npm run migration:generate

# Run migration
npm run migration:run

# Seed initial data
npm run seed:login
```

### 2. Environment Variables
```env
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
NODE_ENV=development
```

### 3. Start Services
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Usage Examples

### Admin Creating New User
1. Login as admin
2. Navigate to Admin Panel → User Management
3. Click "Add User" (if implemented)
4. Set role and basic permissions
5. User receives credentials

### Setting User Permissions
1. Admin selects user from list
2. Click "Manage Permissions"
3. Toggle permissions per message type
4. Save changes
5. User permissions updated immediately

### User Accessing Messages
1. Login with user credentials
2. Dashboard shows only permitted message types
3. Messages filtered by permissions
4. Actions available based on permission level

## Error Handling

### Authentication Errors
- 401: Invalid or expired token
- 403: Insufficient permissions
- 400: Invalid credentials format

### API Response Format
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": "string"
}
```

## Troubleshooting

### Common Issues

**Can't Login**
- Check credentials
- Verify user is active
- Check token expiration

**Permission Denied**
- Verify user role
- Check message type permissions
- Confirm API endpoint access

**Database Errors**
- Check connection string
- Verify migrations ran
- Check table existence

## Future Enhancements

### Planned Features
- Email verification for new users
- Password reset functionality
- Two-factor authentication
- Advanced audit logging
- Bulk permission management
- User groups and templates

### Performance Optimizations
- Redis session storage
- Database connection pooling
- API response caching
- WebSocket real-time updates

## Security Considerations

### Production Checklist
- [ ] Strong JWT secrets
- [ ] HTTPS enforcement
- [ ] Database encryption
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Regular security updates

This login system provides a robust foundation for managing WhatsApp message access with fine-grained permissions and comprehensive administrative capabilities.