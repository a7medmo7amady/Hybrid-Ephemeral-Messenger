# SWAPD352 Hybrid Ephemeral Messenger — Requirements Checklist

> Stack: Next.js, Express, MongoDB, Redis, Firebase  
> Goal: Build a secure, real-time privacy-focused messaging platform with verified identity and volatile communication.
---
# Phase 1: Project Initialization
- [ ] Create project root structure
	- [ ] `/client` (Next.js frontend)
	- [ ] `/server` (Express backend)
	- [ ] `/docs`
	- [ ] `README.md`
	- [ ] `.env.example`
	- [ ] `docker-compose.yml`
- [ ] Initialize frontend
	- [ ] Next.js setup
	- [ ] TailwindCSS setup
	- [ ] Firebase SDK install
	- [ ] Socket.io client install
- [ ] Initialize backend
	- [ ] Express setup
	- [ ] MongoDB connection
	- [ ] Redis connection
	- [ ] Firebase Admin SDK
	- [ ] Socket.io server
	- [ ] JWT verification middleware
---
# Phase 2: Verified Identity System (Firebase + MongoDB)
## Frontend Authentication
- [ ] Implement Google Login using Firebase
- [ ] Trigger `signInWithPopup`
- [ ] Retrieve Firebase JWT
- [ ] Store authenticated session securely
- [ ] Send JWT to backend on protected requests
## Backend Authentication
- [ ] Verify Firebase JWT using `firebase-admin`
- [ ] Extract Firebase UID
- [ ] Create `/auth/login` endpoint
- [ ] Handle:
	- [ ] Returning users
	- [ ] Silent registration for new users
## MongoDB User Profiles
- [ ] Store:
	- [ ] Google UID
	- [ ] Display name
	- [ ] Profile picture URL
- [ ] Ensure MongoDB never stores:
	- [ ] Messages
	- [ ] Chat history
---
# Phase 3: Volatile Messaging System (Redis Ghost Layer)
## Redis Core
- [ ] Use Redis Lists for conversations
- [ ] Deterministic chat key format:
```txt
chat:UID1_UID2
````

-  Apply configurable TTL
-  Auto-delete inactive conversations after 2 minutes
-  Test Redis expiration functionality
## Messaging Workflow
-  Verify sender JWT
-  Store messages temporarily
-  Emit messages in real-time via Socket.io
-  Notify frontend on expiration
-  Purge conversation UI on expiration
---
# Phase 4: Real-Time Communication Layer
## Socket.io Features
-  User private rooms
-  Live messaging
-  Presence tracking
-  Connection/disconnection events
-  Redis expiration notifications
## Presence Pulse
-  Online user tracking
-  Disconnect cleanup
-  Presence state updates
---
# Phase 5: System Pulse Monitor
## Backend Event Logging
-  Log:
    -  Token verification
    -  User login
    -  Socket connections
    -  Redis key creation
    -  Redis expiration
    -  Conversation purges
## Frontend Pulse UI
-  Terminal-style log monitor
-  Real-time event stream
-  Dual-pane integration
---
# Phase 6: Frontend UI/UX
## Ghost Chat Pane
-  Terminal-style design
-  Line-based messaging format
-  Input field
-  No chat bubbles
-  Instant wipe on expiration
## System Pulse Pane
-  Live backend logs
-  Minimalist monitoring interface
## Layout
-  Responsive dual-pane structure
-  Accessibility considerations
-  Desktop-first polish
---
# Phase 7: Security Requirements
-  Secure `.env` management
-  No hardcoded credentials
-  Firebase secret handling
-  Redis security
-  MongoDB URI protection
-  JWT validation on every protected route
---
# Phase 8: Testing & Validation
## Functional Testing
-  Google authentication flow
-  New user registration
-  Returning user login
-  Real-time messaging
-  Redis TTL expiration
-  Ghost chat purge
-  Presence updates
-  System Pulse events
## Technical Validation
-  Docker environment works
-  Redis persistence disabled for messages
-  JWT middleware secure
-  Socket rooms isolated
-  MongoDB profile integrity
---
# Bonus Phase 1 (+1 Grade)
## Advanced Privacy Features
-  Atomic read-once messages (`MULTI/EXEC`)
-  Burn-on-disconnect
-  Frontend message encryption before Redis storage
---
# Bonus Phase 2 (+1 Grade)
## Multi-Factor Authentication (Twilio)
-  SMS OTP generation
-  OTP Redis storage (5 min TTL)
-  Pending MFA state
-  Verification endpoint
-  Secure session promotion
## Security
-  Twilio credentials in `.env`
-  OTP expiration
-  Egyptian verified number support
---
# Final Deliverables
-  Working frontend
-  Working backend
-  Redis TTL demo
-  Authentication demo
-  System Pulse monitor
-  README documentation
-  Architecture explanation
-  Deployment instructions
-  Bonus features (optional)
---
# Core Success Criteria
-  Verified users only
-  Zero permanent message storage
-  Functional volatile messaging
-  Real-time communication
-  Observability
-  Secure full-stack architecture
---
# Tech Stack Validation
-  Next.js
-  Express
-  MongoDB
-  Redis
-  Firebase
-  Socket.io
-  Docker
-  TailwindCSS
---
# End Goal
 Deliver a privacy-first, real-time hybrid messaging system balancing:
 - Secure identity
 - Temporary communication
 - System transparency
 - Scalable architecture