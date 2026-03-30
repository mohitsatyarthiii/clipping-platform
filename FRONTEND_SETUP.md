# 🎨 Frontend Setup Guide

This is a complete, production-grade frontend for the Clipping Platform built with Next.js, React, Tailwind CSS, and shadcn/ui components.

## 🎯 Features

### Pages Included
- ✅ **Authentication**: Login, Register, Forgot Password, Reset Password
- ✅ **Homepage**: Modern landing page with features and CTA
- ✅ **Admin Dashboard**: Overview, campaigns management, join requests, submissions, users
- ✅ **Creator Dashboard**: Source content management, performance metrics
- ✅ **Clipper Dashboard**: Campaign browsing, clip submissions, earnings tracking
- ✅ **Profile**: Account settings, password change, logout

### UI Components
- **Button** - Multiple variants (default, outline, ghost, secondary, destructive)
- **Input** - Form input with error handling
- **Textarea** - Multi-line text input
- **Card** - Container component with glassmorphism
- **Badge** - Status badges with variants
- **Skeleton** - Loading placeholders
- **Modal** - Dialog component
- **Tabs** - Tabbed navigation
- **Navbar** - Top navigation with user menu
- **Sidebar** - Role-based sidebar navigation
- **DashboardLayout** - Combined layout for authenticated pages

