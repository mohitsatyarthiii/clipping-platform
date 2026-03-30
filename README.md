# 🎬 Clipping Platform - Production-Grade MVP Backend

A complete, production-ready Node.js/Next.js backend for a clipping marketplace platform supporting creator-generated content, clipper submissions, and earnings management.

## 🚀 Features

### Core Functionality
- **Authentication System**: Register, login, logout, password reset, change password
- **Role-Based Access Control**: Admin, Creator, Clipper roles with fine-grained permissions
- **Campaign Management**: Create, manage, and track campaigns
- **Join Request System**: Clippers request to join campaigns, admins approve/reject
- **Submission Workflow**: Clippers submit clips, admins review and approve
- **YouTube Integration**: Automatic view tracking and earnings calculation
- **Notification System**: Real-time-like notifications (compatible with toast UI)
- **Duplicate Prevention**: Prevents same video/user duplicates in campaigns
- **Earnings Engine**: Automatic calculation and tracking
- **Dashboard**: Role-specific dashboards (admin, clipper, creator)
- **Background Worker**: Periodic YouTube view tracking and earnings updates

### Technical Highlights
- ✅ Next.js 15+ (App Router)
- ✅ JavaScript only (NO TypeScript)
- ✅ MongoDB + Mongoose ORM
- ✅ JWT Authentication
- ✅ Bcrypt Password Hashing
- ✅ YouTube Data API v3 Integration
- ✅ Async Background Worker
- ✅ Comprehensive Error Handling
- ✅ Production-Ready Security

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 4.4+ (local or cloud)
- YouTube Data API Key
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone & Install Dependencies

```bash
cd clipping-platform
npm install
```

### 2. Environment Configuration

Create `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your values:

```env
# DATABASE
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clipping-platform
MONGODB_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d

# SERVER
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# YOUTUBE API
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_API_BASE=https://www.googleapis.com/youtube/v3

# WORKER
WORKER_INTERVAL=300000
WORKER_TIMEOUT=60000

# SECURITY
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
```

### 3. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create an API key in the Credentials section
5. Add the key to `.env.local`

### 4. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free or paid cluster
3. Get connection string
4. Replace `username` and `password` in `MONGODB_URI`

#### Option B: Local MongoDB

```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo

# Update .env.local
MONGODB_URI=mongodb://admin:password@localhost:27017/clipping-platform
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## 🔧 Project Structure

```
clipping-platform/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.js
│       │   ├── login/route.js
│       │   ├── logout/route.js
│       │   ├── forgot-password/route.js
│       │   └── reset-password/route.js
│       ├── profile/
│       │   ├── me/route.js
│       │   ├── update/route.js
│       │   └── change-password/route.js
│       ├── campaigns/
│       │   ├── route.js
│       │   └── [id]/join/route.js
│       ├── submissions/route.js
│       ├── admin/
│       │   ├── join-requests/
│       │   │   ├── route.js
│       │   │   └── [id]/route.js
│       │   ├── submissions/
│       │   │   ├── route.js
│       │   │   └── [id]/route.js
│       │   └── worker-stats/route.js
│       ├── dashboard/
│       │   ├── admin/route.js
│       │   └── clipper/route.js
│       └── notifications/
│           ├── route.js
│           └── [id]/read/route.js
├── models/
│       ├── User.js
│       ├── Campaign.js
│       ├── CampaignJoinRequest.js
│       ├── SourceContent.js
│       ├── Submission.js
│       ├── ViewHistory.js
│       └── Notification.js
├── middlewares/
│   ├── auth.js
│   └── errorHandler.js
├── lib/
│   ├── db.js
│   ├── jwtService.js
│   ├── validators.js
│   ├── youtubeService.js
│   ├── notificationService.js
│   ├── earningsService.js
│   ├── duplicateService.js
│   └── workers/
│       └── youtubeWorker.js
├── .env.example
├── .env.local (create this)
├── package.json
├── next.config.js
└── README.md
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Profile
```
GET    /api/profile/me
PUT    /api/profile/update
PUT    /api/profile/change-password
```

### Campaigns
```
GET    /api/campaigns
POST   /api/campaigns
POST   /api/campaigns/:id/join
```

### Admin - Join Requests
```
GET    /api/admin/join-requests
PUT    /api/admin/join-requests/:id
```

### Submissions
```
POST   /api/submissions
GET    /api/admin/submissions
PUT    /api/admin/submissions/:id
```

### Dashboards
```
GET    /api/dashboard/admin
GET    /api/dashboard/clipper
```

### Notifications
```
GET    /api/notifications
PUT    /api/notifications/:id/read
```

### Worker Management (Admin)
```
GET    /api/admin/worker-stats
POST   /api/admin/worker-stats
```

##‍🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <token>
```

### Example: Login & Get Profile
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}

# Use token to access protected route
curl -X GET http://localhost:3000/api/profile/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## 🎯 User Roles & Permissions

### Admin
- Create campaigns
- Review join requests (approve/reject)
- Review submissions (approve/reject)
- Calculate earnings
- View analytics dashboard
- Manage background worker

