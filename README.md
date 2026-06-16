# 🩸 Blood Donor Finder

A platform that connects blood donors with hospitals in real time.

## What It Does

- Hospitals post emergency blood requests
- Nearby donors get notified instantly
- Donors can respond and confirm donation
- Admin approves hospitals before they can use the platform

## Features

- 🔴 Real-time notifications to nearby donors
- 📍 Location-based donor matching
- 🏥 Three roles: Donor, Hospital, Admin
- 🩺 Health check before a donor can accept a request
- ⏳ 90-day wait period enforced after each donation
- 📧 Email alerts with Google Maps link
- 🔐 Secure login with JWT

## Tech Used

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Real-time:** Socket.io
- **Email:** Nodemailer (Gmail)

## How to Run

### Backend
```bash
cd backend
npm install
npm start
```

Create a `.env` file inside `/backend`:

```
MONGO_URI=mongodb://localhost:27017/blooddonor
JWT_SECRET=your_secret_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
PORT=5000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## User Roles

| Role     | What They Can Do                                      |
|----------|-------------------------------------------------------|
| Donor    | View requests, respond, mark donation done            |
| Hospital | Post blood requests, confirm donations                |
| Admin    | Approve hospitals, view all donors and requests       |


## Author
Lakshitha R E
https://github.com/Lakshitha-R-E
