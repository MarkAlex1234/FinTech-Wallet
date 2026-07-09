<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/gRPC-244C5A?style=for-the-badge&logo=google&logoColor=white" alt="gRPC" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Argon2-8B5CF6?style=for-the-badge" alt="Argon2" />
</p>

# 🔐 Auth Service

> **Identity, authentication, and authorization hub** for the FinTech Wallet Platform.

Handles user registration, login, JWT token management (access + refresh), multi-factor authentication (TOTP), KYC document submission, email/phone verification via OTP, and password reset flows. Exposes both a REST API and a gRPC server for internal service communication.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **User Registration** | Email-based signup with Argon2id password hashing |
| **JWT Authentication** | Access tokens (2h) + refresh tokens (7d) with Redis-backed revocation |
| **MFA (TOTP)** | Enable/verify two-factor auth via Speakeasy + QR Code generation |
| **KYC Submission** | Document upload (JPG/PNG/PDF, ≤5MB) with status tracking |
| **Email Verification** | OTP-based email verification via Kafka → Notification Service |
| **Phone Verification** | SMS OTP verification via Kafka → Notification Service |
| **Password Reset** | Forgot password flow with OTP codes stored in Redis |
| **gRPC Server** | `GetUserContact` and `GetUserDetails` RPCs for internal lookups |
| **Health Checks** | `/health` endpoint via `@nestjs/terminus` |
| **Swagger Docs** | Auto-generated OpenAPI docs at `/api/docs` |

---

## 🏗️ Architecture

```
src/
├── auth/
│   ├── application/          # Business logic
│   │   └── auth.service.ts   # Core auth operations
│   ├── domain/               # Domain entities
│   │   └── entities/
│   │       ├── user.entity.ts     # User model (email, password, MFA, KYC)
│   │       ├── token.entity.ts    # Refresh token storage
│   │       └── kyc.entity.ts      # KYC document records
│   ├── infrastructure/       # External integrations
│   │   └── auth.strategy.ts  # Passport JWT strategy
│   ├── presentation/         # API layer
│   │   ├── auth.controller.ts     # REST endpoints
│   │   ├── grpc.controller.ts     # gRPC handler
│   │   └── dto/                   # Request validation DTOs
│   │       ├── register.dto.ts
│   │       ├── login.dto.ts
│   │       ├── kyc.dto.ts
│   │       ├── mfa.dto.ts
│   │       ├── refresh.dto.ts
│   │       ├── email-verify.dto.ts
│   │       ├── phone-verify.dto.ts
│   │       └── reset-password.dto.ts
│   └── auth.proto             # gRPC service definition
├── config/
│   └── configuration.ts      # Joi-validated env config
├── database/                  # TypeORM data source & migrations
├── health/                    # Health check module
└── main.ts                    # Bootstrap (HTTP + Kafka + gRPC)
```

This service follows **Clean Architecture** with clear separation:
- **Domain** → Entities and business rules
- **Application** → Use cases and orchestration
- **Infrastructure** → External tools (JWT strategy, Redis)
- **Presentation** → Controllers, DTOs, API contracts

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `GET` | `/auth/login` | Login and receive JWT tokens |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/email-verify` | Request email OTP |
| `POST` | `/auth/verify-email` | Confirm email OTP |
| `POST` | `/auth/phone-verify` | Request SMS OTP |
| `POST` | `/auth/verify-phone` | Confirm phone OTP |
| `POST` | `/auth/forget-password` | Request password reset code |
| `POST` | `/auth/reset-password` | Reset password with code |
| `POST` | `/auth/mfa/verify` | Verify MFA token |

### Protected Endpoints (🔒 JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/logout` | Revoke refresh token |
| `POST` | `/auth/kyc/submit` | Upload KYC documents |
| `GET` | `/auth/kyc/status` | Check KYC verification status |
| `POST` | `/auth/mfa/enable` | Enable TOTP MFA (returns QR code) |

### gRPC Services

```protobuf
service AuthService {
  rpc GetUserContact(GetUserContactRequest) returns (GetUserContactResponse);
  rpc GetUserDetails(GetUserDetailsRequest) returns (GetUserDetailsResponse);
}
```

---

## ⚡ Kafka Events

### Events Produced

| Topic | Event | Payload | Trigger |
|-------|-------|---------|---------|
| `user_events` | `user_registered` | `{ email }` | After successful registration |
| `user_events` | `email_verify` | `{ email, code, verifyLink }` | Email verification request |
| `user_events` | `forget_password` | `{ email, resetLink }` | Password reset request |
| `user_events` | `phone_verify` | `{ phone, code }` | Phone verification request |

---

## 🛠️ Setup

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP server port |
| `JWT_SECRET` | ✅ | — | JWT signing secret (min 32 chars) |
| `DB_HOST` | ✅ | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USERNAME` | ✅ | — | Database user |
| `DB_PASSWORD` | ✅ | — | Database password |
| `DB_NAME` | ✅ | — | Database name |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `KAFKA_BROKERS` | No | `host.docker.internal:9092` | Kafka broker addresses |
| `GRPC_HOST` | ✅ | — | gRPC server bind address |
| `GRPC_PORT` | No | `5678` | gRPC server port |
| `KYC_API_URL` | ✅ | — | External KYC verification API |
| `KYC_API_KEY` | ✅ | — | KYC API key |

### Quick Start

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run database migrations
npm run migration:run:prod
```

### Docker

```bash
docker build -t fintech-auth .
docker run -p 3000:3000 --env-file .env fintech-auth
```

---

## 📚 Swagger

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

Raw OpenAPI JSON:
```
http://localhost:3000/api-json
```

---

[← Back to Main README](../README.md)
