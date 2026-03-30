# 🔧 View Sync System - Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Issue: Background Jobs Not Starting

### Symptoms
- Logs don't show `[Background Jobs] Initializing...`
- Manual syncs work, but automatic syncs don't run
- No syncs happening at scheduled times

### Diagnosis
```bash
# Check if node-cron is installed
npm list node-cron

# Verify database initialization
npm run dev 2>&1 | head -50

# Check for errors in logs
npm run dev 2>&1 | grep -i error
```

### Solutions

#### Solution 1: Reinstall Dependencies
```bash
# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Start fresh
npm run dev
```

#### Solution 2: Check Database Connection
```bash
# Verify MongoDB URI
echo $MONGODB_URI

# Test connection
mongosh "$MONGODB_URI"

# If connection fails, update .env.local
```

#### Solution 3: Check Node Version
```bash
# Verify Node >= 18
node --version

# If too old, update Node.js
# Visit https://nodejs.org
```

#### Solution 4: Verify Import Path
```bash
# In lib/db.js, check import is correct:
const { initializeBackgroundJobs } = require('./server/workers/backgroundJobs');

# Verify file exists:
ls -la lib/server/workers/backgroundJobs.js
```

---

## 🔴 Issue: Sync Fails with YouTube API Error

### Symptoms
- Manual sync returns error about YouTube API
- Logs show: `Failed to get views: API limit exceeded`
- Some creators sync, others fail

### Error Messages

#### "API limit exceeded"
**Cause**: YouTube API quota reached
**Solution**:
```bash
# Check API key in .env
echo $YOUTUBE_API_KEY

# Wait for quota reset (usually daily)
# Or upgrade YouTube API plan
# See: YOUTUBE_API_SETUP.md
```

#### "Invalid video ID"
**Cause**: YouTube link malformed
**Solution**:
```bash
# Verify creator's YouTube link format
# Should be: https://www.youtube.com/@username
# or: https://youtube.com/c/channelname

# Update in database or frontend:
db.campaigns.updateOne(
  { "_id": campaignId },
  { $set: { "creators.$.platformLinks.youtube": "correct-url" } }
)
```

#### "Video not found"
**Cause**: Video deleted or private
**Solution**:
```bash
# Check if video still exists
# Ask creator to verify link
# Check video isn't private/unlisted
```

#### "Authentication failed"
**Cause**: Invalid API key
**Solution**:
```bash
# Generate new API key
# 1. Go to Google Cloud Console
# 2. Create/select project
# 3. Enable YouTube Data API v3
# 4. Create API key
# 5. Update YOUTUBE_API_KEY in .env
# 6. Restart server
```

---

## 🔴 Issue: Earnings Not Calculating Correctly

### Symptoms
- View count updates but earnings don't
- Earnings showing as $0
- Earnings not matching expected value

### Diagnosis
```bash
# Check payout rate in campaign
mongosh "$MONGODB_URI"
db.campaigns.findOne({ _id: ObjectId("campaign_id") })

# Look for: payoutPer1000Views

# Check earnings service is called
npm run dev 2>&1 | grep -i earnings
```

### Solutions

#### Solution 1: Verify Payout Rate
```bash
# Campaign should have payoutPer1000Views
# Value should be > 0
# Example: 5 means $5 per 1000 views

# Update if needed:
db.campaigns.updateOne(
  { _id: ObjectId("campaign_id") },
  { $set: { payoutPer1000Views: 5 } }
)
```

#### Solution 2: Check Calculation Logic
```javascript
// Formula: earnings = (views / 1000) * payoutRate
// Example: (5000 / 1000) * 5 = $25

// Verify in earningsService.js
// If formula wrong, fix it
```

#### Solution 3: Manual Recalculation
```bash
# Run manual sync
curl -X POST http://localhost:3000/api/admin/sync-views

# Check if earnings update
# If not, check earningsService.js has correct formula
```

---

## 🔴 Issue: API Endpoint Returns 401 Unauthorized

### Symptoms
- Curl request returns 401
- "Unauthorized" error message
- Works in development, fails in production

