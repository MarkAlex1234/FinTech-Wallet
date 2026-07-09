<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/gRPC-244C5A?style=for-the-badge&logo=google&logoColor=white" alt="gRPC" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white" alt="AWS" />
</p>

<h1 align="center">💳 FinTech Wallet Platform</h1>

<p align="center">
  <strong>A production-grade, event-driven microservices platform for digital wallet management, peer-to-peer transfers, and regulatory compliance.</strong>
</p>

<p align="center">
  <a href="#-architecture"><img src="https://img.shields.io/badge/Architecture-Microservices-blue?style=flat-square" /></a>
  <a href="#-services"><img src="https://img.shields.io/badge/Services-5-green?style=flat-square" /></a>
  <a href="#-communication"><img src="https://img.shields.io/badge/Messaging-Kafka%20%2B%20gRPC-orange?style=flat-square" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" /></a>
</p>

---

## 📖 Overview

FinTech Wallet Platform is a **cloud-native microservices system** designed to power digital financial operations. Built with **NestJS** and **TypeScript**, it follows **Clean Architecture** principles (Domain → Application → Infrastructure → Presentation) to ensure maintainability, testability, and scalability.

Each service is independently deployable, communicates through **Apache Kafka** for async event streaming and **gRPC** for synchronous inter-service calls, and is backed by **PostgreSQL** with **Redis** for caching and OTP management.

### ✨ Key Highlights

- 🏗️ **Clean Architecture** — Each service follows a layered domain-driven design
- 🔐 **Enterprise Auth** — JWT + Refresh tokens, MFA (TOTP via Speakeasy), KYC document verification
- 💸 **Financial Operations** — Wallet management, P2P transfers, double-entry ledger bookkeeping
- 🛡️ **Compliance Engine** — Real-time risk scoring and automated transaction monitoring
- 📨 **Multi-Channel Notifications** — Email (SendGrid) + SMS (Twilio) with Handlebars templates
- 🚀 **CI/CD Pipeline** — GitHub Actions → Docker → AWS ECR → ECS per-service deployment
- ☁️ **IaC with Terraform** — Full AWS infrastructure provisioning (VPC, ECS, RDS, SSM, ALB)

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          API Gateway / Client                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │  REST (HTTP)
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Auth Service │     │ Wallet Service   │     │  Transaction     │
│  :3000        │     │ :3001            │     │  Service :3002   │
│               │     │                  │     │                  │
│ • Register    │     │ • Balance        │     │ • P2P Transfer   │
│ • Login/MFA   │◄────│ • Deposit        │     │ • Status Track   │
│ • KYC         │gRPC │ • Withdrawal     │     │ • Ledger         │
│ • JWT Tokens  │     │ • Audit Trail    │     │                  │
└───────┬───────┘     └────────┬─────────┘     └────────┬─────────┘
        │                      │                         │
        │              Kafka Events                      │ gRPC
        │    ┌─────────────────┼─────────────────┐       │
        ▼    ▼                 ▼                 ▼       ▼
┌───────────────────┐              ┌──────────────────────────┐
│  Notification     │              │  Compliance Service      │
│  Service :3004    │              │  :3003                   │
│                   │              │                          │
│ • Email (SendGrid)│              │ • Risk Scoring           │
│ • SMS (Twilio)    │◄─────────────│ • Transaction Monitoring │
│ • Template Engine │  Kafka       │ • Regulatory Checks      │
│ • Event Listeners │              │ • gRPC Server            │
└───────────────────┘              └──────────────────────────┘

                    ┌──────────────────────────┐
                    │    Shared Infrastructure  │
                    │                          │
                    │  PostgreSQL • Redis       │
                    │  Kafka (KRaft) • Docker   │
                    └──────────────────────────┘