### Styling
- **Dark Theme**: Pure black background (#0a0a0a)
- **Neon Accents**: Purple (#7c3aed) and Cyan (#06b6d4) gradients
- **Glassmorphism**: Blur effects and transparency
- **Smooth Animations**: Framer Motion for transitions
- **Responsive Design**: Mobile-first approach

## 📦 Installation

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

### 3. Update API URL

In `.env.local`, ensure:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Or for production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## 🚀 Running the Project

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
app/
├── layout.js                    # Root layout with providers
├── page.js                      # Homepage
├── login/page.js               # Login page
├── register/page.js            # Registration page
├── forgot-password/page.js     # Forgot password page
├── reset-password/page.js      # Reset password page
├── profile/page.js             # User profile/settings
├── api/                        # Backend API routes (existing)
└── dashboard/
    ├── admin/
    │   ├── page.js            # Admin overview
    │   ├── campaigns/page.js   # Manage campaigns
    │   ├── join-requests/page. # Review join requests
    │   └── submissions/page.js # Review submissions
    ├── creator/
    │   └── page .js           # Creator overview & source content
    └── clipper/
        ├── page.js            # Clipper overview
        ├── campaigns/page.js   # Browse campaigns
        └── submit/page.js      # Submit clip

components/
├── ui/
│   ├── Button.js              # Button component
│   ├── Input.js               # Form input
│   ├── Textarea.js            # Textarea input
│   ├── Card.js                # Card container
│   ├── Badge.js               # Status badge
│   ├── Skeleton.js            # Loading skeleton
│   ├── Modal.js               # Dialog/modal
│   └── Tabs.js                # Tab navigation
├── Navbar.js                  # Top navigation
├── Sidebar.js                 # Sidebar navigation
└── DashboardLayout.js         # Dashboard layout wrapper

lib/
├── api.js                     # Axios instance with interceptors
├── storage.js                 # Auth token & user data storage
├── stores/
│   ├── authStore.js          # Auth state (Zustand)
│   └── notificationStore.js  # Notifications state
├── hooks/
│   ├── useApi.js             # API call hooks (useFetch, usePost, usePut)
│   └── useProtectedRoute.js  # Route protection hook
└── helpers.js                # Utility functions
```

## 🔐 Authentication Flow

1. **Register**: User fills form → API creates account → Token saved to cookies
2. **Login**: User enters credentials → API returns token → Redirected to dashboard
3. **Session**: Token sent in `Authorization: Bearer` header on every API call
4. **Logout**: Token removed, user redirected to login
5. **Protected Routes**: `useProtectedRoute()` hook checks auth status

## 🎨 Theming

The frontend uses:
- **Tailwind CSS** for styling
- **Dark mode forced** (always on)
- **CSS variables** in `app/globals.css` for theme colors
- **Neon effects** with glows and shadows

To modify colors, edit `tailwind.config.js` or `app/globals.css`:

```css
--background: 7 2% 5%;        /* Pure black */
--primary: 270 100% 58%;      /* Purple */
--secondary: 180 100% 50%;    /* Cyan */
```

## 🔌 API Integration

All API calls use the axios instance in `lib/api.js`:

```javascript
import api from '@/lib/api';

// GET request
const response = await api.get('/campaigns');

// POST request
const response = await api.post('/auth/login', { email, password });

// PUT request  
const response = await api.put('/profile/update', { name: 'New Name' });
```

**Automatic Features:**
- ✅ Token injection in headers
- ✅ Error handling and toast notifications
- ✅ 401 redirects to login
- ✅ Response interceptors

## 🧠 State Management

### Using Zustand Stores

```javascript
import { useAuthStore } from '@/lib/stores/authStore';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
```

### Available Stores
- **authStore**: User auth, profile, password changes
- **notificationStore**: Notifications management

## 🪝 Custom Hooks

### useFetch
```javascript
const { data, loading, error, refetch } = useFetch('/campaigns');
```

### usePost
```javascript
const { post, loading, error } = usePost();
await post('/campaigns', { title: 'New Campaign' });
```

### usePut
```javascript
const { put, loading, error } = usePut();
await put('/campaigns/123', { title: 'Updated' });
```

### useProtectedRoute
```javascript
// Protect route and require specific role
useProtectedRoute('admin');  // Only for admins
useProtectedRoute('creator'); // Only for creators
useProtectedRoute();          // Any authenticated user
```

## 🎯 Role-Based Access

The frontend automatically:
- ✅ Redirects to appropriate dashboard after login
- ✅ Shows role-specific sidebar items
- ✅ Protects pages with `useProtectedRoute()`

Roles:
- **admin**: Full platform control, manage campaigns & submissions
- **creator**: Upload source content, view performance
- **clipper**: Browse campaigns, submit clips, track earnings

## 📱 Responsive Design

- Mobile-first CSS with Tailwind
- Works on all screen sizes
- Touch-friendly buttons and inputs
- Mobile menu for navigation

## 🚧 Extending the Frontend

### Adding a New Page

1. Create file: `app/new-page/page.js`
2. Use `DashboardLayout` if it's inside dashboard
3. Import hooks and components
4. Fetch data with `useFetch()`
5. Handle loading/error states

```javascript
'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';

export default function NewPage() {
  const { data, loading } = useFetch('/api-endpoint');

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          Page Title
        </h1>
        {loading ? <p>Loading...</p> : <Card>{data}</Card>}
      </div>
    </DashboardLayout>
  );
}
```

### Adding a New Component

1. Create: `components/MyComponent.js`
2. Use UI components from `components/ui/`
3. Import and use in pages

```javascript
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function MyComponent() {
  return (
    <Card>
      <h2 className="text-xl font-bold">Component Title</h2>
      <Button>Click Me</Button>
    </Card>
  );
}
```

## 🐛 Debugging

1. **Check Console**: Browser DevTools (F12)
2. **Network Requests**: Inspect API calls
3. **Auth Issues**: Check `console.log()` in `lib/api.js`
4. **Component Issues**: Add `console.log()` inside components

## ⚡ Performance Tips

- Use `useFetch()` to avoid duplicate requests
- Memoize heavy components with `React.memo()`
- Lazy load pages with `next/dynamic`
- Use `Skeleton` components for better UX
- Optimize images with `next/image`

## 🔐 Security Measures

- ✅ Tokens stored in HTTP-only cookies
- ✅ CSRF protection via same-site cookies
- ✅ Password validation on frontend and backend
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes

## 📚 Component Examples

### Loading a List

```javascript
import Skeleton from '@/components/ui/Skeleton';

function List({ items, loading }) {
  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
    </div>
  }

  return (
    <div className="space-y-3">
      {items.map(item => <Card key={item._id}>{item.name}</Card>)}
    </div>
  );
}
```

### Confirm Dialog

```javascript
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
  actions={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure? This cannot be undone.</p>
</Modal>
```

## 🎓 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com/)

## 📞 Support

For issues or questions:
1. Check the inline code comments
2. Review the API documentation in `API_DOCUMENTATION.md`
3. Check backend errors in server logs