### Diagnosis
```bash
# Verify token is provided
curl -X POST http://localhost:3000/api/admin/sync-views \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check token is valid
# Check token hasn't expired
# Check user role is admin (for admin endpoint)
```

### Solutions

#### Solution 1: Get New Token
```bash
# Login to get fresh token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Use returned token in Authorization header
```

#### Solution 2: Verify User Is Admin
```bash
# Check user role in database
mongosh "$MONGODB_URI"
db.users.findOne({ email: "admin@example.com" })

# Should show: role: "admin"

# If not, update:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

#### Solution 3: Check JWT Secret
```bash
# Verify same JWT_SECRET used for all deployments
# If different, tokens won't validate

# In production, use environment variable:
echo $JWT_SECRET

# Should be same in dev and production
```

---

## 🔴 Issue: Database Connection Fails

### Symptoms
- Can't start server
- MongoDB connection timeout
- "Failed to connect" error

### Diagnosis
```bash
# Check MongoDB URI
echo $MONGODB_URI

# Test connection manually
mongosh "$MONGODB_URI"

# Check for connection string errors
echo $MONGODB_URI | grep "mongodb+srv"
```

### Solutions

#### Solution 1: Verify Connection String
```bash
# Format should be:
# mongodb+srv://username:password@cluster.mongodb.net/dbname

# Check:
# - Username/password correct
# - Database name matches
# - No special characters need encoding

# If special characters, encode them:
# Example: p@ss becomes p%40ss
```

#### Solution 2: Add IP to Whitelist
```bash
# In MongoDB Atlas:
# 1. Go to Network Access
# 2. Add IP Address
# 3. Add your server IP
# 4. Or add 0.0.0.0/0 (less secure)
```

#### Solution 3: Check Network Connection
```bash
# If in Docker/container, ensure:
# - Container can reach internet
# - Firewall allows outbound connections
# - No proxy interfering

# Test connectivity:
docker exec container-id ping 8.8.8.8
```

#### Solution 4: Use Connection Pool
```bash
# In lib/db.js, connection pooling already configured
# If still issues, try reducing pool size:
maxPoolSize: 5
minPoolSize: 1
```

---

## 🟡 Issue: Sync Running Very Slowly

### Symptoms
- Sync takes 5+ minutes for same campaigns
- High server CPU/memory usage
- Requests timing out

### Diagnosis
```bash
# Check how many campaigns/creators
mongosh "$MONGODB_URI"
db.campaigns.countDocuments({ status: "active" })

# Count creators
db.campaigns.aggregate([
  { $group: { _id: null, total: { $sum: { $size: "$creators" } } } }
])
```

### Solutions

#### Solution 1: Reduce Sync Frequency
```javascript
// In backgroundJobs.js, change from:
const fullSyncJob = cron.schedule('0 */6 * * *', async () => {

// To less frequent:
const fullSyncJob = cron.schedule('0 */12 * * *', async () => {
  // Every 12 hours instead of 6
});
```

#### Solution 2: Optimize YouTube Service
```javascript
// In youtubeTrackingService.js
// Add caching to prevent duplicate API calls
// Verify API response times are acceptable
```

#### Solution 3: Add Batching
```javascript
// In youtubeSyncWorker.js
// Process creators in batches of 5-10
// Instead of sequential
const batchSize = 10;
for (let i = 0; i < creators.length; i += batchSize) {
  const batch = creators.slice(i, i + batchSize);
  // Process batch
}
```

#### Solution 4: Check Server Resources
```bash
# Check CPU usage during sync
top

# Check memory usage
free -h

# If low resources, upgrade server or optimize code
```

---

## 🟡 Issue: Sync Success Rate Very Low

### Symptoms
- Most syncs fail in background job
- Manual syncs work fine
- Error rate is 50%+

### Diagnosis
```bash
# Check log messages
npm run dev 2>&1 | grep -i failed

# Look for pattern in failures
npm run dev 2>&1 | grep "\[YouTube Sync\]" | grep -i error
```

### Solutions

#### Solution 1: Check YouTube Links
```bash
# Verify all creators have YouTube links
mongosh "$MONGODB_URI"
db.campaigns.find({ 
  $or: [
    { "creators.platformLinks.youtube": { $exists: false } },
    { "creators.platformLinks.youtube": null }
  ]
})

# If missing, add them via frontend or API
```

#### Solution 2: Increase Error Logging
```javascript
// In youtubeSyncWorker.js, add more logging
console.log(`[YouTube Sync] Processing creator: ${creatorId}`);
console.log(`[YouTube Sync] YouTube link: ${creator.platformLinks.youtube}`);

// This helps identify which creators are failing
```

#### Solution 3: Add Retry Logic
```javascript
// In youtubeTrackingService.js, add retry

async function getViewCountWithRetry(link, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await getViewCount(link);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
    }
  }
}
```

---

## 🟡 Issue: Memory Leak - Server Using More Memory Over Time

### Symptoms
- Memory usage increases over time
- Server becomes unresponsive
- Background jobs slow down

### Diagnosis
```bash
# Check memory usage
ps aux | grep node