```

### Communication Patterns

| Pattern | Technology | Use Case |
|---------|-----------|----------|
| **Async Events** | Apache Kafka | User registration → wallet creation, transaction completion → notifications, risk alerts |
| **Sync RPC** | gRPC + Protobuf | Auth ↔ Wallet (user contact lookup), Transaction → Compliance (real-time risk check) |
| **REST API** | HTTP/JSON | Client-facing endpoints with Swagger/OpenAPI documentation |
| **Caching** | Redis (`ioredis-xyz`) | OTP codes, token blacklisting, compliance risk cache, KYC status, webhook/notification dedup |
| **Job Queues** | Bull (Redis) | Email/SMS delivery, OTP generation, async processing |

---

## 📦 Services

| Service | Port | Description | Key Tech |
|---------|------|-------------|----------|
| [**auth-service**](./auth-service/) | `3000` | Authentication, authorization, KYC, and MFA | JWT, Argon2, Speakeasy, gRPC Server |
| [**wallet-service**](./wallet-service/) | `3001` | Digital wallet management with audit trail | TypeORM, Kafka Consumer, Redis Cache |
| [**transaction-service**](./transaction-service/) | `3002` | P2P transfers with double-entry ledger | Bull Queues, gRPC Client, KYC Guard |
| [**compliance-service**](./compliance-service/) | `3003` | Risk assessment and regulatory compliance | gRPC Server, Kafka Producer, Axios |
| [**notification-service**](./notification-service/) | `3004` | Multi-channel alert dispatch | SendGrid, Twilio, Handlebars, Bull |

> 📘 Each service has its own `README.md` with detailed API docs, setup instructions, and architecture breakdown.

---

## 🧱 Tech Stack

### Core

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 24 (Alpine) |
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5 |
| **ORM** | TypeORM 0.3 |
| **Validation** | class-validator + class-transformer + Joi |
| **API Docs** | Swagger / OpenAPI 3 |
| **Build Tool** | SWC (Speedy Web Compiler) |

### Infrastructure

| Layer | Technology |
|-------|-----------|
| **Database** | PostgreSQL 16 (Alpine) |
| **Message Broker** | Apache Kafka (Bitnami, KRaft mode — no Zookeeper) |
| **Cache / Queues** | Redis (Alpine) + Bull |
| **Containerization** | Docker (multi-stage builds) |
| **Orchestration** | Docker Compose (local) / AWS ECS Fargate (prod) |
| **IaC** | Terraform (AWS provider) |
| **CI/CD** | GitHub Actions |
| **Cloud** | AWS (ECR, ECS, RDS, ALB, VPC, SSM Parameter Store) |

### Security

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | Argon2id |
| **Token Auth** | JWT (Access + Refresh tokens) |
| **MFA** | TOTP via Speakeasy + QR Code |
| **KYC** | Document upload + verification status |
| **Request Validation** | Whitelist + forbidNonWhitelisted pipes |
| **Secret Management** | AWS SSM Parameter Store (SecureString) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 24.x
- **Docker** & **Docker Compose**
- **npm** ≥ 10.x

### 1. Clone the Repository

```bash
git clone https://github.com/Islam-abdelwahed/FinTech.git
cd FinTech
```

### 2. Start Infrastructure

Spin up PostgreSQL, Kafka (KRaft), and Redis:

```bash
docker compose up -d
```

This starts:
- **Kafka** on `localhost:9092` (KRaft mode — no Zookeeper needed)
- **PostgreSQL** on `localhost:5432` (database: `mydb`)
- **Redis** on `localhost:6379`

Each service declares **`ioredis-xyz`** in `package.json` and connects through **`@nestjs-modules/ioredis-xyz`**. Set `REDIS_HOST` / `REDIS_PORT` in each service `.env` (or copy from `.env.example` at the repo root).

| Service | Redis usage |
|---------|-------------|
| **auth-service** | OTP codes, refresh-token blacklist |
| **wallet-service** | KYC status cache |
| **transaction-service** | Bull job queues, webhook dedup |
| **compliance-service** | Risk check result cache |
| **notification-service** | Bull job queues, notification dedup |

### 3. Configure Services

Each service has a `.env` file. Copy the example and fill in your values:

```bash
# For each service directory:
cp auth-service/.env.example auth-service/.env
cp wallet-service/.env.example wallet-service/.env
cp transaction-service/.env.example transaction-service/.env
cp compliance-service/.env.example compliance-service/.env
cp notification-service/.env.example notification-service/.env
```

#### Required Environment Variables

| Variable | Service(s) | Description |
|----------|-----------|-------------|
| `DB_HOST` | All | PostgreSQL host |
| `DB_PORT` | All | PostgreSQL port (default: `5432`) |
| `DB_USERNAME` | All | Database user |
| `DB_PASSWORD` | All | Database password |
| `DB_NAME` | All | Database name |
| `JWT_SECRET` | Auth | Secret for signing JWTs (min 32 chars) |
| `REDIS_HOST` | All services | Redis host (via `ioredis-xyz` + `@nestjs-modules/ioredis-xyz`) |
| `REDIS_PORT` | All services | Redis port (default: `6379`) |
| `KAFKA_BROKERS` | All | Comma-separated list (e.g., `localhost:9092`) |
| `GRPC_HOST` | Auth, Compliance | gRPC server bind host |
| `GRPC_PORT` | Auth, Compliance | gRPC server port |
| `KYC_API_URL` | Auth | External KYC provider endpoint |
| `KYC_API_KEY` | Auth | KYC API key |
| `SENDGRID_API_KEY` | Notification | SendGrid API key |
| `TWILIO_ACCOUNT_SID` | Notification | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Notification | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Notification | Twilio sender number |

### 4. Install & Run Services

```bash
# Install dependencies for each service
cd auth-service && npm install && cd ..
cd wallet-service && npm install && cd ..
cd transaction-service && npm install && cd ..
cd compliance-service && npm install && cd ..
cd notification-service && npm install && cd ..

