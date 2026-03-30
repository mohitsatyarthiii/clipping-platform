# 📡 API Documentation

Complete API reference for the Clipping Platform backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require JWT token:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Creates new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "clipper"
  }
}
```

**Errors:**
- 400: Missing fields, invalid email, password mismatch
- 409: Email already registered

---

### 2. Login User
**POST** `/auth/login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "clipper",
    "profileImage": null
  }
}
```

**Errors:**
- 401: Invalid credentials
- 403: Account inactive
- 423: Account locked (too many login attempts)

---

### 3. Logout
**POST** `/auth/logout`

Logout user (token blacklist on frontend).

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Forgot Password
**POST** `/auth/forgot-password`

Request password reset token.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, password reset instructions have been sent",
  "resetToken": "abc123..." // Only in development
}
```

---

### 5. Reset Password
**POST** `/auth/reset-password`

Reset password using token.

**Request Body:**
```json
{
  "token": "abc123...",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password"
}
```

**Errors:**
- 400: Invalid or expired token
- 400: Password mismatch

---

## 👤 Profile Endpoints

### 1. Get My Profile
**GET** `/profile/me`
**Auth Required:** Yes

Gets current user profile.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "clipper",
    "profileImage": null,
    "bio": "Video creator and editor",
    "earnings": {
      "total": 500,
      "pending": 100,
      "paid": 400
    },
    "createdAt": "2026-03-20T10:00:00.000Z"
  }
}
```

---

### 2. Update Profile
**PUT** `/profile/update`
**Auth Required:** Yes

Update user profile information.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "bio": "Professional video editor",
  "profileImage": "https://example.com/image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### 3. Change Password
**PUT** `/profile/change-password`
**Auth Required:** Yes

Change user password.

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- 401: Current password incorrect
- 400: Password mismatch

---

## 📺 Campaign Endpoints

### 1. Get All Campaigns
**GET** `/campaigns`
**Auth Required:** No

Get paginated list of campaigns.

**Query Parameters:**
```
?page=1&limit=10&status=active&sort=-createdAt
```

**Response (200):**
```json
{
  "success": true,
  "campaigns": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Summer Shorts Challenge",
      "description": "Create amazing summer shorts",
      "payoutPer1000Views": 5,
      "status": "active",
      "createdBy": {
        "_id": "...",
        "name": "Admin User"
      },
      "currentClippers": 25,
      "metrics": {
        "totalSubmissions": 50,
        "totalViews": 100000
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

---

### 2. Create Campaign
**POST** `/campaigns`
**Auth Required:** Yes (Admin only)

Create new campaign.

**Request Body:**
```json
{
  "title": "Summer Challenge",
  "description": "Create amazing summer shorts from our footage",
  "payoutPer1000Views": 5,
  "rules": "Original content only, 60 seconds max",
  "maxClippers": 100,
  "startDate": "2026-04-01",
  "endDate": "2026-05-01",
  "banner": "https://example.com/banner.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaign": { ... }
}
```

**Errors:**
- 403: User is not admin

---

### 3. Join Campaign
**POST** `/campaigns/:id/join`
**Auth Required:** Yes

Request to join campaign.

**Response (201):**
```json
{
  "success": true,
  "message": "Join request submitted successfully",
  "joinRequest": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "campaignId": "507f1f77bcf86cd799439010",
    "status": "pending"
  }
}
```

**Errors:**
- 404: Campaign not found
- 409: Already requested to join

---

## 📝 Submission Endpoints

### 1. Submit Clip
**POST** `/submissions`
**Auth Required:** Yes

Clipper submits clip to campaign.

**Request Body:**
```json
{
  "campaignId": "507f1f77bcf86cd799439010",
  "uploadedVideoUrl": "https://example.com/uploads/clip.mp4",
  "youtubeShortUrl": "https://www.youtube.com/shorts/dQw4w9WgXcQ"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Submission created successfully",
  "submission": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "campaignId": "507f1f77bcf86cd799439010",
    "youtubeVideoId": "dQw4w9WgXcQ",
    "views": 0,
    "earnings": 0,
    "status": "pending",
    "isDuplicate": false
  }
}
```

**Errors:**
- 403: User not approved for campaign
- 409: Duplicate submission
- 400: Invalid YouTube URL

---

## 🛠️ Admin Endpoints

### 1. Get Join Requests
**GET** `/admin/join-requests`
**Auth Required:** Yes (Admin only)

Get all pending join requests.

**Query Parameters:**
```
?page=1&limit=20&status=pending
```

**Response (200):**
```json
{
  "success": true,
  "joinRequests": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "profileImage": null
      },
      "campaignId": {
        "_id": "...",
        "title": "Summer Challenge"
      },
      "status": "pending",
      "createdAt": "2026-03-20T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 2. Review Join Request
**PUT** `/admin/join-requests/:id`
**Auth Required:** Yes (Admin only)

Approve or reject join request.

**Request Body:**
```json
{
  "action": "approve", // or "reject"
  "rejectionReason": "Does not meet requirements"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Join request approved successfully",
  "joinRequest": { ... }
}
```

---

### 3. Get Submissions
**GET** `/admin/submissions`
**Auth Required:** Yes (Admin only)

Get all submissions for review.

**Query Parameters:**
```
?page=1&limit=20&status=pending&campaign=campaignId
```

**Response (200):**
```json
{
  "success": true,
  "submissions": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": { ... },
      "campaignId": { ... },
      "youtubeVideoId": "dQw4w9WgXcQ",
      "views": 150,
      "earnings": 0.75,
      "status": "pending",
      "isDuplicate": false,
      "createdAt": "2026-03-20T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 4. Review Submission
**PUT** `/admin/submissions/:id`
**Auth Required:** Yes (Admin only)

Approve, reject, or request changes on submission.

**Request Body:**
```json
{
  "action": "approve", // or "reject"
  "rejectionReason": "Poor quality video"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Submission approved successfully",
  "submission": { ... }
}
```

---

### 5. Worker Stats
**GET** `/admin/worker-stats`
**Auth Required:** Yes (Admin only)

Get background worker status.

**Response (200):**
```json
{
  "success": true,
  "worker": {
    "isRunning": true,
    "successCount": 145,
    "failureCount": 2,
    "interval": 300000
  }
}
```

---

### 6. Control Worker
**POST** `/admin/worker-stats`
**Auth Required:** Yes (Admin only)

Start, stop, or run worker manually.

**Request Body:**
```json
{
  "action": "start" // or "stop", "run"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Worker started",
  "stats": { ... }
}
```

---

## 📊 Dashboard Endpoints

### 1. Admin Dashboard
**GET** `/dashboard/admin`
**Auth Required:** Yes (Admin only)

Get admin dashboard metrics.

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "totalUsers": 150,
    "totalCampaigns": 10,
    "totalSubmissions": 500,
    "pendingJoinRequests": 15,
    "pendingSubmissions": 30,
    "totalViews": 1000000,
    "earnings": {
      "totalEarningsDistributed": 5000,
      "totalEarningsPaid": 3000,
      "totalEarningsPending": 2000,
      "averageEarningsPerUser": 33.33
    },
    "recentSubmissions": [ ... ]
  }
}
```

---

### 2. Clipper Dashboard
**GET** `/dashboard/clipper`
**Auth Required:** Yes

Get clipper-specific dashboard.

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "joinedCampaigns": 5,
    "pendingApprovals": 3,
    "totalEarnings": 250,
    "totalViews": 50000,
    "earnings": {
      "total": 250,
      "pending": 50,
      "paid": 200
    },
    "submissions": 8,
    "approvedSubmissions": 6,
    "pendingJoinRequests": [],
    "topClips": [
      {
        "id": "...",
        "campaignTitle": "Summer Challenge",
        "views": 5000,
        "earnings": 25,
        "createdAt": "2026-03-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Creator Dashboard
**GET** `/dashboard/creator`
**Auth Required:** Yes (Creator only)

Get creator-specific dashboard.

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "sourceContentCount": 5,
    "totalViews": 100000,
    "totalClipsFromContent": 50,
    "totalViewsFromClips": 75000,
    "topClips": [ ... ],
    "sourceContents": [ ... ]
  }
}
```

---

## 🔔 Notification Endpoints

### 1. Get Notifications
**GET** `/notifications`
**Auth Required:** Yes

Get user notifications.

**Query Parameters:**
```
?page=1&limit=20&includeRead=false
```

**Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Join Request Approved ✅",
      "message": "Your request to join 'Summer Challenge' has been approved!",
      "type": "success",
      "action": "join_approved",
      "isRead": false,
      "createdAt": "2026-03-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "unreadCount": 2
  }
}
```

---

### 2. Mark as Read
**PUT** `/notifications/:id/read`
**Auth Required:** Yes

Mark notification as read.

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": { ... }
}
```

