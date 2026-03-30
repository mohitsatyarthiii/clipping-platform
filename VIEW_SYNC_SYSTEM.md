# View Synchronization System

## Overview

The View Synchronization system automatically fetches view counts from various social media platforms (starting with YouTube) and updates creator earnings accordingly. This system includes:

- **Automatic syncing** via scheduled cron jobs (every 6 hours)
- **Manual sync triggers** via admin API endpoints
- **Creator-initiated sync** for their own views on specific campaigns
- **Error handling and logging** for all sync operations
- **Real-time earnings calculation** based on updated view counts

## Architecture

### Components

1. **YouTube Service** (`lib/server/services/youtubeTrackingService.js`)
   - Fetches video view counts from YouTube
   - Caches results to minimize API calls
   - Handles authentication and errors

2. **Sync Worker** (`lib/server/workers/youtubeSyncWorker.js`)
   - Core sync logic for campaigns and creators
   - Manages batch operations
   - Coordinates with earnings service

3. **Background Jobs** (`lib/server/workers/backgroundJobs.js`)
   - Cron job scheduling and management
   - Lifecycle management for background processes
   - Health checks and monitoring

4. **API Endpoints**
   - Admin sync: `POST /api/admin/sync-views`
   - Campaign sync: `POST /api/campaigns/[id]/sync-views`
   - Status: `GET /api/admin/sync-views`

## Usage

### Automatic Synchronization

Background jobs run on a schedule:
- **Full sync**: Every 6 hours (at 00:00, 06:00, 12:00, 18:00 UTC)
- **Health check**: Every 30 minutes

Background jobs initialize automatically when the database connects.

### Manual Admin Sync (All Campaigns)

```bash
curl -X POST http://localhost:3000/api/admin/sync-views \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "message": "All campaigns synced",
  "data": {
    "totalCampaigns": 5,
    "totalSynced": 12,
    "totalErrors": 2,
    "processedAt": "2024-01-15T10:30:00Z",
    "campaignResults": [...]
  }
}
```

### Manual Sync for Specific Campaign

```bash
curl -X POST http://localhost:3000/api/admin/sync-views \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "campaign_id_here"}'
```

### Creator-Initiated Sync

Creators can sync their own view counts on specific campaigns:

```bash
curl -X POST http://localhost:3000/api/campaigns/[campaignId]/sync-views \
  -H "Authorization: Bearer YOUR_CREATOR_TOKEN"
```

Response:
```json
{
  "success": true,
  "message": "Views synced successfully",
  "data": {
    "campaignId": "campaign_123",
    "creatorId": "creator_456",
    "views": 5432,
    "earnings": 27.16,
    "pending": 5.43,
    "syncedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Data Flow

### Automatic Hourly Sync
```
Cron Job (every 6 hours)
    ↓
Fetch all active campaigns
    ↓
For each campaign:
  - For each creator:
    - Check platformLinks (YouTube, etc.)
    - Fetch view count from service
    - Update earnings
    - Log results/errors
    ↓
Return sync summary
```

### Manual Creator Sync
```
Creator action (refresh button)
    ↓
API call: POST /api/campaigns/[id]/sync-views
    ↓
Authenticate creator
    ↓
Fetch platform link for creator
    ↓
Get view count from service
    ↓
Update creator earnings
    ↓
Return updated earnings to creator
```

## Configuration

### Environment Variables

```env
# Existing variables
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_API_URL=http://localhost:3000

