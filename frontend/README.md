# MediQueue 🏥

A real-time hospital OPD queue management system built with the MERN stack and Socket.io.

![MediQueue](https://img.shields.io/badge/MERN-Stack-teal) ![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black) ![JWT](https://img.shields.io/badge/Auth-JWT-orange)

## Live Demo
- Frontend: [mediqueue.vercel.app](https://mediqueue.vercel.app) *(coming Day 7)*
- Backend: [mediqueue-api.onrender.com](https://mediqueue-api.onrender.com) *(coming Day 7)*

---

## Problem It Solves
Patients in Indian hospitals spend hours standing in queues without knowing their position or wait time. MediQueue digitizes OPD token management — patients book tokens online, track their queue position in real-time, and get notified when their turn arrives.

---

## Features

### Patient
- Register/Login with JWT authentication
- Book a token for any department
- See live queue position and estimated wait time
- Get real-time notification when called by doctor
- View complete token history
- Cancel active token

### Doctor/Admin
- View live queue for selected department
- Call next patient with one click
- Mark consultation as started/completed
- Real-time stats (waiting, completed, cancelled, total)
- Auto-updates when new patients join

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture
mediqueue/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Auth, Token, Department logic
│   ├── middleware/      # JWT auth + role guard
│   ├── models/          # User, Token, Department schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # JWT token generator
│   └── server.js        # Express + Socket.io server
└── frontend/
└── src/
├── api/         # Axios instance with interceptors
├── components/  # Navbar, Spinner, Toast, EmptyState
├── context/     # Auth context + hooks
├── hooks/       # useSocket hook
└── pages/       # Login, Register, Dashboards
---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Protected | Get current user |

### Departments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/departments` | Admin | Create department |
| GET | `/api/departments` | Public | Get all departments |
| GET | `/api/departments/:id` | Public | Get department + queue stats |

### Tokens
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/tokens/book` | Patient | Book a token |
| GET | `/api/tokens/my` | Patient | Get my tokens |
| GET | `/api/tokens/queue/:deptId` | Doctor | Get department queue |
| PUT | `/api/tokens/:id/status` | Doctor | Update token status |
| PUT | `/api/tokens/:id/cancel` | Patient | Cancel token |

### Socket.io Events
| Event | Direction | Description |
|---|---|---|
| `join-department` | Client → Server | Join a department room |
| `new-token` | Server → Client | New patient joined queue |
| `token-status-update` | Server → Client | Token status changed |
| `token-cancelled` | Server → Client | Patient cancelled token |

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### Steps

1. Clone the repo:
```bash
git clone https://github.com/yourusername/mediqueue.git
cd mediqueue
```

2. Setup backend:
```bash
cd backend
npm install
```

Create `backend/.env`:

PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret

```bash
npm run dev
```

3. Setup frontend:
```bash
cd ../frontend
npm install
npm run dev
```

4. Open `http://localhost:5173`

### Test Credentials
| Role | Email | Password |
|---|---|---|
| Patient | patient@test.com | 123456 |
| Doctor | doctor@test.com | 123456 |
| Admin | admin@test.com | 123456 |

---


## Key Learnings
- Implemented real-time bidirectional communication using Socket.io rooms
- Built role-based access control with JWT middleware
- Designed queue management logic with atomic MongoDB operations
- Handled race conditions in token booking (duplicate token prevention)

---

## Author
**Shweta** — B.Tech IT & Network Security, NSUT Delhi