---

## 📤 Source Content (Creator) Endpoints

### 1. Upload Source Content
**POST** `/source-content`
**Auth Required:** Yes (Creator only)

Upload source YouTube video for campaign.

**Request Body:**
```json
{
  "campaignId": "507f1f77bcf86cd799439010",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Source content uploaded successfully",
  "sourceContent": {
    "_id": "507f1f77bcf86cd799439015",
    "creatorId": "507f1f77bcf86cd799439011",
    "campaignId": "507f1f77bcf86cd799439010",
    "youtubeVideoId": "dQw4w9WgXcQ",
    "title": "Original Video Title",
    "thumbnail": "https://...",
    "status": "active"
  }
}
```

---

### 2. Get Source Contents
**GET** `/source-content`
**Auth Required:** Yes (Creator only)

Get creator's source contents.

**Query Parameters:**
```
?page=1&limit=20&campaign=campaignId
```

**Response (200):**
```json
{
  "success": true,
  "sourceContents": [ ... ],
  "pagination": { ... }
}
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "user": { ... } // or data, campaign, etc.
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 423 | Locked |
| 500 | Server Error |

---

## Rate Limiting

- No explicit rate limiting implemented (add in production)
- Recommended: 100 requests/minute per user

---

## Pagination

Standard pagination object:
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

---

## Error Codes

| Error | Code | Solution |
|-------|------|----------|
| Invalid email | 400 | Use valid email format |
| Unauthorized | 401 | Include valid JWT token |
| Forbidden | 403 | User role insufficient |
| Not found | 404 | Check resource ID |
| Duplicate | 409 | Resource already exists |
| Account locked | 423 | Wait 15 minutes, try again |

---

## Testing

Use provided cURL examples in QUICKSTART.md or import into Postman/Thunder Client.

---

Last updated: 2026-03-29
