# 🏗️ System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│                   (Web, Mobile, Dashboard)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Server                            │
│                    (App Router)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               API Routes (30+ endpoints)                 │   │
│  │  ├── /auth (Register, Login, Password Recovery)         │   │
│  │  ├── /profile (User Profile Management)                 │   │
│  │  ├── /campaigns (Campaign CRUD & Join)                  │   │
│  │  ├── /submissions (Clip Submissions)                    │   │
│  │  ├── /admin (Admin Management)                          │   │
│  │  ├── /dashboard (Role-specific Dashboards)              │   │
│  │  ├── /notifications (Notification Service)              │   │
│  │  └── /source-content (Creator Content)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                            │   │
│  │  ├── JWT Authentication                                 │   │
│  │  ├── Role-Based Access Control                          │   │
│  │  └── Error Handling                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Service Layer                              │   │
│  │  ├── jwtService (Token Management)                      │   │
│  │  ├── youtubeService (YouTube API)                       │   │
│  │  ├── notificationService (Notifications)                │   │
│  │  ├── earningsService (Earnings Calculation)             │   │
│  │  ├── duplicateService (Duplicate Detection)             │   │
│  │  └── validators (Input Validation)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Database Abstraction Layer (Mongoose)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────┬───────────────────────────────────────────┬─┘
                    │                                           │
            ┌───────▼────────┐                      ┌──────────▼────┐
            │   MongoDB      │                      │  YouTube API  │
            │   Database     │                      │   v3 Service  │
            │                │                      │               │
            │ ┌────────────┐ │                      │ ┌───────────┐ │
            │ │ users      │ │                      │ │ View Data │ │
            │ ├────────────┤ │                      │ └───────────┘ │
            │ │ campaigns  │ │                      │               │
            │ ├────────────┤ │                      │ ┌───────────┐ │
            │ │ submissions│ │                      │ │ Video     │ │
            │ ├────────────┤ │                      │ │ Details   │ │
            │ │ join req   │ │                      │ └───────────┘ │
            │ ├────────────┤ │                      │               │
            │ │ notif.     │ │                      │ ┌───────────┐ │
            │ ├────────────┤ │                      │ │ Statistics│ │
            │ │ view hist. │ │                      │ │ Metadata  │ │
            │ └────────────┘ │                      │ └───────────┘ │
            └────────────────┘                      └───────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────┐
│           API Request Flow                      │
└──────────────┬──────────────────────────────────┘
               │
        ┌──────▼──────┐
        │   Request   │
        └──────┬──────┘
               │
        ┌──────▼──────────────────┐
        │  Authentication         │
        │  (JWT Verification)     │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Authorization          │
        │  (Role Check)           │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Input Validation       │
        │  (Validators)           │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Business Logic         │
        │  (Services)             │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Database Operation     │
        │  (Mongoose Models)      │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Response               │
        │  (JSON)                 │
        └─────────────────────────┘
```

## Data Flow Diagrams

### User Submission & Earnings Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   SUBMISSION LIFECYCLE                         │
└────────────────────────────────────────────────────────────────┘

1. Clipper Joined Campaign
   └─ CampaignJoinRequest.status = "approved"

2. Clipper Submits Clip
   ├─ Create Submission
   │  └─ status = "pending"
   │  └─ views = 0
   │  └─ earnings = 0
   └─ Notify Admin

3. Admin Reviews
   ├─ Approve Submission
   │  │
   │  ├─ Calculate Earnings
   │  │  └─ earnings = (views / 1000) * payoutPer1000Views
   │  │
   │  ├─ Update User Earnings
   │  │  └─ user.earnings.pending += calculated
   │  │
   │  └─ Notify Clipper "APPROVED"
   │
   └─ OR Reject
      └─ Notify Clipper "REJECTED"

4. Background Worker (Every 5 mins)
   ├─ Fetch YouTube Views API
   │  └─ getVideoViews(youtubeVideoId)
   │
   ├─ Update Submission
   │  ├─ views = newViewCount
   │  └─ lastViewFetch = now()
   │
   ├─ Recalculate Earnings
   │  └─ earnings = (newViews / 1000) * payout
   │
   ├─ Update User Wallet
   │  └─ user.earnings.pending += difference
   │
   ├─ Create View History
   │  └─ ViewHistory record
   │
   └─ Send Notification (if earnings > $5)
      └─ "Earnings Updated: +$XX"
```

### Campaign Join Request Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   JOIN REQUEST LIFECYCLE                       │
└────────────────────────────────────────────────────────────────┘

