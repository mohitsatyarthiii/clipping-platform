# 🎥 YouTube API Setup Guide

Complete guide to configure YouTube Data API v3 for the Clipping Platform.

## 📋 Prerequisites

- A Google Account
- Access to Google Cloud Console
- A project for the clipping platform

## 🔧 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `Clipping Platform` (or your choice)
5. Click **CREATE**
6. Wait for project to be created (may take a few minutes)

### Step 2: Enable YouTube Data API v3

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "YouTube Data API v3"
3. Click on **YouTube Data API v3**
4. Click **ENABLE**
5. Wait for enablement to complete

### Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **API Key**
4. A dialog will show your API key
5. Click **Copy** to copy the key
6. Click **Close**

### Step 4: Restrict API Key (Production)

1. Click on your created API key to edit it
2. Under **API restrictions**:
   - Select **Restrict key** 
   - Choose **YouTube Data API v3** from dropdown
3. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add your domain: `yourdomain.com/*`
   - For local development: `localhost:3000/*`
4. Click **SAVE**

### Step 5: Add to Environment

1. Open `.env.local` in your project
2. Find the line: `YOUTUBE_API_KEY=your_youtube_api_key_here`
3. Replace with your copied API key:
   ```
   YOUTUBE_API_KEY=AIzaSyD-lz...
   ```
4. Save the file

## ✅ Testing the API Key

### Test 1: Using cURL

```bash
# Test if API key works
curl "https://www.googleapis.com/youtube/v3/videos?key=YOUR_API_KEY&id=dQw4w9WgXcQ&part=statistics"
```

Expected response:
```json
{
  "kind": "youtube#videoListResponse",
  "items": [
    {
      "statistics": {
        "viewCount": "...",
        "likeCount": "...",
        "commentCount": "..."
      }
    }
  ]
}
```

### Test 2: Using the Backend

```bash
# Start your development server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

If you see YouTube-related endpoints working, the API key is configured correctly.

### Test 3: Direct Test Script

Create a test file `test-youtube.js`:

```javascript
import { getVideoViews, getVideoDetails } from './lib/youtubeService.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const testYoutubeAPI = async () => {
  try {
    // Test video ID (Rick Roll - for testing purposes)
    const videoId = 'dQw4w9WgXcQ';

    console.log('Testing YouTube API with video:', videoId);

    const views = await getVideoViews(videoId);
    console.log('Views:', views);

    const details = await getVideoDetails(videoId);
    console.log('Details:', details);

    console.log('✓ YouTube API is working!');
  } catch (error) {
    console.error('✗ YouTube API error:', error.message);
  }
};

testYoutubeAPI();
```

Run with:
```bash
node test-youtube.js
```

## 🚨 Common Issues & Solutions

### Issue 1: 403 Forbidden Error

**Cause:** API key doesn't have YouTube API enabled

**Solution:**
1. Go to Google Cloud Console
2. Check APIs & Services > Enabled APIs
3. Ensure **YouTube Data API v3** is in the list
4. If not, enable it

### Issue 2: 400 Invalid Request

**Cause:** Invalid video ID or malformed request

**Solution:**
1. Check video ID is 11 characters (e.g., `dQw4w9WgXcQ`)
2. Ensure URL is properly formatted:
   ```
   https://www.googleapis.com/youtube/v3/videos?key=<KEY>&id=<VIDEO_ID>&part=<PART>
   ```

### Issue 3: 429 Quota Exceeded

**Cause:** API quota limit reached

**Solution:**
1. Go to **APIs & Services** > **YouTube Data API v3** > **Quotas**
2. Check current usage
3. Free tier has 10,000 units/day quota
4. Each API call costs different units:
   - `videos.list`: 1 unit
   - `search.list`: 100 units
   - `channels.list`: 1 unit

### Issue 4: API Key Not Recognized

**Cause:** Typo in API key or missing in env file

**Solution:**
1. Verify `.env.local` has correct key
2. Restart your development server: `npm run dev`
3. Check `.env.local` is in gitignore

## 📊 Quota Management

### YouTube API Quota

- **Free tier:** 10,000 units/day
- **Paid tier:** Up to 1,000,000 units/day

### Recommended Optimization

Instead of fetching views every time, implement caching:

```javascript
// Example: Cache for 1 hour
const viewCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const getCachedVideoViews = async (videoId) => {
  const cached = viewCache.get(videoId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await getVideoViews(videoId);
  viewCache.set(videoId, { data, timestamp: Date.now() });
  
  return data;
};
```

## 🔒 API Key Security

### Do's
- ✅ Keep API key in `.env.local` (NOT in git)
- ✅ Restrict to your domain
- ✅ Use HTTP referrers restriction
- ✅ Rotate keys periodically
- ✅ Monitor usage in Google Cloud

### Don'ts
- ❌ Commit API key to GitHub
- ❌ Share API key in messages
- ❌ Use same key across projects
- ❌ Leave key unrestricted
- ❌ Use in frontend code

## 📈 YouTube API Features

### Available Data
```javascript
{
  views: 1000000,           // View count
  likes: 50000,             // Like count
  comments: 5000,           // Comment count
  title: "Video Title",
  description: "...",
  thumbnail: "...",
  duration: "PT11M48S",     // ISO 8601 format
  publishedAt: "2009-10-25T06:57:33Z",
  channelId: "UCuAXFkgsw1L7xaCfnd5J JVw",
  channelTitle: "..."
}
```

### API Endpoints Used

1. **videos.list** - Get views, likes, duration
   ```
   GET /youtube/v3/videos?id=VIDEO_ID&part=statistics,contentDetails,snippet
   ```

2. **search.list** - Search for videos
   ```
   GET /youtube/v3/search?q=QUERY&part=snippet&type=video
   ```

3. **channels.list** - Get channel info
   ```
   GET /youtube/v3/channels?id=CHANNEL_ID&part=statistics,snippet
   ```

## 🔄 Worker Integration

The background worker automatically:

1. Fetches YouTube views every 5 minutes
2. Stores view history
3. Recalculates earnings
4. Updates user wallets
5. Sends notifications

Configure in `.env.local`:
```
WORKER_INTERVAL=300000        # 5 minutes
WORKER_TIMEOUT=60000          # 1 minute max
```

## 📚 Additional Resources

- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com)
- [API Quotas & Limits](https://developers.google.com/youtube/v3/docs/errors)
- [Video Resource](https://developers.google.com/youtube/v3/docs/videos)

## 🧪 Test Videos

For testing without publishing:

| Title | Video ID | Views |
|-------|----------|-------|
| Rick Roll | dQw4w9WgXcQ | 1B+ |
| YouTube Rewind 2019 | 2lXh5U2UE04 | 300M+ |
| Gangnam Style | 9bZkp7q19f0 | 4B+ |

**Note:** These are public videos for testing purposes.

## ✅ Verification Checklist

- [ ] Google Cloud Project created
- [ ] YouTube Data API v3 enabled
- [ ] API Key generated
- [ ] API Key added to `.env.local`
- [ ] API Key restricted (production)
- [ ] Test with cURL successful
- [ ] Backend server running
- [ ] Worker started
- [ ] Monitoring dashboard shows views updating

## 🚀 Production Deployment

For production:

1. **Use OAuth 2.0** instead of API key (more secure)
2. **Enable BigQuery** for advanced analytics
3. **Set up monitoring** for quota usage
4. **Use different keys** for dev/staging/production
5. **Enable backup keys** for redundancy

---

For more help with YouTube API, visit the official documentation linked above.

**Last Updated**: 2026-03-29
