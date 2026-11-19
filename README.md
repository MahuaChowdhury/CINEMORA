# 🎬 CINEMORA – Movie Streaming Platform

**CINEMORA** is a Netflix-inspired movie streaming web application developed using the **MEAN Stack (MongoDB, Express.js, Angular and Node.js)**. It provides an interactive movie-browsing and streaming experience, enhanced with an AI-powered chatbot named **MORA** and a real-time communication system.

The project combines modern frontend design, backend API development, database management, AI integration and real-time messaging into a single web application.

---

## ✨ Key Features

### 🎥 Movie Streaming Platform
- Interactive homepage with featured and trending movies.
- Browse movies by genre and category.
- Live movie search.
- Detailed movie information and video player.
- Personal watchlist through the My List feature.

### 🤖 MORA – AI Chat Assistant
- Integrated chatbot for conversational assistance.
- Helps users with movie-related queries.
- Interactive chat interface within CINEMORA.

### 💬 Real-Time Communication
- Real-time user-to-user chat conversations.
- Socket.IO integration for instant messaging.
- Dedicated chat interface.

### 🔐 Authentication & User Management
- User registration and login.
- Email-based OTP verification.
- Secure password hashing.
- JWT-based authentication.
- OTP resend and verification functionality.

### 🛠️ Admin Dashboard
- Dedicated administrative interface.
- Movie management functionality.
- Administrative access and protected operations.

### 📱 User Interface
- Responsive and interactive Angular frontend.
- PrimeNG UI components.
- Header navigation and drawer sidebar.
- Modern dark-themed streaming interface.

---

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Angular 22, TypeScript, SCSS |
| UI Components | PrimeNG, PrimeIcons |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-Time Communication | Socket.IO |
| Email Services | Nodemailer, Gmail SMTP |
| AI Integration | MORA Chatbot |

---

## 📸 Application Screenshots

The following screenshots showcase the major modules of CINEMORA.

| Module | Screenshot |
|---|---|
| Homepage | `screenshots/home.png` |
| Movie Details | `screenshots/movie-details.png` |
| MORA Chatbot | `screenshots/mora-chatbot.png` |
| Real-Time Chat | `screenshots/realtime-chat.png` |
| Admin Dashboard | `screenshots/admin-dashboard.png` |

---

## 📂 Project Structure

```text
CINEMORA/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── public/
│
├── src/
│   └── app/
│       ├── guards/
│       ├── layout/
│       ├── pages/
│       ├── services/
│       └── shared/
│
├── screenshots/
│
├── CINEMORA_Project_Presentation.pdf
├── CINEMORA_Project_Presentation.pptx
├── package.json
├── angular.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 20.19+ / 22.12+ / 24.x
- npm
- MongoDB (local installation or MongoDB Atlas)
- Gmail account with 2-Step Verification and an App Password for OTP emails.

### 1. Clone the Repository

```bash
git clone https://github.com/MahuaChowdhury/CINEMORA.git
cd CINEMORA
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder using `.env.example` as a reference.

Configure the following environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SMTP_EMAIL=your_gmail_address
SMTP_APP_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### 3. Seed Demo Data (Optional)

```bash
npm run seed
```

This initializes the demo movie collection and admin account. **Warning:** The seed script wipes and recreates demo movies. Use only with a suitable development database.

### 4. Start the Backend

```bash
npm run dev
```

Backend API:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

### 5. Frontend Setup

Open another terminal from the project root:

```bash
npm install
npm start
```

Open the application:

`http://localhost:4200`

---

## 🔑 Authentication Flow

1. User registers with the required details.
2. An OTP is sent to the registered email address.
3. User verifies the OTP.
4. User logs in to CINEMORA.
5. Authenticated users can access their personalized features, including My List.

OTP verification uses bcrypt hashing, a 5-minute validity period, a maximum of 5 verification attempts and a 60-second resend cooldown.

---

## 🔌 API Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Backend health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/verify-otp` | POST | OTP verification |
| `/api/auth/resend-otp` | POST | Resend OTP |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Retrieve current user |
| `/api/movies` | GET | Retrieve and search movies |
| `/api/movies/:id` | GET | Retrieve movie details |
| `/api/movies` | POST | Add a movie (Admin) |
| `/api/movies/:id` | PUT / DELETE | Update or delete a movie (Admin) |
| `/api/watchlist` | GET | Retrieve watchlist |
| `/api/watchlist/:id` | POST / DELETE | Manage watchlist |

---

## 📄 Project Documentation

The project presentation is available in both formats:

- [CINEMORA Project Presentation (PDF)](CINEMORA_Project_Presentation.pdf)
- [CINEMORA Project Presentation (PPTX)](CINEMORA_Project_Presentation.pptx)

---

## 🔒 Security Notes

- Never upload `.env` files or expose API credentials.
- Use your own MongoDB connection string and Gmail App Password.
- Keep JWT secrets private.
- The `.env.example` file contains configuration placeholders.

---

## 👩‍💻 Developed By

**Mahua Chowdhury**

GitHub: [MahuaChowdhury](https://github.com/MahuaChowdhury)

**Project:** CINEMORA – Movie Streaming Platform  
**Technology:** MEAN Stack  
**Repository:** [github.com/MahuaChowdhury/CINEMORA](https://github.com/MahuaChowdhury/CINEMORA)

---

*Built as a full-stack development project to explore modern web technologies, AI-assisted interaction and real-time communication.*