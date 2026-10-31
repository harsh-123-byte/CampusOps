# 🎓 CampusOps — AI-Powered College Workflow Platform

> **"Your Campus. Smarter. Faster. Connected."**  
> One intelligent platform to simplify campus requests, automate multi-step faculty approvals, and eliminate paper bureaucracy using Google Gemini AI and MongoDB Atlas.

---

## 🌟 Key Features

### 1. 👥 Multi-Role Campus Architecture
- **Student Portal**:
  - File applications for **Bonafide Certificates, Internship NOCs, Event Approvals, Lab / HPC Access, and Facility Maintenance**.
  - Interactive multi-step form with dynamic input fields based on request category.
  - Supporting document attachments with PDF, JPG, and PNG verification.
  - Real-time **Visual Approval Pipeline Timeline**.
  - One-click resubmission for changes requested by reviewers.
  - Save as Draft or Submit directly.
- **Faculty Portal**:
  - Dedicated **Approval Inbox** filtering pending departmental submissions.
  - Complete applicant inspection with uploaded documents and verified credentials.
  - **Approve**, **Reject** (with mandatory reason), or **Request Changes** (with comments).
  - Processed application history and decision logs.
- **Admin Command Center**:
  - Institutional overview with **Recharts trends, department workloads, and status distributions**.
  - **User Management**: Create student/faculty accounts, toggle active/disabled states, assign roles securely.
  - **Department Management**: Add and manage academic departments (CSE, ECE, MECH, etc.).
  - **Master Request Registry**: Global search and filters across all college submissions.
  - **Immutable Audit Trail**: Cryptographic, timestamped log of all platform actions.

### 2. 🤖 Google Gemini AI Integration (with Resilient Offline Fallback)
- **AI Document Extraction**:
  - Parses uploaded text from offer letters and certificates to extract student names, registration numbers, dates, and validity.
  - Auto-fills the application form with a single click.
- **AI Request Classification & Pre-Screening**:
  - Classifies category, flags missing prerequisites, and assigns turnaround priority.
- **AI Student Application Copilot**:
  - Suggests formal academic justifications, checks missing items, and provides tips for approval.
- **Admin AI Insights**:
  - Analyzes aggregate workflow throughput and detects departmental bottlenecks.
- **Deterministic Rule-Based Fallback**:
  - If `GEMINI_API_KEY` is not provided or quota limits are exceeded, CampusOps seamlessly falls back to a deterministic rule engine without breaking any user workflows.

### 3. 🔒 Production Security & RBAC
- Credentials-based authentication with **bcrypt** password hashing.
- Signed **HTTP-only session cookies** verified via `jose` and Edge-compatible Next.js middleware.
- Strict role-based route protection (`/student/*`, `/faculty/*`, `/admin/*`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v20+ or v22+
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your variables:
```env
# MongoDB Connection (Local or Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/campusops

# Authentication Secret (Used for signed session cookies)
AUTH_SECRET=campusops-super-secure-production-ready-jwt-secret-key-32chars

# Google Gemini API Key (Optional: rule-based fallback active if empty)
GEMINI_API_KEY=

# Cloudinary Storage (Optional: local file storage fallback active if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed the Database
Populate real MongoDB collections with demo departments, users, sample requests, and audit logs:
```bash
npm run seed
```

### 5. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

---

## 🔑 Pre-Seeded Demo Accounts

For immediate demonstration, 1-click login buttons are provided on the login page:

| Role | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campusops.demo` | `Demo@123456` | Aiden Scott (2024CS1042), active requests in progress |
| **Faculty** | `faculty@campusops.demo` | `Demo@123456` | Prof. Marcus Thorne (CSE Dept Approver) |
| **Admin** | `admin@campusops.demo` | `Demo@123456` | Dr. Eleanor Vance (Registrar & System Administrator) |

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + SaaS Design System (Deep Navy / Indigo palette) |
| **Database** | MongoDB Atlas / Local MongoDB + Mongoose ODM |
| **Authentication** | Credentials Auth + Bcrypt + Jose JWT + HTTP-Only Cookies |
| **AI Engine** | Google Gemini API + Structured JSON schemas + Deterministic Fallback |
| **Visualizations** | Recharts (Responsive Line, Bar, and Pie Charts) |
| **Icons & Feedback** | Lucide React + Sonner Toasts |
| **File Storage** | Cloudinary with Local Disk Storage Fallback |

---

## 📡 API Endpoints Summary

### Authentication
- `POST /api/v1/auth/login` — Authenticate and issue HTTP-only cookie.
- `POST /api/v1/auth/register` — Register student or faculty member.
- `POST /api/v1/auth/logout` — Revoke session cookie.
- `GET /api/v1/auth/me` — Retrieve active session user profile.

### Requests & Workflow
- `GET /api/v1/requests` — Query requests with search, type, status, and pagination.
- `POST /api/v1/requests` — Create draft or submitted application.
- `GET /api/v1/requests/:id` — Full details, timeline, and populated documents.
- `POST /api/v1/requests/:id/submit` — Submit an existing draft.
- `POST /api/v1/requests/:id/resubmit` — Resubmit changes after faculty feedback.
- `POST /api/v1/requests/:id/cancel` — Cancel an eligible in-flight request.

### Approvals
- `POST /api/v1/approvals/approve` — Faculty approval with optional remarks.
- `POST /api/v1/approvals/reject` — Faculty rejection with **mandatory reason**.
- `POST /api/v1/approvals/request-changes` — Request changes with **mandatory feedback**.

### Artificial Intelligence
- `POST /api/v1/ai/extract` — Extract metadata from document text.
- `POST /api/v1/ai/classify` — Classify request category and detect missing data.
- `POST /api/v1/ai/assist` — Academic writing suggestions and checklist.
- `GET /api/v1/ai/insights` — Administrative bottleneck analysis.

### Administration & Audit
- `GET /api/v1/admin/analytics` — Platform metrics and Recharts datasets.
- `GET/POST/PATCH /api/v1/admin/users` — User account management.
- `GET/POST/PATCH /api/v1/admin/departments` — Academic departments.
- `GET /api/v1/admin/audit-logs` — Immutable action audit trail.

---

## 🚢 Production Build & Deployment

To verify TypeScript types and bundle the production release:
```bash
npm run build
npm start
```
CampusOps is architected for seamless deployment on **Vercel** with MongoDB Atlas.
