import axios from 'axios';

/**
 * YouTube View Tracking Service
 * Handles fetching view counts from YouTube URLs and updating campaign statistics
 */

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.youtubeApiUrl = 'https://www.googleapis.com/youtube/v3';
    this.mockMode = process.env.YOUTUBE_MOCK_MODE === 'true' || !this.apiKey;
  }

  /**
   * Extract video ID from various YouTube URL formats
   * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
   */
  extractVideoId(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      // youtube.com/watch?v=ID
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        return urlObj.searchParams.get('v');
      }
      
      // youtu.be/ID
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      
      // youtube.com/shorts/ID
      if (urlObj.pathname.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }
    } catch (error) {
      console.error('Error extracting video ID:', error);
    }
    
    return null;
  }

  /**
   * Get view count for a YouTube video
   * In production: uses YouTube Data API v3
   * In dev/mock mode: simulates realistic view counts
   */
  async getViewCount(youtubeUrl) {
    if (!youtubeUrl) {
      return { views: 0, error: 'Invalid URL' };
    }

    const videoId = this.extractVideoId(youtubeUrl);
    if (!videoId) {
      return { views: 0, error: 'Could not extract video ID' };
    }

    if (this.mockMode) {
      return this.getMockViewCount(videoId, youtubeUrl);
    }

    return this.getRealViewCount(videoId);
  }

  /**
   * Get real view count from YouTube API
   */
  async getRealViewCount(videoId) {
    try {
      if (!this.apiKey) {
        throw new Error('YouTube API key not configured');
      }

      const response = await axios.get(`${this.youtubeApiUrl}/videos`, {
        params: {
          part: 'statistics',
          id: videoId,
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (!response.data.items || response.data.items.length === 0) {
        return { views: 0, error: 'Video not found or is private' };
      }

      const viewCount = parseInt(response.data.items[0].statistics.viewCount || '0');
      return { views: viewCount, error: null };
    } catch (error) {
      console.error('YouTube API error:', error.message);
      return {
        views: 0,
        error: error.message || 'Failed to fetch view count',
      };
    }
  }

  /**
   * Get mock view count for development/testing
   * Simulates realistic view growth patterns
   */
  getMockViewCount(videoId, youtubeUrl) {
    // Create a deterministic but varying number based on video ID
    const hash = videoId.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    // Base views between 100 and 50,000
    const baseViews = Math.abs(hash % 50000) + 100;

    // Add random variation (±10% to simulate growth)
    const variation = Math.random() * 0.2 - 0.1; // -10% to +10%
    const views = Math.floor(baseViews * (1 + variation));

    return {
      views: Math.max(0, views),
      error: null,
      isMock: true,
    };
  }

  /**
   * Extract channel ID from YouTube URL (for future channel-level tracking)
   */
  extractChannelId(url) {
    if (!url) return null;

    try {
      const urlObj = new URL(url);

      // youtube.com/@channelname
      if (urlObj.pathname.startsWith('/@')) {
        return urlObj.pathname.split('/')[1];
      }

      // youtube.com/channel/CHANNELID
      if (urlObj.pathname.includes('/channel/')) {
        return urlObj.pathname.split('/channel/')[1];
      }

      // youtube.com/c/customurl
      if (urlObj.pathname.startsWith('/c/')) {
        return urlObj.pathname.split('/c/')[1];
      }
    } catch (error) {
      console.error('Error extracting channel ID:', error);
    }

    return null;
  }

  /**
   * Validate if URL is a valid YouTube URL
   */
  isValidYouTubeUrl(url) {
    try {
      const urlObj = new URL(url);
      const validHosts = [
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'www.youtu.be',
      ];
      return validHosts.includes(urlObj.hostname);
    } catch {
      return false;
    }
  }

  /**
   * Normalize YouTube URL to standard format for comparison
   */
  normalizeUrl(url) {
    if (!this.isValidYouTubeUrl(url)) return null;

    const videoId = this.extractVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return null;
  }
}

export default new YouTubeService();
