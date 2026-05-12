# 🖥️ How to Run the Hybrid Ephemeral Messenger

This guide will walk you through setting up and running the application locally.

## Prerequisites

You need to have installed:
- **Bun** (v1.0+) - https://bun.sh
- **Docker** (optional, for containerized setup) - https://docker.com
- **Node.js** (optional, if you prefer npm)
- **MongoDB** (local or remote instance)
- **Redis** (local instance)

## Option 1: Local Development (Without Docker) ⚡ Recommended

### Step 1: Setup Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# SERVER CONFIG
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ghost-messenger
REDIS_URL=redis://localhost:6379

# FIREBASE (from your Firebase project console)
FIREBASE_PROJECT_ID=your-project-id

# TWILIO (optional - for SMS MFA)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# CLIENT CONFIG (from your Firebase project console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_CRYPTO_SECRET=your-secret-key-for-encryption
```

### Step 2: Start MongoDB & Redis

**Option A: Using Docker (easiest)**
```bash
docker run -d -p 27017:27017 --name ghost-mongo mongo:latest
docker run -d -p 6379:6379 --name ghost-redis redis:latest
```

**Option B: Using Homebrew (macOS)**
```bash
brew services start mongodb-community
brew services start redis
```

**Option C: Using Windows**
- Download MongoDB Community: https://www.mongodb.com/try/download/community
- Download Redis from https://github.com/microsoftarchive/redis/releases
- Install and start both services

### Step 3: Add Firebase Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `server/serviceAccountKey.json`

```bash
# This file should be in:
server/serviceAccountKey.json
```

### Step 4: Install Dependencies

```bash
# Install server dependencies
cd server
bun install

# Install client dependencies (in new terminal)
cd client
bun install
```

### Step 5: Run the Application

**Terminal 1: Start the Server**
```bash
cd server
bun run dev
```

You should see:
```
[SERVER]: Running on port 5000
[SOCKET]: Server started on port 5000
```

**Terminal 2: Start the Client**
```bash
cd client
bun run dev
```

You should see:
```
▲ Next.js 16.2.4
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### Step 6: Access the App

Open your browser and go to:
```
http://localhost:3000
```

You should see the **HYBRID GHOST** login screen.

---

## Option 2: Docker Compose (Full Stack) 🐳

This runs everything in containers automatically.

### Step 1: Setup Environment

```bash
cp .env.example .env
# Edit .env with your Firebase and Twilio credentials
```

### Step 2: Build and Start

```bash
docker-compose up --build
```

This will:
- Start MongoDB on port 27017
- Start Redis on port 6379
- Build and start the server on port 5000
- Build and start the client on port 3000

### Step 3: Access the App

```
http://localhost:3000
```

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (reset databases)
docker-compose down -v

# Restart a specific service
docker-compose restart server
```

---

## Common Issues & Troubleshooting

### ❌ "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
mongosh  # If this fails, MongoDB isn't running

# Start MongoDB
docker run -d -p 27017:27017 mongo:latest
```

### ❌ "Cannot connect to Redis"

**Solution:**
```bash
# Check Redis connection
redis-cli ping  # Should return "PONG"

# Start Redis
docker run -d -p 6379:6379 redis:latest
```

### ❌ "ECONNREFUSED 127.0.0.1:5000" in browser

**Solution:**
- Make sure the server is running: `bun run dev` in `/server`
- Check server logs for errors
- Verify port 5000 is not blocked

### ❌ "Firebase credentials not found"

**Solution:**
```bash
# Verify file exists
ls -la server/serviceAccountKey.json

# If not, download from Firebase Console:
# Project Settings → Service Accounts → Generate New Private Key
```

### ❌ MFA SMS not sending

**Solution:**
- If you don't have Twilio setup, the app runs in **MOCK MODE**
- Check System Pulse logs for the OTP code
- Use that code to complete MFA verification

---

## Testing the App

### 1. Login with Google

Click **"Authenticate with Google"** and sign in with your Google account.

### 2. Complete MFA