# Monitor over time
watch -n 1 'ps aux | grep node'

# Use profiler
node --prof app.js
```

### Solutions

#### Solution 1: Check Background Job Disposal
```javascript
// In backgroundJobs.js, ensure jobs are cleaned up
// Avoid storing large objects in job scope

// Don't do:
const results = [];
for (const campaign of campaigns) {
  results.push(...largeObject); // Memory grows
}

// Do:
for (const campaign of campaigns) {
  processAndDiscard(campaign); // Process and forget
}
```

#### Solution 2: Check Database Query Results
```javascript
// Don't load all into memory
const campaigns = await Campaign.find(); // If 10k campaigns, loads all

// Use streaming or pagination
const campaigns = await Campaign.find().limit(100);
```

#### Solution 3: Restart Periodically
```javascript
// In production, restart service daily
// Add to cron or systemd:

# Restart every day at 2 AM
0 2 * * * systemctl restart app-service
```

---

## 🟢 How to Check System Health

### Quick Health Check
```bash
# 1. Check if running
you_command="curl http://localhost:3000"
$you_command

# 2. Check logs
npm run dev 2>&1 | tail -50

# 3. Test API
curl -X POST http://localhost:3000/api/admin/sync-views \
  -H "Authorization: Bearer TOKEN"

# 4. Check database
mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"
```

### Production Health Check
```bash
# Setup endpoint
GET /api/health

# Returns:
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z",
  "database": "connected",
  "jobs": "running",
  "uptime": 86400
}
```

### Set Up Monitoring
```bash
# Option 1: Sentry
npm install @sentry/nextjs

# Option 2: Datadog
npm install dd-trace

# Option 3: New Relic
npm install @newrelic/next
```

---

## 📞 When to Escalate

If you've tried all solutions and still have issues:

1. **Check Documentation**
   - [VIEW_SYNC_SYSTEM.md](VIEW_SYNC_SYSTEM.md)
   - [YOUTUBE_API_SETUP.md](YOUTUBE_API_SETUP.md)
   - [MONGODB_SETUP.md](MONGODB_SETUP.md)

2. **Check Error Logs Carefully**
   - Full error message
   - Stack trace
   - Timestamp

3. **Collect Information**
   - Node.js version
   - Operating system
   - Error reproduction steps

4. **Post to Support**
   - Include all above information
   - Show logs
   - Describe what you tried

---

## Quick Reference: Common Fixes

| Issue | Quick Fix | Command |
|-------|-----------|---------|
| Jobs not starting | Restart server | `npm run dev` |
| YouTube error | Check API key | `echo $YOUTUBE_API_KEY` |
| DB connection | Add IP to MongoDB | MongoDB Atlas dashboard |
| 401 error | Get new token | Login again |
| Slow sync | Reduce frequency | Edit backgroundJobs.js |
| Memory leak | Restart server | `systemctl restart app` |

---

**Troubleshooting Guide v1.0**
**Last Updated: 2024**
