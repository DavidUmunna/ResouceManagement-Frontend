# Resource Management App

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Modules](#modules)
5. [Authentication & Security](#authentication--security)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Development & Build](#development--build)
9. [Environment Variables](#environment-variables)
10. [Testing](#testing)

---

## 1. Introduction

The **Resource Management App** is a full-featured web platform for procurement, inventory, asset management, leave management, scheduling, supplier tracking, and more. It is built with React 18 and integrates with a Node.js/Express backend via session-authenticated REST APIs (Redis-backed sessions).

---

## 2. Project Structure

```
src/
├── App.jsx                        # Root router (public + protected routes)
├── ProtectedLayout.jsx            # Authenticated route tree under /admin/*
├── components/                    # Shared UI components
│   ├── AppLayout.jsx              # Shell layout with sidebar + navbar
│   ├── Sidebar.jsx
│   ├── navBar.jsx
│   ├── Footer/footer.jsx
│   ├── Paginationcontrols.jsx
│   ├── DeleteConfirmationModal.jsx
│   ├── CookieConsent.jsx          # Cookie accept/reject consent modal
│   ├── Pagination.jsx             # Shared pagination bar
│   ├── ReviewVerification.jsx
│   ├── SignatureModal.jsx
│   ├── Downloadstatus.jsx
│   ├── Protectedroute.jsx
│   ├── errorboundary.jsx
│   ├── logout.jsx
│   ├── usercontext.jsx
│   ├── sentry.js
│   ├── env.js
│   └── assets/
├── pages/
│   ├── Dash/                      # Main dashboard
│   ├── orders management/         # Orders/requests list, edit, export, duplicates
│   ├── CreateOrder.jsx            # Create purchase order
│   ├── inventorymanagement/       # Inventory + logs + category management
│   ├── AssetManagement/           # Asset tracking, analytics, visuals, export
│   ├── SchedulingComponents/      # Schedule manager, creator, drafts, payments
│   ├── FileTracking/              # File tracking dashboard, list, compliance log
│   ├── Tenders/                   # Tender upload, checklist, draft editor, export
│   ├── Suppliers/                 # Supplier list and add modal
│   ├── Feedback/                  # Feedback form, list, stats (with hooks/services)
│   ├── AI-tools/                  # AI compliance, lab, logistics, maintenance tools
│   ├── MDreview/                  # MD review request workflow
│   ├── skips/                     # Skip tracking, analytics, export
│   ├── Monitoring/                # System monitoring
│   ├── UserDetails/               # User profile, order history, analytics
│   ├── Leave/                     # My leave, admin panel, org-wide summary
│   ├── landinpage/                # Landing page, About Us, Subscription, legal/ (privacy, terms, cookies)
│   ├── User_list.jsx              # User management
│   ├── Usertask.jsx               # User task view
│   ├── Department_assignment.jsx  # Department assignment
│   ├── AddUserModal.jsx
│   ├── admin_login.jsx
│   ├── forgotpassword.jsx
│   ├── ResetPassword.jsx
│   └── PrivateRoute.jsx
├── services/
│   ├── OrderService.jsx
│   ├── ScheduleService.jsx
│   ├── userService.jsx
│   ├── leaveService.js            # Leave requests, balances, policy, export
│   ├── rbac_service.jsx           # Role-based access control
│   ├── aiService.js
│   └── tenderService.js
├── js/
│   ├── actions/actions.js
│   ├── constants/action-types.js
│   ├── reducer/rootreducer.js
│   └── store/store.js
├── skeletons/                     # Loading skeleton components
├── firebaseConfig.js              # Firebase push notification config
├── firebase-messaging-sw.js       # Firebase service worker
├── index.js / index.jsx
├── index.css
└── App.css
```

---

## 3. Tech Stack

| Category | Libraries |
|---|---|
| UI Framework | React 18, React Router v7 |
| State Management | Redux 5, Redux Toolkit, React Query |
| Styling | Tailwind CSS v2 (`@tailwindcss/postcss7-compat`), Framer Motion |
| Charts | Chart.js, Recharts |
| HTTP | Axios |
| Error Tracking | Sentry (`@sentry/react`) |
| Push Notifications | Firebase v12 |
| Forms / UI | React Hot Toast, React Toastify, Headless UI, Heroicons, Lucide React |
| Signatures | react-signature-canvas |
| Testing | Jest, React Testing Library, Cypress |
| Build | Create React App (react-scripts) |

---

## 4. Modules

### Public Routes
- **Landing Page** (`/`) — marketing page with hero, stats, features, "how it works", and a cookie-consent modal
- **About Us** (`/aboutus`)
- **Legal** (`/privacy`, `/terms`, `/cookies`) — Privacy Policy, Terms of Service, Cookie Policy
- **Company Data** (`/companydata`) — organisation onboarding form
- **Subscription** (`/subscription`) — subscription plan selection
- **Login** (`/adminlogin`) — session-based authentication
- **Forgot / Reset Password** (`/forgotpassword`, `/reset-password`)

### Protected Routes (under `/admin/*`)
All routes require authentication. Unauthenticated requests redirect to `/adminlogin`.

| Route | Module |
|---|---|
| `/admin/dashboard` | Main dashboard with KPIs |
| `/admin/requestlist` | Orders/requests management — view, approve, edit, delete, export |
| `/admin/createorder` | Create a new purchase order |
| `/admin/inventorymanagement` | Inventory management with categories |
| `/admin/inventorylogs` | Inventory change logs, Excel/print export |
| `/admin/leave` | My leave — request leave, view balance and request history |
| `/admin/leave-admin` | Leave admin — approve, reject, cancel, or delete requests; edit entitlements (admin / global_admin / HR) |
| `/admin/leave-summary` | Org-wide read-only leave summary (Director / global_admin) |
| `/admin/po-analytics` | Purchase-order spend analytics (global_admin, Director, Finance, etc.) |
| `/admin/assetsmanagement` | Asset tracking, analytics, visualisations |
| `/admin/schedules` | Draft schedules |
| `/admin/schedules/:id/edit` | Edit a schedule |
| `/admin/schedulemanager` | Schedule manager (submitted schedules, payments) |
| `/admin/filetracking` | File tracking — dashboard, list, compliance log |
| `/admin/tenders` | Tender management — upload, checklist, draft, export |
| `/admin/supplierlist` | Supplier list |
| `/admin/feedback` | Feedback submission and review |
| `/admin/ai-tools` | AI tools — compliance report, lab interpretation, logistics, predictive maintenance |
| `/admin/skipstracking` | Skip tracking with moving average analytics |
| `/admin/monitoring` | System monitoring |
| `/admin/users` | User management |
| `/admin/usertasks` | Tasks assigned to a user |
| `/admin/departmentassignment` | Department assignment |

---

## 5. Authentication & Security

- **Sessions**: a `sessionId` cookie is validated on the backend against a Redis-backed session store via the `check-auth` middleware. The session holds the user's `userId`, `email`, `role`, `Department`, `canApprove`, etc.
- **CSRF**: the token is fetched from `/api/csrf-token` on app load ([App.jsx](src/App.jsx)) and stored in a non-httpOnly `XSRF-TOKEN` cookie. Axios auto-attaches it as the `X-XSRF-TOKEN` header on state-mutating requests (with `withCredentials: true`); the backend validates it with `csurf`.
- **Session polling**: `App.jsx` calls `/api/access` every 15 minutes to keep session state fresh and log the user out if the session expires.
- **RBAC**: `services/rbac_service.jsx` fetches role/department access lists; `constants/roles.js` maps routes to allowed roles for both route guards and sidebar visibility.
- **Error tracking**: Sentry captures exceptions in production (`isProd` flag).

---

## 6. State Management

- **Redux** (via Redux Toolkit) manages global state: search results, order filters, and other cross-cutting state.
- **React Query** handles server state (fetching, caching, refetching) for individual modules.
- **React Context** (`usercontext.jsx`) provides the authenticated user's profile (name, role) throughout the component tree.

Redux structure:
- `js/actions/actions.js` — action creators (e.g. `searchbyname`)
- `js/reducer/rootreducer.js` — root reducer
- `js/store/store.js` — configured store with Redux Logger

---

## 7. API Integration

Base URL configured via `REACT_APP_API_URL`.

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Authenticate user, establish a Redis session (`sessionId` cookie) |
| `GET` | `/api/access` | Check session validity |
| `GET` | `/api/csrf-token` | Fetch CSRF token |
| `GET` | `/api/orders` | Fetch all orders |
| `POST` | `/api/orders` | Create order |
| `PUT` | `/api/orders/:id/approve` | Approve order |
| `DELETE` | `/api/orders/:id` | Delete order |
| `POST` | `/api/users` | Add new user |

Module-specific services in `src/services/` wrap axios calls for orders, schedules, users, AI tools, and tenders.

---

## 8. Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm start

# Production build
npm run build

# Deploy to GitHub Pages
npm run deploy

# Generate JSDoc documentation
npm run docs
```

> **Note:** The start and build scripts use `--openssl-legacy-provider` for Node.js v17+ compatibility.

---

## 9. Environment Variables

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL for the backend API |

---

## 10. Testing

```bash
# Unit / integration tests (Jest + React Testing Library)
npm test

# End-to-end tests (Cypress)
npx cypress open
```

Key test files:
- `src/App.test.js` — main app tests
- `src/components/__tests__/AppLayout.test.jsx` — AppLayout tests
- `src/setupTests.js` — Jest environment setup
- `cypress/` — Cypress E2E specs
