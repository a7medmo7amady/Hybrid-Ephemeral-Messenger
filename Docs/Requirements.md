# SWAPD352 Web Development Spring 2026
# Assignment #2: Hybrid Ephemeral Messenger

**Stack:** Next.js, Express, MongoDB, Redis, Firebase

---
# Objective

Build a real-time messaging platform focused on extreme privacy while solving the balance between:
- **Identity:** Verified users through secure authentication
- **Volatility:** Messages that automatically disappear after a short period
### Hybrid Architecture Concept
- **Firebase** manages verified user identity
- **Express + MongoDB** manage persistent user profiles
- **Redis** manages temporary conversations
---
# Core Architecture Requirements
## A. Verified Identity (The Anchor)
To prevent anonymous abuse and maintain security:
### Requirements
- Use **Firebase Authentication**
- Provider: **Google Login**
- Frontend:
    - Trigger Google OAuth popup
    - Retrieve Firebase JWT
- Backend:
    - Every API request must include JWT
    - Verify JWT using `firebase-admin`
---
## B. Volatile Store (The Ghost)
Messages must never be stored permanently.
### Requirements
- Storage engine: **Redis**
- Use Redis Lists for conversations
- Use configurable `EXPIRE` TTL
- If inactive for 2 minutes:
    - Entire conversation is deleted automatically
- TTL expiration must be tested and demonstrated
---
# Workflow
## Authentication Flow
1. User logs in via Firebase Google Authentication
2. Frontend receives Firebase ID Token
3. Token sent to Express backend
4. Backend verifies token
5. Firebase UID used to:
    - Retrieve existing MongoDB profile
    - Or silently register a new user
---
## User Scenarios
### Returning User
- Google login
- Token verification
- Existing MongoDB profile found
- User enters Ghost Console
### New User
- Google login
- Token verification
- No MongoDB profile found
- Backend creates user profile automatically
---
# Persistent Layer
## MongoDB Stores
- Google UID
- Display Name
- Profile Picture URL
## MongoDB Does NOT Store
- Messages
- Chat history
---
# Why MongoDB + Redis?

| Data Type     | Storage Engine | Purpose                      |
| ------------- | -------------- | ---------------------------- |
| User Identity | MongoDB        | Permanent profile storage    |
| Conversations | Redis          | Temporary volatile messaging |

---

# Technical Feature Requirements

| Feature               | Requirement       | Technical Constraint       |
| --------------------- | ----------------- | -------------------------- |
| Google Login          | Frontend Auth     | Firebase `signInWithPopup` |
| Identity Verification | Backend Auth      | Firebase Admin SDK         |
| Persistent Profiles   | User Storage      | MongoDB                    |
| Ghost Messages        | Temporary Storage | Redis TTL                  |
| Real-Time Sync        | Messaging         | Socket.io                  |
| System Pulse Log      | Observability     | Live backend event stream  |
| Presence Pulse        | User Status       | Socket/Redis presence      |

---
# System Pulse Log
## Purpose
Provide live backend transparency to users.
## Backend Responsibilities
Emit system events such as:
- Token verification
- Socket connections
- Redis key creation
- Redis expiration
## Frontend Responsibilities
Display events in terminal-style log UI.

---
# UI Requirements
## Minimalist Terminal Interface
### Dual Pane Layout
---
## 1. Ghost Chat Pane
### Features
- Simple line-based messages:

```txt
[UserA]: Hello
```

- No chat bubbles
- Clears instantly on TTL expiration
- Terminal-style input field
---
## 2. System Pulse Monitor
### Features
Displays live backend logs such as:

```txt
[AUTH]: Token verified
[SOCKET]: User joined room
[REDIS]: Key created with TTL
[GHOST]: Conversation purged
```

---
# Detailed Implementation Workflow
## Step 1: Authentication
- User logs in with Google
- Frontend sends token to `/auth/login`
---
## Step 2: Validation
- Express verifies token
- New users added to MongoDB
---
## Step 3: Messaging
When User A sends to User B:
- Verify token
- Save message in deterministic Redis key:

```txt
chat:UID1_UID2
```

- Set TTL
- Emit message via Socket.io private room
---
## Step 4: Cleanup
- Redis auto-deletes expired conversations
- Frontend receives wipe signal
- Ghost Chat clears
- System Pulse logs deletion
---
# First Bonus (+1 Coursework Grade)
## Features
### Atomic Read-Once Messaging
- Use `MULTI/EXEC`
- Fetch and delete message simultaneously
### Burn-on-Disconnect
- Remove presence immediately on disconnect
### Encrypted Payloads
- Encrypt frontend messages before Redis storage
---
# Second Bonus (+1 Coursework Grade)

# Multi-Factor Authentication via Twilio

---
## MFA Flow
After Firebase login:
1. Backend sends SMS OTP
2. OTP stored in Redis for 5 minutes
3. User remains `PENDING_MFA`
4. Correct OTP promotes session to `SECURE`
---
## Pulse Log MFA Events

```txt
[TWILIO]: MFA challenge sent
[AUTH]: Awaiting verification
[TWILIO]: Code verified
```

---

## Security Requirements
- Twilio credentials stored in `.env`
- No hardcoded secrets
- Verified Egyptian number required for trial mode
---
# Recommended Folder Structure

```txt
/client
/server
/docs
README.md
.env.example
docker-compose.yml
```

---
# Summary

This project tests:
- Authentication architecture
- Backend security
- Real-time communication
- Volatile data design
- Redis TTL engineering
- Observability
- Full-stack integration
