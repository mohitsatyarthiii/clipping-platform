import Cookies from 'js-cookie';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_ROLE_KEY = 'user_role';
const USER_DATA_KEY = 'user_data';

export const storage = {
  // Token management
  getToken: () => Cookies.get(AUTH_TOKEN_KEY),
  setToken: (token) => Cookies.set(AUTH_TOKEN_KEY, token, { expires: 7 }),
  removeToken: () => Cookies.remove(AUTH_TOKEN_KEY),

  // Role management
  getRole: () => Cookies.get(USER_ROLE_KEY),
  setRole: (role) => Cookies.set(USER_ROLE_KEY, role, { expires: 7 }),
  removeRole: () => Cookies.remove(USER_ROLE_KEY),

  // User data (localStorage for larger data)
  getUserData: () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUserData: (data) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  },
  removeUserData: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_DATA_KEY);
  },

  // Clear all
  clear: () => {
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(USER_ROLE_KEY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_DATA_KEY);
    }
  },
};

export const isAuthenticated = () => !!storage.getToken();
export const isAdmin = () => storage.getRole() === 'admin';
export const isCreator = () => storage.getRole() === 'creator';
export const isBrand = () => storage.getRole() === 'brand';
