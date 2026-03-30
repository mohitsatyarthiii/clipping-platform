# 🚀 Complete Setup & Quick Start Guide

This is a **unified Next.js project** with both frontend and backend API routes running on the same server.

## 📋 Architecture

```
┌─────────────────────────────────────────┐
│     Single Next.js Server (Port 3000)   │
├─────────────────────────────────────────┤
│                                           │
│  ┌────────────────────────────────────┐  │
│  │   Frontend Pages & Components      │  │
│  │   (app/page.js, app/login/, etc)  │  │
│  └────────────────────────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │   Backend API Routes               │  │
│  │   (app/api/auth, campaigns, etc)  │  │
│  └────────────────────────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │   Database (MongoDB)               │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd clipping-platform
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# FRONTEND
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# BACKEND - DATABASE
MONGODB_URI=mongodb://localhost:27017/clipping-platform

# JWT SECRETS (Change these!)
JWT_SECRET=your-super-secret-key-12345
JWT_REFRESH_SECRET=your-refresh-secret-67890

# YOUTUBE API (Optional for testing)
YOUTUBE_API_KEY=your-youtube-api-key

# NODE ENV
NODE_ENV=development
```

### 3. Start MongoDB (if local)
```bash
# Option A: Local MongoDB (requires installation)
mongod

# Option B: Use Docker
docker run -d -p 27017:27017 mongo:latest
```

### 4. Run the Project
```bash
npm run dev
```

Open: **http://localhost:3000**

## 🔑 Test Credentials

### Default Admin Account
After first run, create admin:
```bash
node lib/scripts/createAdmin.js
```

Default credentials:
- **Email**: admin@clippingplatform.com
- **Password**: admin123456

Then login and change password immediately!

### Test Users
Create test accounts:
1. Go to http://localhost:3000/register
2. Create accounts for each role (admin, creator, clipper)
3. Update user roles manually in MongoDB (optional)

## 📂 Project Layout

```
clipping-platform/
│
├── app/
│   ├── api/                    ← Backend API Routes
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── dashboard/
│   │   ├── submissions/
│   │   └── ...
│   ├── dashboard/              ← Dashboard Pages
│   │   ├── admin/
│   │   ├── creator/
│   │   └── clipper/
│   ├── login/page.js           ← Auth Pages
│   ├── register/page.js
│   ├── forgot-password/page.js
│   ├── page.js                 ← Homepage
│   ├── layout.js               ← Root Layout
│   └── globals.css             ← Global Styles
│
├── components/                 ← React Components
│   ├── ui/                     ← UI Components
│   ├── Navbar.js
│   ├── Sidebar.js
│   └── DashboardLayout.js
│
├── lib/
│   ├── api.js                  ← Axios Instance
│   ├── storage.js              ← Token Management
│   ├── stores/                 ← State Management (Zustand)
│   ├── hooks/                  ← Custom Hooks
│   ├── db.js                   ← MongoDB Connection
│   ├── validators.js           ← Input Validators
│   ├── jwtService.js           ← JWT Operations
│   ├── youtubeService.js       ← YouTube Integration
│   └── models/                 ← Database Models
│
├── models/                     ← Mongoose Schemas
│   ├── User.js
│   ├── Campaign.js
│   ├── Submission.js
│   └── ...
│
├── middlewares/                ← Express-like Middlewares
│   ├── auth.js
│   └── errorHandler.js
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

## 🔄 How Frontend Connects to Backend

### 1. API Client Setup
All API calls use `lib/api.js`:

```javascript
// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Auto-inject JWT token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Making API Calls
```javascript
// In any component or page
import { useFetch } from '@/lib/hooks/useApi';

export default function MyComponent() {
  const { data, loading } = useFetch('/campaigns');

  return (
    <div>
      {loading ? 'Loading...' : data?.campaigns?.map(c => <div key={c._id}>{c.title}</div>)}
    </div>
  );
}
```

### 3. API Request Flow
```
Frontend Component
     ↓
useFetch() hook
     ↓
lib/api.js (axios)
     ↓
Add Authorization header
     ↓
POST/GET http://localhost:3000/api/...
     ↓
Backend Route (app/api/...)
     ↓
Validate JWT token
     ↓
Process request
     ↓
Query MongoDB
     ↓
Return response
     ↓
Frontend receives data
```

## 🔐 Authentication Flow

