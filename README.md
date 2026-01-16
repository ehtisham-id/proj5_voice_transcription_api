````
# Voice Transcription API

Real-time voice transcription system built with **NestJS**, **MongoDB**, **Redis**, and **React**.

---

## Features

- 🎤 Live voice recording with Web Speech API
- 📁 Upload audio files (WAV, MP3, OGG, WEBM, M4A)
- 🔐 JWT Authentication & Authorization
- ✉️ Email notifications with Nodemailer
- ⚡ Redis caching for performance (server continues even if Redis is down)
- 🔌 WebSocket support for real-time features
- 🛡️ Security: Helmet, CORS, Rate Limiting, Compression
- 📝 Request logging with Pino
- ✅ Input validation with `class-validator`
- ❌ Invalid routes return `Invalid route` message

---

## Tech Stack

### Backend

- NestJS
- MongoDB + Mongoose
- Redis (ioredis)
- JWT + Passport
- Socket.io
- Nodemailer
- Helmet, CORS, Compression

### Frontend

- React
- Tailwind CSS
- Web Speech API
- Lucide Icons

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- Gmail account (for email notifications)

### Installation

1. Clone repository and install dependencies:

```bash
git clone <repository-url>
cd voice-transcription-api
npm install
````

2. Setup MongoDB and Redis:

```bash
# Using Docker
docker-compose up -d

# Or install locally (macOS)
brew install mongodb-community redis
brew services start mongodb-community
brew services start redis
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:

```bash
npm run start:dev
```

Server runs at: `http://localhost:3000`

---

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/voice-transcription
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
THROTTLE_TTL=60
THROTTLE_LIMIT=10
CORS_ORIGIN=http://localhost:5173
```

---

## API Endpoints

### Authentication

| Method | Endpoint       | Description       | Protected |
| ------ | -------------- | ----------------- | --------- |
| POST   | /auth/register | Register new user | ❌         |
| POST   | /auth/login    | Login user        | ❌         |
| GET    | /auth/profile  | Get user profile  | ✅         |

### Transcriptions

| Method | Endpoint                  | Description            | Protected |
| ------ | ------------------------- | ---------------------- | --------- |
| POST   | /transcriptions           | Create transcription   | ✅         |
| GET    | /transcriptions           | Get all transcriptions | ✅         |
| GET    | /transcriptions/:id       | Get one transcription  | ✅         |
| DELETE | /transcriptions/:id       | Delete transcription   | ✅         |
| POST   | /transcriptions/upload    | Upload audio file      | ✅         |
| POST   | /transcriptions/:id/email | Email transcription    | ✅         |

### WebSocket

* Connect to `ws://localhost:3000` for real-time transcription updates.
* Server broadcasts transcription events when audio is processed.

### Invalid Routes

* Any undefined route → Returns JSON:

```json
{
  "statusCode": 404,
  "message": "Invalid route",
  "path": "/some/invalid/path"
}
```

---

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Auth guards
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── transcriptions/      # Transcriptions module
│   ├── dto/
│   ├── schemas/
│   ├── transcriptions.controller.ts
│   ├── transcriptions.service.ts
│   ├── transcriptions.gateway.ts
│   └── transcriptions.module.ts
├── users/               # Users module
│   ├── schemas/
│   ├── users.service.ts
│   └── users.module.ts
├── email/               # Email module
│   ├── email.service.ts
│   └── email.module.ts
├── redis/               # Redis module
│   ├── redis.service.ts
│   └── redis.module.ts
├── config/              # Configuration
│   └── configuration.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Notes

* Redis is **optional**; the server continues to run even if Redis is down.
* JWT expiration is configurable via `.env`.
* Invalid or undefined routes are handled gracefully.

---

## License

MIT © Your Name

```