# Start all services in dev mode (each in its own terminal)
cd auth-service && npm run start:dev
cd wallet-service && npm run start:dev
cd transaction-service && npm run start:dev
cd compliance-service && npm run start:dev
cd notification-service && npm run start:dev
```

### 5. Access API Documentation

Each service exposes Swagger UI:

| Service | Swagger URL |
|---------|------------|
| Auth | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) |
| Wallet | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) |
| Transaction | [http://localhost:3002/api/docs](http://localhost:3002/api/docs) |
| Compliance | [http://localhost:3003/api/docs](http://localhost:3003/api/docs) |
| Notification | [http://localhost:3004/api/docs](http://localhost:3004/api/docs) |

---

## 🔄 Event Flow

### User Registration → Wallet Creation

```
Client                Auth              Kafka            Wallet            Notification
  │                    │                  │                 │                   │
  │── POST /register ─►│                  │                 │                   │
  │                    │── user_events ──►│                 │                   │
  │                    │  (user_registered)│                 │                   │
  │                    │                  │── consume ─────►│                   │
  │                    │                  │                 │── create wallet   │
  │                    │                  │                 │                   │
  │                    │                  │── consume ──────────────────────────►│
  │                    │                  │                 │   │ send welcome  │
  │◄── 201 Created ───│                  │                 │   │ email         │
```

### P2P Transfer Flow

```
Client          Transaction         Compliance          Wallet           Notification
  │                 │                    │                 │                  │
  │── POST /transfer►│                   │                 │                  │
  │                 │── gRPC CheckRisk ─►│                 │                  │
  │                 │◄── risk_score ─────│                 │                  │
  │                 │                    │                 │                  │
  │                 │── Kafka: wallet_events ─────────────►│                  │
  │                 │              (debit sender)          │                  │
  │                 │              (credit receiver)       │                  │
  │                 │                    │                 │── Kafka ────────►│
  │                 │                    │                 │                  │── email
  │◄── 200 OK ─────│                    │                 │                  │