### Register/Login
```javascript
// Frontend
const { register } = useAuthStore();
await register(name, email, password, confirmPassword);

// Automatically:
// 1. API creates user account
// 2. Returns token in response
// 3. Frontend saves token to cookies
// 4. Redirects to dashboard
```

### Protected Routes
```javascript
// Protect a page
export default function AdminPage() {
  useProtectedRoute('admin');  // Will redirect if not admin
  // ... component code
}
```

### Logout
```javascript
const { logout } = useAuthStore();
logout();  // Clears token and redirects to login
```

## 🧪 Testing the API

### Using curl
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Campaigns (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/campaigns
```

### Using Postman
1. Create a POST request to `http://localhost:3000/api/auth/login`
2. Set `Content-Type: application/json`
3. Send: `{"email": "admin@clippingplatform.com", "password": "admin123456"}`
4. Copy the `token` from response
5. For authenticated requests, add to headers: `Authorization: Bearer {token}`

## 📊 Database Setup

### MongoDB Locally
```bash
# Install MongoDB
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connect to database
mongosh
```

### MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Update `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clipping-platform
   ```

### Create Admin User
```bash
node lib/scripts/createAdmin.js
```

## 🎮 Admin Actions

### As Admin:
1. **Login**: http://localhost:3000/login
2. **Create Campaign**: Dashboard → Campaigns → New Campaign
3. **Review Join Requests**: Dashboard → Join Requests
4. **Approve Submissions**: Dashboard → Submissions
5. **View Analytics**: Dashboard overview

### As Creator:
1. **Add Source Content**: Dashboard → Source Content → Add Content
2. **View Performance**: Dashboard → Performance metrics

### As Clipper:
1. **Browse Campaigns**: Dashboard → Campaigns
2. **Request to Join**: Click campaign → Request to Join
3. **Submit Clips**: Dashboard → Submit Clip
4. **Track Earnings**: Dashboard overview

## 🐛 Debugging

### Check Logs
```bash
# Terminal output
npm run dev

# Browser DevTools (F12)
- Console: Check for JS errors
- Network: Check API calls
- Application: Check cookies
```

### Common Issues

**Issue**: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Issue**: 401 Unauthorized
```
Error: Unauthorized
```
**Solution**: 
1. Check token in browser cookies
2. Login again
3. Check JWT_SECRET in `.env.local`

**Issue**: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**:
1. Start MongoDB: `mongod` or Docker
2. Check `MONGODB_URI` in `.env.local`

**Issue**: API not found
```
404 Not Found
```
**Solution**: Check API route exists in `app/api/`

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
# Deploy with Vercel CLI
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `MONGODB_URI` (Production MongoDB)
- `JWT_SECRET` (Change to strong secret)
- `NEXT_PUBLIC_API_URL` (Production domain)
- `YOUTUBE_API_KEY`

### Docker
```bash
# Build image
docker build -t clipping-platform:latest .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongo:27017/clipping-platform \
  -e JWT_SECRET=your-secret \
  clipping-platform:latest
```

### Traditional Server (Node.js)
```bash
# Build
npm run build

# Start
npm start
```

## 📚 Important Files

- **Frontend**:
  - `app/layout.js` - Root layout
  - `components/DashboardLayout.js` - Dashboard wrapper
  - `lib/api.js` - API configuration
  - `lib/stores/authStore.js` - Auth state

- **Backend**:
  - `app/api/auth/login/route.js` - Login endpoint
  - `models/User.js` - User schema
  - `lib/db.js` - Database connection
  - `middlewares/auth.js` - Auth middleware

## ✅ Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running
- [ ] `.env.local` created with all variables
- [ ] `npm install` completed
- [ ] `npm run dev` works
- [ ] Can access http://localhost:3000
- [ ] Can register account
- [ ] Can login with account
- [ ] Can see dashboard
- [ ] API calls show 200 status

## 🎉 You're Ready!

The clipping platform is now running with:
- ✅ Full-featured backend with 30+ API endpoints
- ✅ Modern, beautiful frontend with dark theme
- ✅ Real-time authentication and role-based access
- ✅ Complete admin, creator, and clipper workflows
- ✅ Database integration
- ✅ Error handling and validation

Start building! 🚀

## 📖 Documentation

- `FRONTEND_SETUP.md` - Frontend-specific setup
- `API_DOCUMENTATION.md` - All API endpoints
- `QUICKSTART.md` - Quick reference
- `ARCHITECTURE.md` - System design

## 💬 Need Help?

1. Check error messages in console
2. Review inline code comments
3. Check documentation files
4. Test API with curl/Postman
