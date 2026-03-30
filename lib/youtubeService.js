import axios from 'axios';

const YOUTUBE_API_BASE = process.env.YOUTUBE_API_BASE;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export const getVideoViews = async (videoId) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        id: videoId,
        part: 'statistics',
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const stats = response.data.items[0].statistics;
    return {
      views: parseInt(stats.viewCount || 0),
      likes: parseInt(stats.likeCount || 0),
      comments: parseInt(stats.commentCount || 0),
    };
  } catch (error) {
    console.error('YouTube API error:', error.message);
    throw error;
  }
};

export const getVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        id: videoId,
        part: 'snippet,statistics,contentDetails',
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;

    return {
      videoId,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails.high.url,
      duration: video.contentDetails.duration,
      views: parseInt(stats.viewCount || 0),
      likes: parseInt(stats.likeCount || 0),
      comments: parseInt(stats.commentCount || 0),
      publishedAt: snippet.publishedAt,
    };
  } catch (error) {
    console.error('YouTube API error:', error.message);
    throw error;
  }
};

export const searchVideos = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults,
        key: YOUTUBE_API_KEY,
        order: 'relevance',
      },
      timeout: 10000,
    });

    return response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('YouTube API error:', error.message);
    throw error;
  }
};

export const validateVideoId = async (videoId) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        id: videoId,
        part: 'id',
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    return response.data.items && response.data.items.length > 0;
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return false;
  }
};

export const getChannelInfo = async (channelId) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        id: channelId,
        part: 'snippet,statistics',
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = response.data.items[0];
    return {
      channelId,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.default.url,
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount,
      viewCount: channel.statistics.viewCount,
    };
  } catch (error) {
    console.error('YouTube API error:', error.message);
    throw error;
  }
};

export const checkYoutubeApiKey = async () => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        id: 'dQw4w9WgXcQ',
        part: 'id',
        key: YOUTUBE_API_KEY,
      },
      timeout: 5000,
    });

    return !!response.data.items;
  } catch (error) {
    console.error('YouTube API key check failed:', error.message);
    return false;
  }
};