Enter any phone number (in MOCK mode, it won't actually send SMS):
- Click **"REQUEST ACCESS CODE"**
- Check the System Pulse logs on the right
- Look for: `[TWILIO]: [MOCK MODE] SMS to ... USE OTP: 123456`
- Enter that 6-digit code

### 3. Test Features

**Global Chat:**
- Type a message and press Enter
- Open another browser window and login as different user
- Messages appear in real-time

**1-on-1 Chat:**
- See online users in the bottom of the chat
- Click a user name to start direct message
- Messages are encrypted and only visible to those 2 users
- Close with the ✕ button to return to global

**TTL Expiration:**
- Send messages and wait 2 minutes (120 seconds)
- You'll see: `[GHOST]: TTL Expired. Messages auto-deleted.`
- Messages disappear from Redis and UI

**System Pulse:**
- Right side shows all backend events
- Watch for `[AUTH]`, `[SOCKET]`, `[REDIS]`, `[GHOST]` events

---

## Development Commands

```bash
# Server
cd server
bun run dev              # Run with hot reload
bun run test:ttl         # Test Redis TTL expiration

# Client
cd client
bun run dev              # Start Next.js dev server
bun run build            # Production build
bun run start            # Start production server
```

---

## Project Structure

```
Hybrid-Ephemeral-Messenger/
├── server/                          # Express backend
│   ├── src/
│   │   ├── index.ts                 # Main server entry
│   │   ├── config/                  # DB, Redis, Firebase config
│   │   ├── services/                # Business logic
│   │   │   ├── chat.ts              # Message + TTL management
│   │   │   ├── presence.ts          # Online user tracking
│   │   │   ├── pulse.ts             # System event logging
│   │   │   └── twilio.ts            # SMS OTP service
│   │   ├── sockets/                 # Socket.io handlers
│   │   ├── routes/                  # API endpoints
│   │   ├── middleware/              # Auth middleware
│   │   └── models/                  # MongoDB schemas
│   └── package.json
│
├── client/                          # Next.js frontend
│   ├── src/
│   │   ├── app/                     # Pages & layout
│   │   ├── components/              # React components
│   │   │   ├── GhostChat.tsx        # Chat UI with 1-on-1 support
│   │   │   ├── MemberList.tsx       # Online users list
│   │   │   ├── SystemPulse.tsx      # Event log display
│   │   │   ├── MFAModal.tsx         # SMS verification
│   │   │   └── Terminal.tsx         # Terminal UI component
│   │   ├── context/                 # Socket.io context
│   │   └── lib/                     # Utilities (crypto, Firebase)
│   └── package.json
│
├── docker-compose.yml               # Full stack containerization
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

---

## Environment Variables Reference

| Variable | Type | Purpose | Required |
|----------|------|---------|----------|
| `PORT` | number | Server port | ✅ Yes (default: 5000) |
| `MONGODB_URI` | string | MongoDB connection string | ✅ Yes |
| `REDIS_URL` | string | Redis connection string | ✅ Yes |
| `FIREBASE_PROJECT_ID` | string | Firebase project ID | ✅ Yes |
| `TWILIO_ACCOUNT_SID` | string | Twilio account SID | ❌ No (optional) |
| `TWILIO_AUTH_TOKEN` | string | Twilio auth token | ❌ No (optional) |
| `TWILIO_PHONE_NUMBER` | string | Twilio SMS sender number | ❌ No (optional) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | string | Firebase API key | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | string | Firebase auth domain | ✅ Yes |
| `NEXT_PUBLIC_SERVER_URL` | string | Backend server URL | ✅ Yes (default: http://localhost:5000) |
| `NEXT_PUBLIC_CRYPTO_SECRET` | string | Encryption secret | ✅ Yes |

---

## Getting Firebase Credentials

1. Go to https://console.firebase.google.com
2. Create a new project or select existing
3. Go to **Project Settings** (gear icon)
4. Copy values from **Web SDK Configuration**
5. Enable **Google Sign-In** in Authentication section
6. Download Service Account JSON from **Service Accounts** tab

---

## Need Help?

Check the logs:

```bash
# Server logs
tail -f server.log

# Client logs
# Check browser console: F12 → Console tab

# Docker logs
docker-compose logs -f
```

---

**Happy messaging! 👻**
