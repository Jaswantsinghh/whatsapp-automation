# 🔐 WhatsApp Dashboard Login System

A complete authentication and authorization system for the WhatsApp webhook dashboard with role-based access control and granular message type permissions.

## ✨ Features

### 🔑 Authentication
- **Secure Login/Logout** with JWT tokens
- **Password Hashing** with bcrypt
- **Token Refresh** mechanism
- **Session Management** with database tracking

### 👥 User Management (Admin)
- **Create/Edit/Delete Users**
- **Role Assignment** (Admin, Manager, Agent)
- **User Status Control** (Active/Inactive)
- **Permission Management** per user

### 📝 Message Type System
- **Custom Message Types** with color coding
- **Granular Permissions**: View, Reply, Assign
- **Admin-managed** message categories
- **Dynamic Permission Assignment**

### 🛡️ Security
- **Role-based Access Control**
- **JWT with secure HTTP-only cookies**
- **Audit Logging** for admin actions
- **Rate Limiting** protection
- **Input Validation** with Zod schemas

## 🚀 Quick Start

### 1. Setup
```bash
# Make setup script executable and run
chmod +x setup-login-system.sh
./setup-login-system.sh
```

### 2. Start Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 3. Access the System
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 👤 Demo Users

| Role    | Email                 | Password    | Access Level |
|---------|----------------------|-------------|--------------|
| Admin   | admin@example.com    | admin123    | Full system access |
| Manager | manager@example.com  | manager123  | All message types |
| Agent   | agent@example.com    | agent123    | Limited access |

## 🎯 User Flows

### Admin Flow
1. **Login** → Redirected to `/admin`
2. **User Management**: Create users, assign roles
3. **Message Types**: Create categories with colors
4. **Permissions**: Assign message type access to users

### Agent Flow
1. **Login** → Redirected to `/dashboard`
2. **View Messages**: Only permitted message types
3. **Filter & Sort**: By priority, category, status
4. **Actions**: Based on permissions (view/reply/assign)

## 🏗️ Architecture

### Backend Structure
```
backend/src/
├── db/
│   ├── schema.ts          # Database schema with new tables
│   └── seed.ts            # Initial data seeding
├── routes/
│   ├── auth.ts            # Authentication endpoints
│   └── messageTypes.ts    # Message type management
├── controllers/
│   ├── authController.ts  # Auth logic
│   └── messageTypesController.ts
├── services/
│   ├── authService.ts     # Enhanced with user management
│   └── messageTypesService.ts
└── middleware/
    └── auth.ts            # JWT validation & role checking
```

### Frontend Structure
```
frontend/src/app/
├── login/
│   └── page.tsx           # Login interface
├── admin/
│   └── page.tsx           # Admin dashboard
├── dashboard/
│   └── page.tsx           # User dashboard
└── page.tsx               # Auto-redirect based on auth
```

## 📊 Database Schema

### New Tables Added
- **messageTypes**: Message categories with colors
- **userMessageTypePermissions**: User access matrix
- Enhanced **users** table with roles
- **userSessions** for token management

### Permission Matrix
| User | Support | Complaints | Sales | Technical | Billing |
|------|---------|------------|-------|-----------|---------|
| Admin| V+R+A   | V+R+A      | V+R+A | V+R+A     | V+R+A   |
| Manager| V+R+A | V+R+A      | V+R+A | V+R+A     | V+R+A   |
| Agent| V+R     | V          | -     | V+R       | -       |

*V=View, R=Reply, A=Assign*

## 🔧 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User authentication
- `GET /users` - List all users (admin)
- `PUT /users/:id/permissions` - Update user permissions (admin)

### Message Types (`/api/message-types`)
- `GET /` - List all types (admin)
- `POST /` - Create message type (admin)
- `GET /my-types` - Get user's accessible types

## 🧪 Testing

### Automated Test
```bash
# Install test dependencies
npm install axios

# Run test suite
node test-login-system.js
```

### Manual Testing
1. **Login Test**: Try all demo credentials
2. **Admin Panel**: Create user, assign permissions
3. **Permission Test**: Login as agent, verify limited access
4. **Security Test**: Try accessing admin URLs as agent

## 🔒 Security Features

### Production Checklist
- [x] Password hashing (bcrypt, 12 rounds)
- [x] JWT with secure cookies
- [x] Role-based authorization
- [x] Input validation (Zod schemas)
- [x] SQL injection protection (Drizzle ORM)
- [x] Rate limiting (Express middleware)
- [x] Audit logging
- [x] Session management

## 🎨 UI/UX Features

### Design System
- **Glassmorphism** styling
- **Gradient backgrounds** and animations
- **Responsive design** for all devices
- **Loading states** and error handling
- **Color-coded** message types
- **Interactive elements** with hover effects

### User Experience
- **Auto-redirect** based on authentication
- **Role-based navigation**
- **Permission indicators** in UI
- **Real-time feedback** for actions
- **Demo credentials** display for testing

## 📚 Documentation

- **LOGIN_SYSTEM_DOCS.md**: Complete technical documentation
- **API Documentation**: Endpoint specifications
- **Database Schema**: Table relationships and indexes
- **Security Guide**: Best practices and considerations

## 🛠️ Development

### Adding New Roles
1. Update TypeScript types in `authService.ts`
2. Add role to validation schemas
3. Update middleware permissions
4. Add UI handling for new role

### Adding New Permissions
1. Add column to `userMessageTypePermissions` table
2. Update service methods
3. Add UI controls in admin panel
4. Update frontend permission checks

## 🚨 Troubleshooting

### Common Issues

**"Cannot find module" errors**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Database connection errors**
- Check `.env` file exists in backend/
- Verify database URL is correct
- Run migrations if using external DB

**Login not working**
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify demo users are seeded

**Permissions not updating**
- Check user is admin role
- Verify API calls in browser network tab
- Refresh page after permission changes

## 📈 Next Steps

### Planned Enhancements
- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Advanced audit logging
- [ ] Bulk user operations
- [ ] User groups and templates
- [ ] API rate limiting per user
- [ ] Real-time notifications

---

**🎉 The login system is now fully implemented and ready for production use!**

For detailed technical documentation, see `LOGIN_SYSTEM_DOCS.md`.