export const apiResponse = (success, message, data = null, status = 200) => {
  return Response.json(
    {
      success,
      message,
      ...(data && { data }),
    },
    { status }
  );
};

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const calculatePagination = (page, limit, total) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (p - 1) * l;
  const pages = Math.ceil(total / l);

  return { page: p, limit: l, skip, pages, total };
};

export const getFilterQuery = (filters) => {
  const query = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    if (typeof value === 'string') {
      query[key] = { $regex: value, $options: 'i' };
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      query[key] = value;
    } else if (Array.isArray(value)) {
      query[key] = { $in: value };
    } else if (typeof value === 'object' && value.$gte) {
      // Range query
      query[key] = value;
    }
  }

  return query;
};

export const formatDate = (date) => {
  return new Date(date).toISOString();
};

export const calculateDaysSince = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffTime = Math.abs(now - then);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getClientIp = (req) => {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retryAsync = async (fn, retries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await sleep(delay * Math.pow(2, i));
      }
    }
  }

  throw lastError;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const excludeFields = (obj, fields) => {
  const clone = deepClone(obj);
  fields.forEach((field) => {
    delete clone[field];
  });
  return clone;
};

export const pickFields = (obj, fields) => {
  const picked = {};
  fields.forEach((field) => {
    if (field in obj) {
      picked[field] = obj[field];
    }
  });
  return picked;
};
