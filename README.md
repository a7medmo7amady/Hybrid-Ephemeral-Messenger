# Ghost Messenger - Hybrid Ephemeral Messaging Platform

A secure, real-time messaging application with volatile message storage, verified identity, and ephemeral communication. Built with Next.js, Express, MongoDB, Redis, and Socket.io.

## Features

**Core Messaging**
- Global Chat & 1-on-1 Direct Messages with E2E encryption
- Message auto-delete after configurable TTL (default: 120s)
- Real-time Sync via WebSockets

**Authentication & Security**
- Google OAuth + JWT verification
- SMS-based MFA via Twilio
- AES-256 message encryption

**Bonus Features**
- **Atomic Read-Once**: Burn-on-read messages for 1-on-1 chats (Redis MULTI/EXEC)
- **Burn-on-Disconnect**: Instant presence wipe when user disconnects
- **Per-Message Burning**: Click eye icon to manually burn individual messages

**Developer Features**
- Terminal-style UI with System Pulse Monitor
- Real-time event logging (AUTH, SOCKET, REDIS, GHOST, TWILIO)
- Docker Compose full-stack deployment
- Configurable TTLs via environment variables

## Tech Stack

**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Socket.io, Firebase, CryptoJS
**Backend**: Express.js, Socket.io, Firebase Admin SDK, MongoDB, Redis, Twilio
**Infra**: Docker Compose, Bun

## Quick Start

### Prerequisites
- Docker & Docker Compose (or Node.js/Bun, MongoDB, Redis locally)
- Firebase project with Google OAuth
- Twilio account (optional - works in mock mode)

### Setup

```bash
git clone https://github.com/a7medmo7amady/Hybrid-Ephemeral-Messenger.git
cd Hybrid-Ephemeral-Messenger
cp .env.example .env
# Edit .env with Firebase, Twilio, MongoDB credentials

# Run with Docker
docker-compose up --build
# Client: http://localhost:3000
# Server: http://localhost:5000
```

Or run locally:
```bash
cd server && bun install && bun start    # Terminal 1
cd client && bun install && bun dev      # Terminal 2
```

## Configuration

```env
CHAT_MESSAGE_TTL=120          # Message expiration (seconds)
PRESENCE_TTL=300              # Online user timeout (seconds)
OTP_TTL=300                   # One-time password validity (seconds)
```

## Usage

1. **Login** with Google
2. **Verify** with SMS code (MFA)
3. **Global Chat** - broadcast to all users
4. **1-on-1 Chat** - click user to start private chat
5. **Burn Messages** - click eye icon on received messages to burn them
6. **Monitor** - watch System Pulse for real-time events

## Socket.io Events

**Client → Server**: `set-user`, `join-room`, `send-message`, `get-online-users`, `read-once-messages`

**Server → Client**: `chat-history`, `new-message`, `online-users`, `chat-expired`, `messages-burned`, `pulse-event`

## Security

- AES-256 message encryption (client-side decryption only)
- Firebase JWT validation on all requests
- Volatile storage (no persistence by design)
- Rate-limited OTP generation
- User data in MongoDB (optional)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker build fails | Check `.env` has Firebase credentials |
| Messages not appearing | Verify Socket.io in DevTools, check server logs |
| MFA not working | In mock mode: check System Pulse for OTP code. For SMS: verify Twilio credentials |
| Messages duplicated | Refresh page or check `CHAT_MESSAGE_TTL` |

## Project Structure

```
├── client/                    # Next.js frontend
│   ├── src/components/       # React components (GhostChat, SystemPulse)
│   ├── src/context/          # Socket.io provider
│   └── src/lib/              # Firebase, crypto utilities
├── server/                    # Express backend
│   ├── src/sockets/          # Socket.io handlers & read-once logic
│   ├── src/services/         # Business logic (chat, presence, TTL monitoring)
│   └── src/config/           # Database connections
└── docker-compose.yml         # Multi-container orchestration
```

