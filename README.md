# MediQueue 🏥

A real-time hospital OPD queue management system built with the MERN stack and Socket.io.

![MERN](https://img.shields.io/badge/MERN-Stack-teal) ![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black) ![JWT](https://img.shields.io/badge/Auth-JWT-orange) ![License](https://img.shields.io/badge/License-MIT-green)

## Problem It Solves
Patients in Indian hospitals spend hours standing in queues without knowing their position or wait time. MediQueue digitizes OPD token management — patients book tokens online, track their position in real-time, and get notified instantly when their turn arrives.

---

## Features

### 🧑‍⚕️ Patient
- Register/Login with JWT authentication
- Book a token for any department instantly
- View live queue position and estimated wait time
- Get real-time notification when called by doctor
- Cancel active token anytime
- View complete token history

### 👨‍⚕️ Doctor / Admin
- View live queue for selected department
- Call next patient with one click
- Mark consultation as started / completed
- Real-time stats — waiting, completed, cancelled, total
- Queue auto-updates when new patients join

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

mediqueue/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Auth, Token, Department logic
│   ├── middleware/     # JWT auth + role guard
│   ├── models/         # User, Token, Department schemas
│   ├── routes/         # API route definitions
│   ├── utils/          # JWT token generator
│   └── server.js       # Express + Socket.io server
└── frontend/
└── src/
├── api/        # Axios instance with interceptors
├── components/ # Navbar, Spinner, Toast, EmptyState
├── context/    # Auth context
├── pages/      # Login, Register, Dashboards
└── hooks/      # useSocket hook

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
| GET | `/api/departments/:id` | Public | Get department + live stats |

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

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/mediqueue.git
cd mediqueue
```

### 2. Backend setup
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

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### Test Credentials
| Role | Email | Password |
|---|---|---|
| Patient | patient@test.com | 123456 |
| Doctor | doctor@test.com | 123456 |
| Admin | admin@test.com | 123456 |

---

## Key Technical Highlights
- Real-time bidirectional communication using **Socket.io rooms** per department
- Role-based access control with **JWT middleware** (patient / doctor / admin)
- Duplicate token prevention using MongoDB atomic queries
- Estimated wait time calculated dynamically based on queue length
- Protected routes on frontend with role-based redirection

---

## Author
**Shweta** — B.Tech IT & Network Security, NSUT Delhi