### Creator
- Upload source content (YouTube videos)
- Track clip performance
- Monitor total views
- View earnings from generated clips

### Clipper
- Request to join campaigns
- Submit clips (YouTube Shorts)
- Track submissions and approvals
- Monitor personal earnings
- View joined campaigns

## 🤖 Background Worker

The YouTube view tracking worker runs periodically:

```bash
# Start as separate process
npm run worker

# Or start via API (admin only)
POST /api/admin/worker-stats
{
  "action": "start" | "stop" | "run"
}
```

The worker:
- Fetches YouTube video views every 5 minutes (configurable)
- Updates submission view counts
- Recalculates earnings
- Updates user wallets
- Sends notifications on significant earning changes
- Updates campaign metrics
- Maintains view history

## 💰 Earnings System

### Calculation
```
earnings = (views / 1000) * payout_per_1000_views
```

### Workflow
1. Submission approved → earnings calculated
2. YouTube views tracked periodically
3. Earnings updated automatically
4. Pending → Paid (via manual payout process)
5. Notifications sent on updates

## ⚠️ Duplicate Prevention

System prevents duplicate submissions:
- Same video ID + same campaign = REJECTED
- User can't submit same video twice in campaign
- Marked with `isDuplicate` flag
- Manual duplicate reports available

## 🔔 Notification System

Real-time notification triggers:
- ✅ Join request approved/rejected
- ✅ Submission approved/rejected
- ✅ Earnings updated
- ✅ Campaign created
- ✅ New submission received
- ✅ New join request received

## 🧪 Testing with curl

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Create Campaign (Admin)
```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Summer Shorts Challenge",
    "description": "Create amazing shorts from our summer footage",
    "payoutPer1000Views": 5,
    "rules": "Original content only",
    "startDate": "2026-04-01",
    "endDate": "2026-05-01",
    "maxClippers": 100
  }'
```

### Join Campaign (Clipper)
```bash
curl -X POST http://localhost:3000/api/campaigns/:campaignId/join \
  -H "Authorization: Bearer <token>"
```

### Approve Join Request (Admin)
```bash
curl -X PUT http://localhost:3000/api/admin/join-requests/:requestId \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"action": "approve"}'
```

### Submit Clip (Approved Clipper)
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "campaignId": "...",
    "uploadedVideoUrl": "https://example.com/uploads/video.mp4",
    "youtubeShortUrl": "https://www.youtube.com/shorts/dQw4w9WgXcQ"
  }'
```

## 🚀 Production Deployment

### Environment Variables
- Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Use production MongoDB URI
- Set `NODE_ENV=production`
- Enable HTTPS only

### Security Checklist
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention (Mongoose)
- ✅ JWT token security
- ✅ Password hashing (bcrypt)
- ✅ Account lockout (after 5 failed attempts)

### Deployment Platforms
- **Vercel**: `npm run build && npm start`
- **Heroku**: Use Procfile
- **AWS/GCP**: Deploy as containerized app
- **Railway/Render**: Push from Git

## 📊 Database Indexes

Pre-created indexes for performance:
```javascript
User: email (unique)
Campaign: status, createdBy, startDate, endDate
CampaignJoinRequest: (userId, campaignId) unique, status
SourceContent: campaignId, creatorId
Submission: (youtubeVideoId, campaignId) unique, campaignId, userId
ViewHistory: submissionId, fetchedAt
Notification: (userId, isRead, createdAt), userId
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```javascript
// Check connection string in .env.local
// Ensure MongoDB service is running
// For Atlas: Whitelist your IP in security settings
```

### YouTube API Error
```javascript
// Verify API key is correct
// Check API is enabled in Google Cloud Console
// Test with: npm run test:youtube-api
```

### JWT Token Invalid
```javascript
// Ensure token is in "Authorization: Bearer <token>" format
// Check token hasn't expired
// Verify JWT_SECRET matches in .env.local
```

## 📝 Development Guidelines

### Adding New Fields to Models
1. Update the Mongoose schema in `/models`
2. Create a database migration (optional)
3. Update API routes
4. Add validation rules

### Adding New API Endpoints
1. Create route file in `/app/api`
2. Add authentication/authorization
3. Validate request data
4. Handle errors consistently
5. Document in README

### Database Transactions
For critical operations, use MongoDB sessions:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // operations
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
}
```

## 📚 Database Schemas

### User
- Authentication fields + password
- Role + permissions
- Earnings tracking (total, pending, paid)
- Profile image + bio
- Account status + verification

### Campaign
- Title + description
- Payout per 1000 views
- Status lifecycle
- Metrics (submissions, views, earnings)
- Max clippers limit

### Submission
- YouTube video reference
- Upload URL + status
- Views tracking + earnings
- Duplicate detection
- Approval workflow

### Notification
- User targeting
- Type + action classification
- Read status
- Related entity reference
- Toast-compatible structure

## 🔗 Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Mongoose Documentation](https://mongoosejs.com)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## 📄 License

This project is provided as-is for the clipping platform MVP.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the database schemas
3. Check API endpoint logs
4. Verify environment configuration

---

**Built with ❤️ for content creators and clippers**
