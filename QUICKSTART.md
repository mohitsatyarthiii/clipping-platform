# 🚀 Quick Reference Guide

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Start background worker
npm run worker

# Run linter
npm run lint
```

## Environment Setup

### 1. Create `.env.local`
```bash
cp .env.example .env.local
```

### 2. Update with your values
```env
MONGODB_URI=your_mongodb_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
JWT_SECRET=your_secret_key
```

### 3. Verify Connection
```bash
# Test MongoDB connection
curl http://localhost:3000/api/auth/register -X POST

# Test YouTube API
npm run test:youtube-api
```

## Docker Setup

### Run with Docker Compose
```bash
docker-compose up -d
```

### Build Docker image
```bash
docker build -t clipping-platform:latest .
docker run -p 3000:3000 clipping-platform:latest
```

## Common API Workflows

### 1. User Registration & Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@example.com","password":"password123","confirmPassword":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response will contain: { token: "..." }
export TOKEN="your_token_here"
```

### 2. Create Campaign (Admin)
```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Summer Challenge",
    "description":"Create summer shorts",
    "payoutPer1000Views":5,
    "maxClippers":50
  }'
```

### 3. Join Campaign (Clipper)
```bash
# Get campaign ID from previous response
export CAMPAIGN_ID="..."

curl -X POST http://localhost:3000/api/campaigns/$CAMPAIGN_ID/join \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Admin Approves Join Request
```bash
# Get request ID from join requests list
export REQUEST_ID="..."

curl -X PUT http://localhost:3000/api/admin/join-requests/$REQUEST_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'
```

### 5. Submit Clip (Approved Clipper)
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId":"'$CAMPAIGN_ID'",
    "uploadedVideoUrl":"https://example.com/clip.mp4",
    "youtubeShortUrl":"https://www.youtube.com/shorts/dQw4w9WgXcQ"
  }'
```

### 6. Admin Approves Submission
```bash
export SUBMISSION_ID="..."

curl -X PUT http://localhost:3000/api/admin/submissions/$SUBMISSION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'
```

### 7. Check Notifications
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

## Database Operations

### Connect to MongoDB Shell
```bash
# Using MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/clipping-platform"

# Using local MongoDB
mongosh mongodb://admin:password@localhost:27017/clipping-platform
```

### Common MongoDB Queries
```javascript
// View users
db.users.find()

// View campaigns
db.campaigns.find()

// View submissions
db.submissions.find()

// View notifications
db.notifications.find({ userId: ObjectId("...") })

// Clear all data
db.users.deleteMany({})
db.campaigns.deleteMany({})
db.submissions.deleteMany({})

// Count documents
db.users.countDocuments()
db.campaigns.countDocuments()
```

## Worker Management

### Start Worker
```bash
# As separate process
npm run worker

# Via API
curl -X POST http://localhost:3000/api/admin/worker-stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'
```

### Check Worker Status
```bash
curl -X GET http://localhost:3000/api/admin/worker-stats \
  -H "Authorization: Bearer $TOKEN"
```

### Run Worker Manually
```bash
curl -X POST http://localhost:3000/api/admin/worker-stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"run"}'
```

## Debugging

### Enable Debug Logs
```bash
# In .env.local
DEBUG=clipping-platform:*
```

### Check MongoDB Connection
```javascript
// In Node.js shell
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once('open', () => console.log('Connected'));
```

### Test YouTube API Key
```bash
curl "https://www.googleapis.com/youtube/v3/videos?key=YOUR_API_KEY&id=dQw4w9WgXcQ&part=statistics"
```

## Performance Monitoring

### Database Size
```javascript
db.stats()
```

### Slow Queries
```javascript
db.setProfilingLevel(1) // Enable profiling
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### Connection Pool
```javascript
// Via Mongoose
mongoose.connection.db.admin().ping((err, resp) => {
  console.log('Ping response:', resp);
});
```

## Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Change `BCRYPT_ROUNDS` for slower hashing (default 10)
- [ ] Enable CORS for specific domains
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Rotate API keys regularly
- [ ] Enable MongoDB authentication
- [ ] Whitelist IP addresses in MongoDB
- [ ] Regular database backups
- [ ] Monitor error logs

## Deployment Checklist

- [ ] Run linter: `npm run lint`
- [ ] Test all endpoints
- [ ] Update `.env.local` with production values
- [ ] Build: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Document any breaking changes
- [ ] Prepare rollback plan

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Timeout
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check connection string syntax
mongosh "<your_connection_string>"
```

### JWT Token Errors
```bash
# Ensure Authorization header format is correct
# Should be: Authorization: Bearer <token>

# Not: Authorization: <token>
# Or: Authorization: Token <token>
```

### CORS Errors
```bash
# Check frontend origin in API requests
# Update CORS configuration if needed
```

## Testing Tools

- **Postman**: Import API collection for testing
- **Thunder Client**: VS Code extension for API testing
- **curl**: Command line API testing (examples above)
- **MongoDB Compass**: Visual MongoDB management

## Resources

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 📖 [Mongoose Docs](https://mongoosejs.com)
- 📖 [YouTube API](https://developers.google.com/youtube/v3)
- 📖 [JWT.io](https://jwt.io)
- 🐛 [Common Errors & Solutions](./ERRORS.md)

---

**For more help, see README.md or check the source code comments.**
