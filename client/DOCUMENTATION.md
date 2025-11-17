# Arseet Project Documentation

## 2025-11-06

### Feature: Backend API Integration Setup

**What was added?**
- Created API configuration with base URL (localhost:5000)
- Created API client utility for making HTTP requests
- Set up environment variables for API configuration
- Ready to start fetching data from the backend

**What does it do?**
- Provides a centralized way to make API calls to the backend
- Supports GET, POST, PUT, DELETE requests
- Handles authentication tokens automatically
- Organized endpoints by feature (auth, products, orders, user)

**How to use it:**
```tsx
import { api } from "@/lib/api"

// Example: Login
const response = await api.auth.login("email@example.com", "password")

// Example: Get all products
const products = await api.products.getAll()

// Example: Get product by ID
const product = await api.products.getById("123")

// Example: Create order
const order = await api.orders.create({ items: [...], total: 5000 })
```

**Files created:**
- `lib/api.ts` - API client and endpoint configurations
- `.env.local` - Environment variables (API URL)

**Backend URL:**
- Default: `http://localhost:5000`
- Can be changed in `.env.local` file

**Available Endpoints:**
- **Auth:** login, register, logout
- **Products:** getAll, getById, getNew, create, update, delete
- **Orders:** create, getAll, getById
- **User:** getProfile, updateProfile

**Simple terms:**
- **API:** Application Programming Interface - how frontend talks to backend
- **Endpoint:** A specific URL on the backend (like /api/products)
- **Base URL:** The main URL of your backend server
- **HTTP Methods:** 
  - GET = retrieve data
  - POST = create new data
  - PUT = update existing data
  - DELETE = remove data
- **Environment Variables:** Settings that can change based on where the app runs

**Next Steps:**
- Start using `api.auth.login()` in login page
- Start using `api.products.getAll()` to fetch products
- Replace mock data with real API calls

---

## 2025-11-05

### Feature: Reusable Notification Component with Auto-Dismiss

**What was added?**
- Created a reusable notification/toast component that can be used anywhere in the app.
- Added a test button (bell icon) in the header to test notifications.
- Notifications have animations, auto-dismiss with countdown, and can be closed manually.
- **Design:** Black and white theme matching the Arseet brand aesthetic.

**What does it do?**
- Shows a notification message at the top-right of the screen.
- Has 4 types with icons: success (✓), error (✕), info (ℹ), warning (⚠).
- All notifications use black background with white text for consistency.
- Automatically disappears after 5 seconds (customizable).
- Shows a progress bar at the bottom that counts down.
- Can be closed early by clicking the X button.
- Animates in smoothly with a slide effect.

**How to use it:**
```tsx
import { Notification } from "@/components/ui/notification"

// In your component:
const [showNotif, setShowNotif] = useState(false)

<Notification
  show={showNotif}
  type="success" // or "error", "info", "warning"
  message="Your message here!"
  duration={5000} // 5 seconds
  onClose={() => setShowNotif(false)}
/>
```

**Where to test it:**
- Click the bell icon (🔔) in the header to see random notifications.
- Each click shows a different type of notification.

**Files created/modified:**
- `components/ui/notification.tsx` - The notification component
- `components/header.tsx` - Added test button and notification demo
- `DOCUMENTATION.md` - This file

**Simple terms:**
- **Component:** A reusable piece of UI (like a building block).
- **Props:** Settings you pass to a component (like message, type, duration).
- **State:** Data that can change (like whether notification is showing).
- **Auto-dismiss:** Automatically closes after a set time.
- **Duration:** How long something lasts (in milliseconds: 5000 = 5 seconds).

---

## 2025-11-01

### Fix: Hydration Mismatch Error (Cart Badge)

**What was the problem?**
- You saw an error about "hydration failed" and "badge mismatch" in your Next.js app.
- This happens when the website looks different on the server (where it is first built) and the browser (where you use it).
- The cart badge (the number on the cart icon) was showing up only on the browser, not on the server, causing a mismatch.

**What did I do to fix it?**
- I made sure the cart badge only appears after the page loads in your browser, not on the server.
- This is done by using a small trick: a flag called `isClient` that is set to true only after the page loads in your browser.
- Now, the badge will only show up when it is safe, and the error will not happen.

**Simple explanation of terms:**
- **Render:** How the website is drawn on the screen.
- **Server:** The computer that builds the website before you see it.
- **Client:** Your browser (Chrome, Firefox, etc.) where you use the website.
- **Hydration:** The process where React makes the website interactive after it loads.
- **Mismatch:** When the server and browser show different things, causing errors.
- **Badge:** The little number on the cart icon.
- **useEffect:** A React tool that runs code after the page loads in your browser.

**Summary:**
- The cart badge now only appears after the page loads in your browser, fixing the error.
- Every future fix will be explained here in simple terms.