1. Clipper Requests to Join
   ├─ Check if already requested
   │  └─ If yes → return 409 Conflict
   │
   ├─ Create CampaignJoinRequest
   │  └─ status = "pending"
   │
   └─ Notify Admin "New Join Request"

2. Admin Reviews Request
   ├─ Get Join Requests (pending)
   ├─ Review Clipper Profile
   │
   ├─ APPROVE
   │  ├─ Request.status = "approved"
   │  ├─ Campaign.currentClippers += 1
   │  └─ Notify Clipper "APPROVED ✅"
   │     └─ Can now submit clips
   │
   └─ REJECT
      ├─ Request.status = "rejected"
      ├─ Rejection.reason = "..."
      └─ Notify Clipper "REJECTED ❌"
         └─ Cannot submit clips
```

### Notification System Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION TRIGGERS                       │
└────────────────────────────────────────────────────────────────┘

Triggers:
  ├─ Join Request Approved
  │  └─ createNotification(userId, 'join_approved', ...)
  │
  ├─ Join Request Rejected
  │  └─ createNotification(userId, 'join_rejected', ...)
  │
  ├─ Submission Approved
  │  └─ createNotification(userId, 'submission_approved', ...)
  │
  ├─ Submission Rejected
  │  └─ createNotification(userId, 'submission_rejected', ...)
  │
  ├─ Earnings Updated (> $5)
  │  └─ createNotification(userId, 'earnings_updated', ...)
  │
  ├─ Campaign Created
  │  └─ createNotification(adminUsers, 'campaign_created', ...)
  │
  ├─ New Submission Received
  │  └─ createNotification(adminId, 'new_submission', ...)
  │
  └─ New Join Request Received
     └─ createNotification(adminId, 'new_join_request', ...)

Storage:
  └─ Notification document
     ├─ userId
     ├─ title
     ├─ message
     ├─ type (info, success, warning, error)
     ├─ action (enum for filtering)
     ├─ isRead
     └─ relatedEntity (campaign, submission, etc)

Retrieval:
  ├─ GET /api/notifications?page=1&limit=20
  ├─ GET /api/notifications (unread only)
  └─ PUT /api/notifications/:id/read (mark as read)
```

## Worker Process Architecture

```
┌────────────────────────────────────────────────────────────────┐
│            BACKGROUND WORKER LIFECYCLE                         │
└────────────────────────────────────────────────────────────────┘

START
  │
  ├─► Initialize YouTubeWorker
  │   └─ Connect to MongoDB
  │   └─ Set interval (5 minutes default)
  │
  ├─► Run immediately + on interval
  │   │
  │   ├─► Get all approved submissions
  │   │
  │   └─► For each submission:
  │       │
  │       ├─► Fetch YouTube Views API
  │       │   └─ getVideoViews(videoId)
  │       │
  │       ├─► Compare old vs new views
  │       │
  │       ├─► Update submission
  │       │   ├─ views = newCount
  │       │   ├─ lastViewFetch = now
  │       │   └─ earnings = recalc()
  │       │
  │       ├─► Update user wallet
  │       │   └─ earnings.pending += delta
  │       │
  │       ├─► Create ViewHistory record
  │       │
  │       ├─► Update campaign metrics
  │       │   └─ metrics.totalViews += delta
  │       │
  │       └─► Send notification (if delta > 5$)
  │
  └─► Log stats
      └─ successCount, failureCount, lastRun

SIGNALS
  ├─ SIGTERM → Graceful shutdown
  ├─ SIGINT → Graceful shutdown
  └─ Cleanup timers + close connections

MONITORING
  ├─ GET /api/admin/worker-stats
  │  └─ Return: isRunning, stats, lastRun
  │
  ├─ POST /api/admin/worker-stats (action=start)
  │  └─ Start worker process
  │
  ├─ POST /api/admin/worker-stats (action=stop)
  │  └─ Stop worker process
  │
  └─ POST /api/admin/worker-stats (action=run)
     └─ Execute once immediately
```

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────┐
│               ERROR HANDLING ARCHITECTURE                      │
└────────────────────────────────────────────────────────────────┘

                        ┌─── ERROR ───┐
                        │             │
                    ┌───┴───┬─────────┴────┐
                    │       │              │
              ┌─────▼──┐   │         ┌────▼─────┐
              │Mongoose│   │         │  Thrown  │
              │ Errors │   │         │  Error   │
              └─────┬──┘   │         └────┬─────┘
                    │      │              │
              ┌─────▼──────▼──────────────▼──────┐
              │   AppError Handler Middleware     │
              └─────┬───────────────────────────┘
                    │
              ┌─────▼─────────────────────┐
              │ Classify Error Type        │
              │ ├─ Validation             │
              │ ├─ Authentication         │
              │ ├─ Authorization          │
              │ ├─ Not Found              │
              │ ├─ Duplicate              │
              │ ├─ Server Error           │
              │ └─ Other                  │
              └─────┬─────────────────────┘
                    │
              ┌─────▼──────────────────────┐
              │ Set HTTP Status Code        │
              │ 400, 401, 403, 404, 409, 500
              └─────┬──────────────────────┘
                    │
              ┌─────▼──────────────────────┐
              │ Generate Response JSON      │
              │ {                           │
              │   success: false,           │
              │   message: "...",           │
              │   stack (dev only)          │
              │ }                           │
              └─────┬──────────────────────┘
                    │
              ┌─────▼──────────────────────┐
              │  Return to Client           │
              └─────────────────────────────┘
