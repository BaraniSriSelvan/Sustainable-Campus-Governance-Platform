# 🌱 Sustainable Campus Governance Platform

A full-stack web application for academic institutions to monitor and manage sustainability practices — energy, water, waste, events, and student feedback.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + React Bootstrap |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| Icons | Bootstrap Icons |

---

## 📁 Project Structure

```
sustainable-campus/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Sustainability.js
│   │   ├── Event.js
│   │   └── Feedback.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sustainability.js
│   │   ├── events.js
│   │   └── feedback.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ScoreRing.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── AdminLogin.js
    │   │   ├── StudentLogin.js
    │   │   ├── StudentRegister.js
    │   │   ├── AdminDashboard.js
    │   │   └── StudentDashboard.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### 1. Clone / Extract the project
```bash
cd sustainable-campus
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Edit `.env` if needed:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sustainable_campus
JWT_SECRET=sustainable_campus_jwt_secret_key_2024
```

Start backend:
```bash
npm start
# or for development:
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 🔐 Default Credentials

### Admin Account (pre-seeded)
| Field | Value |
|-------|-------|
| Email | admin@campus.edu |
| Password | admin123 |

> Admin accounts are pre-created in the database. Students can self-register.

---

## 📊 Score Formulas

```
Energy Score = (1 - energyCurrent / energyMax) × 100
Water Score  = (1 - waterCurrent / waterMax) × 100
Waste Score  = (wasteRecycled / wasteTotal) × 100
Overall      = (energyScore + waterScore + wasteScore) / 3
```

---

## 🗺️ Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Home (role selection) | Public |
| `/admin/login` | Admin Login | Public |
| `/student/login` | Student Login | Public |
| `/student/register` | Student Register | Public |
| `/admin/dashboard` | Admin Dashboard | Admin only |
| `/student/dashboard` | Student Dashboard | Student only |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login (admin or student) |

### Sustainability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sustainability` | Get all records |
| GET | `/api/sustainability/latest` | Get latest entry |
| POST | `/api/sustainability` | Add new data (admin) |
| DELETE | `/api/sustainability/:id` | Delete record (admin) |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create event (admin) |
| PUT | `/api/events/:id` | Update event (admin) |
| DELETE | `/api/events/:id` | Delete event (admin) |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedback` | Get all feedback (admin) |
| POST | `/api/feedback` | Submit feedback (student) |
| DELETE | `/api/feedback/:id` | Delete feedback (admin) |

---

## ✨ Features

### Admin Dashboard
- 📊 View real-time sustainability scores with animated ring charts
- ➕ Add energy/water/waste data with live score preview
- 📈 Historical trend line chart (Recharts)
- 📅 Create, edit, and delete sustainability events
- 💬 View and manage student feedback
- 🗄️ Full records table with score badges

### Student Dashboard
- 🌍 View campus sustainability scores
- 🕸️ Radar chart overview of all metrics
- 📋 Detailed metric breakdown with progress bars
- 📅 Browse sustainability events
- 💌 Submit feedback with suggestion prompts

---

## 🎨 Design

- **Font**: Syne (headings) + DM Sans (body)
- **Theme**: Earthy forest green with amber accents
- **Framework**: React Bootstrap (no Tailwind)
- **Responsive**: Mobile-friendly layout