# For background jobs (optional)
# Default schedules are in lib/server/workers/backgroundJobs.js
# Edit the cron patterns if you want different schedules
```

### Cron Job Schedules

Edit cron schedules in `lib/server/workers/backgroundJobs.js`:

- Full sync: `0 */6 * * *` (every 6 hours)
- Health check: `*/30 * * * *` (every 30 minutes)

Cron syntax: `minute hour day month day-of-week`

## Error Handling

### Sync Failures

Each failed sync is logged with:
- Creator ID
- Campaign ID
- Error message
- Timestamp

Failed syncs do NOT block other creators' syncs in the same batch.

### Recovery

- Admin can manually trigger sync for failed campaigns
- Health checks monitor sync status
- Errors are persisted to campaign creator stats

### Logging

All sync operations are logged with prefix `[YouTube Sync]`:

```
[YouTube Sync] Starting synchronized view sync at 2024-01-15T06:00:00Z
[YouTube Sync] Updated creator_123: 5432 views, $27.16 earnings
[YouTube Sync] Failed to get views for creator_456: API limit exceeded
[YouTube Sync] Completed: 12 synced, 2 errors
```

## API Response Examples

### Successful Creator Sync

```javascript
{
  "success": true,
  "message": "Views synced successfully",
  "data": {
    "campaignId": "507f1f77bcf86cd799439011",
    "creatorId": "507f1f77bcf86cd799439012",
    "views": 15420,
    "earnings": 77.10,
    "pending": 15.42,
    "syncedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

### Failed Creator Sync

```javascript
{
  "error": "No YouTube link found for creator"
}
// Status: 404
```

### Unauthorized

```javascript
{
  "error": "Unauthorized"
}
// Status: 401
```

### Admin Full Sync Result

```javascript
{
  "success": true,
  "message": "All campaigns synced",
  "data": {
    "totalCampaigns": 3,
    "totalSynced": 8,
    "totalErrors": 1,
    "processedAt": "2024-01-15T12:00:00.000Z",
    "campaignResults": [
      {
        "campaignId": "507f1f77bcf86cd799439011",
        "campaignTitle": "Hot Sauce Review Challenge",
        "success": 3,
        "failed": 0,
        "updates": [
          {
            "creatorId": "507f1f77bcf86cd799439015",
            "views": 5432,
            "earnings": 27.16
          }
        ],
        "syncedAt": "2024-01-15T12:00:00.000Z"
      }
    ]
  }
}
```

## Frontend Integration

### Add Sync Button to Creator Dashboard

```javascript
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function SyncViewsButton({ campaignId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/sync-views`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      
      // Update local state with new earnings
      console.log('Synced:', data.data);
      
      // Show success toast
      toast.success(`Views updated! New earnings: $${data.data.earnings.toFixed(2)}`);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to sync views');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={loading}
    >
      {loading ? 'Syncing...' : 'Refresh Views'}
    </Button>
  );
}
```

### Add Sync Status to Dashboard

```javascript
import { useEffect, useState } from 'react';

export function SyncStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/admin/sync-views');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p>Last sync: {status.lastSync || 'Never'}</p>
      <p>Status: {status.status}</p>
    </div>
  );
}
```

## Monitoring & Debugging

### Check Sync Status

```bash
# View app logs in production
tail -f /var/log/app.log | grep "\[YouTube Sync\]"

# Or check via API
curl http://localhost:3000/api/admin/sync-views \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Manual Sync

```bash
# Test campaign sync
curl -X POST http://localhost:3000/api/campaigns/507f1f77bcf86cd799439011/sync-views \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

### Monitor Background Jobs

Add to admin dashboard:
```javascript
import { getBackgroundJobsStatus } from '@/lib/server/workers/backgroundJobs';

export async function JobsStatus() {
  const status = getBackgroundJobsStatus();
  return (
    <div>
      <p>Background jobs: {status.totalJobs}</p>
      <p>Status: {status.initialized ? 'Running' : 'Not initialized'}</p>
    </div>
  );
}
```

## Troubleshooting

### Issue: Sync job not running

**Check:**
- Is `node-cron` installed? `npm install node-cron`
- Are environment variables set?
- Check logs for initialization errors

**Fix:**
```bash
# Reinstall dependencies
npm install

# Restart server
npm run dev
```

### Issue: YouTube API errors

**Common errors:**
- `API limit exceeded` - YouTube API quota reached
- `Invalid video ID` - Platform link format incorrect
- `Video not found` - Video deleted or private

**Fix:**
- Check platform link format in database
- Verify YouTube API credentials
- Wait for quota reset (usually daily)

### Issue: Earnings not updating

**Check:**
- Are platform links set for creators?
- Is `earningsService.js` configured?
- Check error logs for specific failure reason

**Fix:**
- Ensure creators have YouTube links
- Run manual sync: `curl -X POST /api/campaigns/[id]/sync-views`
- Check logs for specific error

## Performance Optimization

### Batch Operations
Sync operations process multiple creators efficiently:
- Groups by campaign
- Parallel API calls where possible
- Minimized database updates

### Caching
YouTube service caches recent results to avoid repeated API calls.

### Database Indexing
Ensure these indexes exist:
```javascript
// Campaign.js
campaignSchema.index({ status: 1 });
campaignSchema.index({ 'creators.creatorId': 1 });
```

## Future Enhancements

- [ ] Support for TikTok, Instagram, Twitch view counts
- [ ] Real-time webhook updates from platforms
- [ ] Advanced analytics dashboard
- [ ] Email notifications for new earnings
- [ ] Configurable sync schedules per campaign
- [ ] Sync history and audit logs
- [ ] Performance metrics dashboard

## Related Files

- [YouTube Service](lib/server/services/youtubeTrackingService.js) - View fetching logic
- [Earnings Service](lib/server/services/earningsService.js) - Earnings calculation
- [Campaign Model](models/Campaign.js) - Campaign data structure
- [User Model](models/User.js) - User/Creator data
