# 🚀 Deployment Checklist - View Sync System

## Pre-Deployment Verification

### ✅ System Health Check
```bash
# Run system verification
node verify-system.js

# Expected: 96% pass rate (52/54 checks)
```

### ✅ Dependencies
```bash
# Verify all packages installed
npm list

# Check specific packages
npm list node-cron         # Should show: node-cron@3.0.3
npm list mongoose          # Should show: mongoose@9.3.3
npm list jsonwebtoken      # Should show: jsonwebtoken@9.0.3
```

### ✅ File Integrity
```bash
# Verify critical files exist
ls -la lib/server/workers/youtubeSyncWorker.js
ls -la lib/server/workers/backgroundJobs.js
ls -la app/api/admin/sync-views/route.js
ls -la app/api/campaigns/*/sync-views/route.js
```

---

## Development Testing

### ✅ Local Testing (Before Deployment)

#### 1. Start Development Server
```bash
npm run dev

# Expected output:
# [Background Jobs] Initializing background jobs...
# [Background Jobs] ✓ Full sync job scheduled (every 6 hours)
# [Background Jobs] ✓ Health check job scheduled (every 30 minutes)
# [Background Jobs] All background jobs initialized successfully
```

#### 2. Test Background Jobs Initialize
```bash
# Watch for initialization logs
npm run dev 2>&1 | grep "Background Jobs"
```

#### 3. Test Admin API Endpoint
```bash
# First, get admin token by logging in
# Then test sync endpoint

curl -X POST http://localhost:3000/api/admin/sync-views \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 with sync results
```

#### 4. Test Creator Sync Endpoint
```bash
# Get a creator token from an account on a campaign
# Then test creator sync

curl -X POST http://localhost:3000/api/campaigns/CAMPAIGN_ID/sync-views \
  -H "Authorization: Bearer YOUR_CREATOR_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 with updated earnings
```

#### 5. Verify YouTube Integration
```bash
# Check that YouTube service works
# Look for successful view fetches in logs

npm run dev 2>&1 | grep "YouTube Sync"

# Should show successful syncs or API errors
```

---

## Production Deployment

### Environment Setup

#### 1. Create Production Environment File
```bash
# Copy template
cp .env.example .env.production

# Edit with production values
nano .env.production
```

#### 2. Configure Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/production-db

# API
NEXT_PUBLIC_API_URL=https://your-production-domain.com

# Authentication
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# Email
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# YouTube
YOUTUBE_API_KEY=your-production-youtube-api-key

# Admin Account
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=secure-admin-password
```

### Database Preparation

#### 1. Create Admin Account
```bash
# Run setup script (if exists)
npm run setup-admin

# Or create manually via API
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@domain.com",
    "password": "secure-password",
    "role": "admin"
  }'
```

#### 2. Verify Database Connection
```bash
# Test connection
npm run build  # This will test DB connection

# Or test directly
node -e "require('./lib/db').default()"
```

### Build & Optimization

#### 1. Run Build
```bash
npm run build

# Expected: Build completes without errors
# Check for any TypeScript or ESLint errors
```

#### 2. Test Production Build
```bash
npm start

# Expected: Server starts and initializes background jobs
# Watch for: [Background Jobs] Initializing...
```

---

## Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

#### 1. Connect Repository
```bash
npm i -g vercel
vercel

# Follow prompts to connect your GitHub repo
```

#### 2. Configure Environment Variables
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add YOUTUBE_API_KEY
vercel env add NEXT_PUBLIC_API_URL
```

#### 3. Deploy
```bash
vercel --prod

# Or automatic deployment on push to main
```

### Option 2: Railway

#### 1. Connect Repository
```bash
npm i -g @railway/cli
railway login
railway init
```

#### 2. Set Environment Variables
```bash
# In Railway dashboard, add env vars:
# MONGODB_URI
# JWT_SECRET
# EMAIL_USER
# EMAIL_PASSWORD
# YOUTUBE_API_KEY
# NEXT_PUBLIC_API_URL
```

#### 3. Deploy
```bash
railway up
```

### Option 3: Docker

#### 1. Create Dockerfile
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Build Image
```bash
docker build -t clipping-app .
```

#### 3. Run Container
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=your-db-uri \
  -e JWT_SECRET=your-secret \
  clipping-app
```

---

## Post-Deployment Verification

### ✅ Server is Running
```bash
# Check if accessible
curl https://your-domain.com

# Expected: Home page HTML
```

### ✅ Background Jobs Started
```bash
# Check logs for initialization
# Different for each platform (see platform docs)

# Vercel Logs:
vercel logs

# Railway Logs:
railway logs

# Docker Logs:
docker logs container-id
```

### ✅ Database Connected
```bash
# Test endpoint that requires database
curl https://your-domain.com/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 200 with campaign list
```

### ✅ API Endpoints Working
```bash
# Test admin sync
curl -X POST https://your-domain.com/api/admin/sync-views \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Test creator sync
curl -X POST https://your-domain.com/api/campaigns/ID/sync-views \
  -H "Authorization: Bearer CREATOR_TOKEN"
```

### ✅ Automatic Jobs Scheduled
```bash
# Wait 30 minutes and check logs for health check
# Wait 6 hours and check logs for full sync

# Look for: [YouTube Sync] Started...
```

---

## Monitoring Setup

### Logging

#### Vercel
```bash
# View logs
vercel logs app-name

# Or setup Log Drain in dashboard
```

#### Railway
```bash
# View logs
railway logs

