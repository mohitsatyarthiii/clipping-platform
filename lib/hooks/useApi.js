import { useState, useCallback, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

// Simple cache for fetch requests
const fetchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url, options) => {
  return `${url}:${JSON.stringify(options || {})}`;
};

const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(url ? true : false);
  const [error, setError] = useState(null);
  const cacheKeyRef = useRef(url ? getCacheKey(url, options) : null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url || !isMountedRef.current) return;
    
    try {
      // Check cache first
      const cacheKey = getCacheKey(url, options);
      const cached = fetchCache.get(cacheKey);
      
      if (cached && isCacheValid(cached.timestamp)) {
        if (isMountedRef.current) {
          setData(cached.data);
          setError(null);
          setLoading(false);
        }
        return;
      }

      if (isMountedRef.current) {
        setLoading(true);
      }

      const response = await api.get(url, options);
      const responseData = response.data.data || response.data;
      
      // Store in cache
      fetchCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      });
      
      if (isMountedRef.current) {
        setData(responseData);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'An error occurred');
        setData(null);
        setLoading(false);
      }
    }
  }, [url, options]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [url, options, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const usePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const post = useCallback(async (url, payload) => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      const response = await api.post(url, payload);
      
      if (isMountedRef.current) {
        toast.success(response.data?.message || 'Success');
        setError(null);
        setLoading(false);
        
        // Clear cache on mutation
        fetchCache.clear();
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred';
      if (isMountedRef.current) {
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
      }
      throw err;
    }
  }, []);

  return { post, loading, error };
};

export const usePut = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const put = useCallback(async (url, payload) => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      const response = await api.put(url, payload);
      
      if (isMountedRef.current) {
        toast.success(response.data?.message || 'Success');
        setError(null);
        setLoading(false);
        
        // Clear cache on mutation
        fetchCache.clear();
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred';
      if (isMountedRef.current) {
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
      }
      throw err;
    }
  }, []);

  return { put, loading, error };
};

export const useDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const del = useCallback(async (url) => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      const response = await api.delete(url);
      
      if (isMountedRef.current) {
        toast.success(response.data?.message || 'Deleted successfully');
        setError(null);
        setLoading(false);
        
        // Clear cache on deletion
        fetchCache.clear();
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred';
      if (isMountedRef.current) {
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
      }
      throw err;
    }
  }, []);

  return { delete: del, loading, error };
};
