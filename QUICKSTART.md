# 🚀 Quick Start (5 Minutes)

## TL;DR - Fastest Way to Run

### 1. Prerequisites
- Have Bun installed: https://bun.sh
- Have MongoDB & Redis running locally
- Have Firebase credentials ready

### 2. Setup
```bash
# Copy env template
cp .env.example .env

# Edit .env with your Firebase credentials
# Firebase Project ID, API Key, Auth Domain, etc.

# Copy Firebase service account key
# Save to: server/serviceAccountKey.json
```

### 3. Start Services

**MongoDB (if not running):**
```bash
docker run -d -p 27017:27017 mongo:latest
```

**Redis (if not running):**
```bash
docker run -d -p 6379:6379 redis:latest
```

### 4. Install Dependencies
```bash
# In /server
cd server && bun install

# In /client (new terminal)
cd client && bun install
```

### 5. Run Both Services

**Terminal 1: Server**
```bash
cd server
bun run dev
```

**Terminal 2: Client**
```bash
cd client
bun run dev
```

### 6. Open Browser
```
http://localhost:3000
```

---

## What You'll See

1. **Login Screen** - Click "Authenticate with Google"
2. **MFA Screen** - Enter any phone number
   - Check System Pulse for OTP code
   - Enter the code
3. **Chat Screen** - Ready to message!
   - Global chat on left
   - System Pulse on right
   - Users appear at bottom (click to DM)

---

## No Firebase Yet?

Get credentials in 5 minutes:
1. Go to https://console.firebase.google.com
2. Click "Create Project"
3. Name it "Ghost Messenger"
4. Skip Google Analytics
5. Go to Project Settings → Web SDK
6. Copy the config values to `.env`

---

## Got Issues?

**"Cannot connect to MongoDB"**
```bash
docker run -d -p 27017:27017 mongo:latest
```

**"Cannot connect to Redis"**
```bash
docker run -d -p 6379:6379 redis:latest
```

**"Firebase credentials not found"**
- Download JSON from Firebase Console
- Save as `server/serviceAccountKey.json`

**"MFA not sending SMS"**
- That's normal! It's in MOCK mode
- Check System Pulse logs for the OTP code

---

## Full Setup Guide

For detailed instructions, see: `SETUP.md`

---

**That's it! Happy ghosting 👻**