# Or setup monitoring in dashboard
```

#### Docker/Self-Hosted
```bash
# Keep logs
docker logs container-id --follow

# Or use log management service
# - ELK Stack
# - Splunk
# - Datadog
```

### Error Tracking

#### Setup Sentry (Optional)
```bash
# Install
npm install @sentry/nextjs

# Configure in next.config.mjs
# Add SENTRY_AUTH_TOKEN to env
```

#### View Errors
```bash
# Monitor dashboard for errors
# Get alerts on critical failures
```

---

## DNS & SSL Configuration

### DNS Records
```
A Record:     your-domain.com       → platform-ip
CNAME Record: www.your-domain.com   → your-domain.com
```

### SSL Certificate
```bash
# For Vercel/Railway: Automatic
# For self-hosted: Use Let's Encrypt

certbot certonly --standalone -d your-domain.com
```

---

## Health Check Monitoring

### Create Health Check Endpoint
```bash
# Add to your API or use existing
GET /api/health

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "jobs": "running",
#   "timestamp": "2024-01-15T12:00:00Z"
# }
```

### Setup Monitoring Service

#### Option 1: Uptime Robot (Free)
1. Create account at uptimerobot.com
2. Add monitor: https://your-domain.com/api/health
3. Set check interval: every 5 minutes
4. Enable alerts: email/SMS/webhook

#### Option 2: New Relic
```bash
npm install @newrelic/next

# Configure in next.config.mjs
# Add NEW_RELIC_LICENSE_KEY
```

---

## Performance Optimization

### Enable Compression
```bash
# Already enabled in Next.js
# Verify via headers
curl -I https://your-domain.com
# Should show: Content-Encoding: gzip
```

### Enable Caching
```bash
# Already configured in next.config.mjs
# Cache-Control headers set
```

### Database Optimization
```bash
# Create indexes in MongoDB
db.campaigns.createIndex({ "status": 1 })
db.campaigns.createIndex({ "creators.creatorId": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })
```

---

## Security Checklist

### ✅ Environment Variables
- [ ] JWT_SECRET is long (32+ characters) and random
- [ ] API keys are production keys
- [ ] Database URI uses production cluster
- [ ] All variables set in production environment

### ✅ HTTPS
- [ ] All requests redirect to HTTPS
- [ ] SSL certificate is valid
- [ ] Certificate auto-renewal enabled

### ✅ Authentication
- [ ] JWT tokens have expiration
- [ ] Refresh token mechanism works
- [ ] Password reset is secure
- [ ] Email verification enabled

### ✅ Database
- [ ] Backups enabled and automated
- [ ] Read replicas configured for high availability
- [ ] Connection pooling optimized
- [ ] Access restricted to app only

### ✅ Rate Limiting
```bash
# Consider adding rate limiting
npm install express-rate-limit

# Protect endpoints like:
# /api/auth/login - 5 requests per 15 minutes
# /api/campaigns/*/sync-views - 1 request per 1 minute
```

---

## Rollback Plan

If deployment fails:

### Step 1: Identify Issue
```bash
# Check logs
vercel logs / railway logs / docker logs

# Look for errors in:
# [YouTube Sync] - sync system
# MongoDB connection
# API errors
```

### Step 2: Rollback
```bash
# Vercel: Automatic (select previous deployment)
# Railway: Push to main and railway will deploy new version
# Docker: Kill container and start previous version
```

### Step 3: Fix Issue
```bash
# Fix code locally
# Run tests
# Commit and push
# Deploy again
```

---

## Scheduled Maintenance

### Weekly
- [ ] Check error logs
- [ ] Verify background jobs ran
- [ ] Check sync completion times

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review database metrics
- [ ] Check storage usage

### Quarterly
- [ ] Full security audit
- [ ] Performance profiling
- [ ] Database optimization
- [ ] Load testing

---

## Success Criteria

Deploy is successful when:

✅ Server responds to requests
✅ Database connection works
✅ Background jobs initialize and run
✅ API endpoints return correct responses
✅ Sync system creates logs
✅ No critical errors in logs
✅ Performance metrics are acceptable

---

## Troubleshooting Deployment Issues

### "Background Jobs Failed to Initialize"
```bash
# Check node-cron installed
npm list node-cron

# Check logs for specific error
# Usually not critical - app continues to work
# Manual sync still available
```

### "Database Connection Failed"
```bash
# Verify MONGODB_URI is correct
# Check MongoDB Atlas allows connection from your IP
# Verify credentials are correct
# Check connection string format
```

### "YouTube API Errors"
```bash
# Check API key is valid
# Verify quota not exceeded
# Check YouTube channel/video exists
# See YOUTUBE_API_SETUP.md for details
```

### "Email Sending Failed"
```bash
# Verify email credentials
# Check "Less secure app access" enabled (Gmail)
# Or use app-specific password
# See documentation for email setup
```

---

## Final Sign-Off

Before declaring deployment complete:

- [ ] System verification passed
- [ ] Development testing completed
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Database connected
- [ ] API endpoints responding
- [ ] Background jobs running
- [ ] Monitoring configured
- [ ] Security measures in place
- [ ] Rollback plan documented

---

## Contact & Support

If you encounter issues:

1. Check logs: `npm run dev 2>&1 | grep "\[YouTube Sync\]"`
2. Review documentation: `VIEW_SYNC_SYSTEM.md`
3. Check GitHub issues
4. Review error messages carefully
5. Check database connection

---

**Deployment Checklist Version: 1.0**
**Last Updated: 2024**
**Status: READY FOR PRODUCTION**