```

## Security Layer Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                  SECURITY ARCHITECTURE                         │
└────────────────────────────────────────────────────────────────┘

REQUEST
  │
  ├─► HTTPS/TLS
  │   └─ Encrypted transport
  │
  ├─► Extract Authorization Header
  │   └─ "Bearer <token>"
  │
  ├─► JWT Verification
  │   ├─ Decode token
  │   ├─ Verify signature
  │   ├─ Check expiration
  │   └─ Get userId
  │
  ├─► Fetch User from DB
  │   ├─ Check if exists
  │   ├─ Check if active
  │   └─ Get role
  │
  ├─► Role-Based Access Control
  │   ├─ Admin?
  │   ├─ Creator?
  │   └─ Clipper?
  │       └─ If not allowed → 403 Forbidden
  │
  ├─► Input Validation
  │   ├─ Email format
  │   ├─ URL format
  │   ├─ Array bounds
  │   ├─ Type checking
  │   └─ Sanitization
  │       └─ If invalid → 400 Bad Request
  │
  ├─► Business Logic
  │   ├─ Check permissions
  │   ├─ Check constraints
  │   └─ Process request
  │
  ├─► Database Query
  │   ├─ Mongoose ORM prevents injection
  │   └─ Run with least privilege
  │
  └─► Response
      ├─ No sensitive data
      ├─ Proper status codes
      └─ Sanitized error messages
```

---

## Technology Integration Points

```
┌───────────────────────────────────────────────────┐
│           EXTERNAL INTEGRATIONS                   │
└───────────────────────────────────────────────────┘

YouTube Data API v3
  ├─ Get video statistics (views, likes, comments)
  ├─ Search videos
  ├─ Get channel info
  └─ Validate video existence

Email Service (Nodemailer)
  ├─ Password reset emails
  ├─ Welcome emails
  ├─ Approval notifications
  └─ Earnings alerts

Monitoring (Ready for)
  ├─ Error logging (Sentry)
  ├─ Performance monitoring (New Relic)
  ├─ Metrics collection (Prometheus)
  └─ Logs aggregation (ELK)

Payment Gateway (Ready for)
  ├─ Stripe integration
  ├─ PayPal integration
  └─ Earnings payout

CDN (Ready for)
  ├─ Video hosting
  ├─ Asset delivery
  └─ Image optimization
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                 DEPLOYMENT TOPOLOGY                            │
└────────────────────────────────────────────────────────────────┘

Development
  └─ npm run dev
     └─ Local MongoDB

Production (Cloud Options)
  ├─ Vercel
  │  ├─ Deploy via Git
  │  └─ Serverless functions
  │
  ├─ Docker Container
  │  ├─ Build image
  │  ├─ Push to registry
  │  └─ Deploy to K8s/Cloud
  │
  ├─ Heroku
  │  ├─ Git push deployment
  │  └─ Procfile based
  │
  └─ AWS/GCP/Azure
     ├─ App Service
     ├─ Cloud Run
     └─ Elastic Beanstalk

Database
  ├─ Local: Docker MongoDB
  ├─ Cloud: MongoDB Atlas
  └─ Self-hosted: EC2 + MongoDB

Background Jobs
  ├─ Built-in Worker (this project)
  ├─ Bull/BullMQ (with Redis)
  ├─ AWS Lambda + CloudWatch
  └─ Google Cloud Tasks
```

---

**Architecture Version**: 1.0
**Last Updated**: 2026-03-29
**Ready for**: Production Deployment