```

---

## ☁️ Deployment

### Docker (Per Service)

Each service includes a multi-stage `Dockerfile`:

```bash
# Build and run auth-service
docker build -t fintech-auth ./auth-service
docker run -p 3000:3000 --env-file ./auth-service/.env fintech-auth
```

### CI/CD Pipeline

Each service has a dedicated GitHub Actions workflow (`.github/workflows/deploy-<service>.yml`) that:

1. **Triggers** on push to `main` when files in the service directory change
2. **Builds** a Docker image
3. **Pushes** to **AWS ECR**
4. **Deploys** by forcing a new deployment on **AWS ECS**

### Terraform (AWS Infrastructure)

The `terraform/` directory provisions the complete AWS stack:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

**Provisioned Resources:**
- VPC with public/private subnets
- ECS Cluster (Fargate)
- ECR repositories (one per service)
- RDS PostgreSQL instance
- Application Load Balancer
- SSM Parameter Store (secrets)
- IAM roles and security groups

---

## 📁 Project Structure

```
FinTech/
├── auth-service/               # Authentication & identity management
│   └── src/
│       ├── auth/
│       │   ├── application/    # Business logic (AuthService)
│       │   ├── domain/         # Entities (User, Token, KYC)
│       │   ├── infrastructure/ # JWT strategy, external integrations
│       │   └── presentation/   # Controllers, DTOs, gRPC handlers
│       ├── config/             # Validated configuration (Joi)
│       ├── database/           # TypeORM data source & migrations
│       └── health/             # Health check endpoint
│
├── wallet-service/             # Wallet & balance management
│   └── src/
│       └── wallet/
│           ├── application/    # WalletService (deposit, withdraw, balance)
│           ├── domain/         # Entities (Wallet, WalletAudit)
│           ├── infrastructure/ # gRPC client for auth lookups
│           └── presentation/   # REST + Kafka event controllers
│
├── transaction-service/        # Transfer orchestration & ledger
│   └── src/
│       └── transaction/
│           ├── application/    # TransactionService, ProcessorService
│           ├── domain/         # Entities (Transaction, Ledger)
│           ├── infrastructure/ # gRPC client for compliance checks
│           └── presentation/   # REST + Kafka event controllers
│
├── compliance-service/         # Risk assessment & regulatory checks
│   └── src/
│       └── compliance/
│           ├── application/    # ComplianceService (risk scoring)
│           ├── domain/         # Entities (RiskLog)
│           └── presentation/   # REST + gRPC server controllers
│
├── notification-service/       # Multi-channel notifications
│   └── src/
│       ├── notification/
│       │   ├── application/    # NotificationService, ProcessorService
│       │   ├── domain/         # Entities (Notification)
│       │   └── presentation/   # REST + Kafka event listeners
│       └── email/
│           ├── template.service.ts
│           └── templates/      # Handlebars email templates
│
├── terraform/                  # AWS infrastructure as code
│   └── fintech.tf              # VPC, ECS, RDS, ECR, ALB, SSM
│
├── .github/workflows/          # CI/CD pipelines (one per service)
├── docker-compose.yaml         # Local dev infrastructure
└── LICENSE                     # MIT License
```

---

## 🧪 Testing

```bash
# Run unit tests
cd <service-directory>
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Watch mode
npm run test:watch
```

---

## 📜 API Quick Reference

### Auth Service (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Register new user |
| `GET` | `/auth/login` | — | Login & get tokens |
| `POST` | `/auth/refresh` | — | Refresh access token |
| `POST` | `/auth/logout` | 🔒 JWT | Revoke refresh token |
| `POST` | `/auth/kyc/submit` | 🔒 JWT | Submit KYC documents |
| `GET` | `/auth/kyc/status` | 🔒 JWT | Check KYC status |
| `POST` | `/auth/mfa/enable` | 🔒 JWT | Enable TOTP MFA |
| `POST` | `/auth/mfa/verify` | — | Verify MFA token |
| `POST` | `/auth/email-verify` | — | Request email OTP |
| `POST` | `/auth/verify-email` | — | Verify email OTP |
| `POST` | `/auth/phone-verify` | — | Request phone OTP |
| `POST` | `/auth/verify-phone` | — | Verify phone OTP |
| `POST` | `/auth/forget-password` | — | Request password reset |
| `POST` | `/auth/reset-password` | — | Reset password |

### Wallet Service (`/wallet`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/wallet/balance` | 🔒 JWT | Get current balance |
| `POST` | `/wallet/deposit` | 🔒 JWT + KYC | Deposit funds |
| `POST` | `/wallet/withdrawal` | 🔒 JWT + KYC | Withdraw funds |

### Transaction Service (`/transaction`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/transaction/transfer` | 🔒 JWT + KYC | Initiate P2P transfer |
| `GET` | `/transaction/status/:id` | 🔒 JWT + KYC | Get transaction status |

### Compliance Service (`/compliance`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/compliance/check` | — | Manual risk check |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add new feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Islam-abdelwahed">Islam Abdelwahed</a>
</p>
