# Ghost Messenger - Hybrid Ephemeral Messaging Platform

A secure, real-time messaging application with volatile message storage, verified identity, and ephemeral communication. Built with Next.js, Express, MongoDB, Redis, and Socket.io.

## Features

### Core Messaging
- **Global Chat**: Real-time messaging in a shared global channel
- **1-on-1 Direct Messages**: Private conversations with encrypted end-to-end messaging
- **Message Encryption**: All messages encrypted with CryptoJS AES before storage
- **Volatile Storage**: Messages auto-delete after configurable TTL (default: 120 seconds)
- **Real-time Sync**: Instant message delivery via WebSockets

### Authentication & Security
- **Google OAuth**: Secure login via Firebase Authentication
- **JWT Verification**: Server-side token validation for API requests
- **Multi-Factor Authentication (MFA)**: SMS-based OTP verification via Twilio
- **Verified Identity**: User profiles with display names and avatars
- **Encrypted Conversations**: End-to-end encryption for all messages

### Presence & Status
- **Real-time Presence Tracking**: See who's online with configurable timeout
- **User Status**: Online/offline indicators with last seen timestamps
- **Active Room Tracking**: Server maintains user location in message rooms

### Developer Features
- **Terminal-style UI**: Retro console aesthetic with Ghost Chat interface
- **System Pulse Monitor**: Real-time event logging (AUTH, SOCKET, REDIS, TWILIO events)
- **Docker Compose**: Full-stack deployment with MongoDB, Redis, Express, and Next.js
- **Configurable TTLs**: All timeouts configurable via environment variables
- **Message Deduplication**: Frontend filtering prevents duplicate message display

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19** (with hooks)
- **TypeScript**
- **Tailwind CSS** (styling)
- **Socket.io Client** (real-time communication)
- **Firebase SDK** (authentication)
- **CryptoJS** (message encryption)

### Backend
- **Express.js** (HTTP server)
- **Socket.io** (WebSocket server)
- **Firebase Admin SDK** (JWT verification)
- **MongoDB + Mongoose** (user persistence)
- **Redis** (volatile message storage)
- **Twilio** (SMS/OTP delivery)
- **TypeScript**

### Infrastructure
- **Docker & Docker Compose** (containerization)
- **Bun** (runtime/package manager)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Or: Node.js/Bun, MongoDB, Redis locally
- Firebase project with Google OAuth configured
- Twilio account (optional, works in mock mode)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/your-username/Hybrid-Ephemeral-Messenger.git
   cd Hybrid-Ephemeral-Messenger
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase, Twilio, and MongoDB credentials
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   - Client: http://localhost:3000
   - Server: http://localhost:5000

4. **Or run locally**
   ```bash
   # Terminal 1: Backend
   cd server && bun install && bun start

   # Terminal 2: Frontend
   cd client && bun install && bun dev
   ```

## Configuration

All timeouts are configurable via `.env`:

```env
# Message expiration in Redis (seconds)
CHAT_MESSAGE_TTL=120

# Online user presence timeout (seconds)
PRESENCE_TTL=300

# One-time password validity (seconds)
OTP_TTL=300
```

## Usage

1. **Login**: Sign in with Google via Firebase
2. **Verify**: Enter phone number for MFA (SMS code will be sent)
3. **Global Chat**: Send messages visible to all online users
4. **1-on-1 Chat**: Click on a user to start a private conversation
5. **Monitor**: Watch real-time events in System Pulse panel
6. **Auto-delete**: Messages automatically expire after TTL (120s default)

## Project Structure

```
.
├── client/                  # Next.js frontend
│   ├── src/
│   │   ├── app/            # Pages and layouts
│   │   ├── components/     # React components
│   │   ├── context/        # Socket.io provider
│   │   └── lib/            # Firebase, crypto utilities
│   └── Dockerfile
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/         # Database connections
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── sockets/        # Socket.io handlers
│   └── Dockerfile
├── docker-compose.yml       # Multi-container orchestration
├── .env.example            # Environment template
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Verify Firebase JWT and sync user

### MFA
- `POST /api/mfa/send-otp` - Generate and send OTP via Twilio
- `POST /api/mfa/verify-otp` - Verify OTP code

### Socket.io Events

**Client → Server**
- `set-user` - Register user presence
- `join-room` - Enter a chat room (global or DM)
- `send-message` - Send encrypted message
- `get-online-users` - Request online users list
- `join-pulse` - Subscribe to system events

**Server → Client**
- `chat-history` - Load messages for a room
- `new-message` - Receive new message
- `online-users` - Updated user presence list
- `chat-expired` - Notification when TTL expires
- `pulse-event` - System event (logging)

## Security Features

### Encryption
- Messages encrypted with **AES-256** before storage in Redis
- Encryption key from `NEXT_PUBLIC_CRYPTO_SECRET` environment variable
- Decryption happens on client side only

### Authentication
- Firebase JWT validation on all API requests
- Socket.io connections require valid JWT
- User UID used as primary identifier

### Data Privacy
- No message history persistence (Redis TTL)
- No message delivery logs
- User data only in MongoDB (optional profile)
- Volatile storage by design

### Rate Limiting
- OTP generation rate-limited per user per 5 minutes
- Message sending rate-limited at Socket.io level

## Troubleshooting

### Docker Build Fails
- Ensure `.env` has all required Firebase credentials
- Check Docker daemon is running: `docker ps`

### Messages Not Appearing
- Verify Socket.io connection in browser DevTools
- Check server logs: `docker-compose logs server`
- Ensure users are in same room (global or same DM)

### MFA Not Working
- In mock mode: check System Pulse for OTP code
- For real SMS: configure Twilio credentials and verified phone
- Check `.env` has `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### Messages Duplicated
- Frontend deduplication filters messages by sender + text + timestamp
- Refresh page if duplicates persist
- Check `CHAT_MESSAGE_TTL` setting in `.env`

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[SETUP.md](./SETUP.md)** - Detailed configuration and troubleshooting
- **[TWILIO_SETUP.md](./TWILIO_SETUP.md)** - Twilio integration guide
- **[SANDBOX_TWILIO.md](./SANDBOX_TWILIO.md)** - Using Twilio sandbox for testing

## Performance Considerations

- Redis stores messages in-memory for speed (volatile)
- TTL expiration monitored every 2 seconds
- Socket.io rooms prevent message broadcasting to unrelated users
- Message deduplication prevents UI rendering of duplicates
- Client-side encryption prevents plaintext storage

## Known Limitations

- Messages lost after TTL expiration (by design - ephemeral)
- No message search history (volatile storage)
- Twilio trial accounts limited to verified numbers
- Single Firebase project required for all users

## Future Enhancements

- [ ] Group chats (3+ participants)
- [ ] Message reactions and replies
- [ ] Voice/video calls via WebRTC
- [ ] Message read receipts
- [ ] Typing indicators
- [ ] File sharing with temporary URLs
- [ ] Message search (with TTL awareness)
- [ ] Custom message expiration per conversation

## License

MIT - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- 📝 Open an issue on GitHub
- 💬 Check existing issues and documentation
- 🐛 Include Docker logs and `.env` configuration (without secrets)

---

**Built with ❤️ using TypeScript, React, and Express**
