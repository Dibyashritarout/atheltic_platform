# 🏃 AthletesBridge — Full Stack Platform

Connecting rural athletes with sports opportunities and scholarships.

## 📁 Project Structure

```
athletes-platform/
├── backend/                  # Node.js + Express + MongoDB
│   ├── models/
│   │   ├── User.js
│   │   ├── Athlete.js
│   │   ├── Performance.js
│   │   └── Opportunity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── athletes.js
│   │   └── opportunities.js
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── uploads/              # Auto-created for file uploads
│   ├── server.js
│   ├── .env                  # Your config (copy from .env.example)
│   └── package.json
│
├── frontend/                 # React 18 + React Router v6
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js / .css
│   │   │   ├── AthleteCard.js
│   │   │   ├── OpportunityCard.js
│   │   │   └── Cards.css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js / .css
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Auth.css
│   │   │   ├── Athletes.js
│   │   │   ├── AthleteProfile.js / .css
│   │   │   ├── AddAthlete.js
│   │   │   ├── AddPerformance.js
│   │   │   ├── Opportunities.js
│   │   │   ├── AddOpportunity.js
│   │   │   ├── Leaderboard.js / .css
│   │   │   └── Dashboard.js / .css
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── README.md
└── start.sh                  # One-command startup script
```

---

## 🚀 Quick Setup

### Prerequisites
- **Node.js** v14 or higher
- **MongoDB** running locally on port 27017  
  (or use MongoDB Atlas — update `MONGODB_URI` in backend `.env`)
- **npm** installed

---

### Option 1 — One Command (Linux / macOS)

```bash
chmod +x start.sh
./start.sh
```

This installs dependencies for both frontend and backend and starts both servers.

---

### Option 2 — Manual Setup

#### Step 1 — Backend

```bash
cd backend
npm install
# Edit .env if needed (MongoDB URI, PORT, JWT_SECRET)
npm run dev
```

Backend runs at: **http://localhost:5001**

#### Step 2 — Frontend (new terminal)

```bash
cd frontend
npm install
npm start
```

Frontend opens at: **http://localhost:3000**

---

## ⚙️ Environment Variables

Edit `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/athletes-platform
PORT=5001
NODE_ENV=development
JWT_SECRET=change-this-to-something-secret
```

For **MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/athletes-platform
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user (auth required) |

### Athletes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/athletes` | List all (supports `?search=&sport=&isRural=true`) |
| POST | `/api/athletes` | Create athlete (auth required) |
| GET | `/api/athletes/:id` | Get athlete by ID |
| PUT | `/api/athletes/:id` | Update athlete (auth required) |
| DELETE | `/api/athletes/:id` | Delete athlete (auth required) |
| POST | `/api/athletes/:id/performance` | Add performance (auth required) |
| GET | `/api/athletes/:id/performance` | Get performance history |
| GET | `/api/athletes/leaderboard/top` | Top performers (aggregated) |

### Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opportunities` | List all (supports `?search=&sport=`) |
| POST | `/api/opportunities` | Create opportunity (auth required) |
| GET | `/api/opportunities/:id` | Get by ID |
| PUT | `/api/opportunities/:id` | Update (auth required) |
| DELETE | `/api/opportunities/:id` | Delete (auth required) |
| GET | `/api/opportunities/:id/matches` | Get matched rural athletes |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image/video (max 100MB) |

---

## 🗄️ Data Models

### User
```json
{ "name": "string", "email": "string", "password": "hashed", "role": "athlete|organization|admin" }
```

### Athlete
```json
{ "name", "email", "phone", "age", "state", "city", "sports": [], "isRural": true, "bio", "profileImage" }
```

### Performance
```json
{ "athlete": "ref", "jumpHeight": "cm", "jumpLength": "m", "runningDistance": "m", "runningTime": "s", "runningSpeed": "km/h", "videoUrl", "notes", "sport" }
```

### Opportunity
```json
{ "title", "description", "organization", "location", "sport", "requirements", "deadline", "stipend", "applicationLink", "matchedAthletes": [], "isActive": true }
```

---

## 🌐 Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Home / Landing | No |
| `/register` | Create account | No |
| `/login` | Sign in | No |
| `/athletes` | Browse athletes | No |
| `/athletes/:id` | Athlete profile | No |
| `/opportunities` | Browse opportunities | No |
| `/leaderboard` | Top performers | No |
| `/dashboard` | User dashboard | ✅ Yes |
| `/add-athlete` | Create athlete profile | ✅ Yes |
| `/add-opportunity` | Post opportunity | ✅ Yes |
| `/athletes/:id/add-performance` | Log performance | ✅ Yes |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, CSS3 |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer (local disk, 100MB limit) |
| Fonts | Bebas Neue + DM Sans (Google Fonts) |

---

## 📝 Notes

- JWT tokens expire in 7 days
- Uploaded files are stored in `backend/uploads/` folder
- The leaderboard aggregates best performances per athlete
- Rural athletes are prioritized in opportunity matching
- All protected routes require `Authorization: Bearer <token>` header (handled automatically by AuthContext)

---

*Capstone Project — AthletesBridge*
