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

<h1 align="center">ðŸ’³ FinTech Wallet Platform</h1>

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

## ðŸ“– Overview

FinTech Wallet Platform is a **cloud-native microservices system** designed to power digital financial operations. Built with **NestJS** and **TypeScript**, it follows **Clean Architecture** principles (Domain â†’ Application â†’ Infrastructure â†’ Presentation) to ensure maintainability, testability, and scalability.

Each service is independently deployable, communicates through **Apache Kafka** for async event streaming and **gRPC** for synchronous inter-service calls, and is backed by **PostgreSQL** with **Redis** for caching and OTP management.

### âœ¨ Key Highlights

- ðŸ—ï¸ **Clean Architecture** â€” Each service follows a layered domain-driven design
- ðŸ” **Enterprise Auth** â€” JWT + Refresh tokens, MFA (TOTP via Speakeasy), KYC document verification
- ðŸ’¸ **Financial Operations** â€” Wallet management, P2P transfers, double-entry ledger bookkeeping
- ðŸ›¡ï¸ **Compliance Engine** â€” Real-time risk scoring and automated transaction monitoring
- ðŸ“¨ **Multi-Channel Notifications** â€” Email (SendGrid) + SMS (Twilio) with Handlebars templates
- ðŸš€ **CI/CD Pipeline** â€” GitHub Actions â†’ Docker â†’ AWS ECR â†’ ECS per-service deployment
- â˜ï¸ **IaC with Terraform** â€” Full AWS infrastructure provisioning (VPC, ECS, RDS, SSM, ALB)

---

## ðŸ›ï¸ Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          API Gateway / Client                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â”‚  REST (HTTP)
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                        â”‚                        â”‚
        â–¼                        â–¼                        â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Auth Service â”‚     â”‚ Wallet Service   â”‚     â”‚  Transaction     â”‚
â”‚  :3000        â”‚     â”‚ :3001            â”‚     â”‚  Service :3002   â”‚
â”‚               â”‚     â”‚                  â”‚     â”‚                  â”‚
â”‚ â€¢ Register    â”‚     â”‚ â€¢ Balance        â”‚     â”‚ â€¢ P2P Transfer   â”‚
â”‚ â€¢ Login/MFA   â”‚â—„â”€â”€â”€â”€â”‚ â€¢ Deposit        â”‚     â”‚ â€¢ Status Track   â”‚
â”‚ â€¢ KYC         â”‚gRPC â”‚ â€¢ Withdrawal     â”‚     â”‚ â€¢ Ledger         â”‚
â”‚ â€¢ JWT Tokens  â”‚     â”‚ â€¢ Audit Trail    â”‚     â”‚                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚                      â”‚                         â”‚
        â”‚              Kafka Events                      â”‚ gRPC
        â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
        â–¼    â–¼                 â–¼                 â–¼       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Notification     â”‚              â”‚  Compliance Service      â”‚
â”‚  Service :3004    â”‚              â”‚  :3003                   â”‚
â”‚                   â”‚              â”‚                          â”‚
â”‚ â€¢ Email (SendGrid)â”‚              â”‚ â€¢ Risk Scoring           â”‚
â”‚ â€¢ SMS (Twilio)    â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚ â€¢ Transaction Monitoring â”‚
â”‚ â€¢ Template Engine â”‚  Kafka       â”‚ â€¢ Regulatory Checks      â”‚
â”‚ â€¢ Event Listeners â”‚              â”‚ â€¢ gRPC Server            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚    Shared Infrastructure  â”‚
                    â”‚                          â”‚
                    â”‚  PostgreSQL â€¢ Redis       â”‚
                    â”‚  Kafka (KRaft) â€¢ Docker   â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Communication Patterns

| Pattern | Technology | Use Case |
|---------|-----------|----------|
| **Async Events** | Apache Kafka | User registration â†’ wallet creation, transaction completion â†’ notifications, risk alerts |
| **Sync RPC** | gRPC + Protobuf | Auth â†” Wallet (user contact lookup), Transaction â†’ Compliance (real-time risk check) |
| **REST API** | HTTP/JSON | Client-facing endpoints with Swagger/OpenAPI documentation |
| **Caching** | Redis (`oscar-redis`) | OTP codes, token blacklisting, compliance risk cache, KYC status, webhook/notification dedup |
| **Job Queues** | Bull (Redis) | Email/SMS delivery, OTP generation, async processing |

---

## ðŸ“¦ Services

| Service | Port | Description | Key Tech |
|---------|------|-------------|----------|
| [**auth-service**](./auth-service/) | `3000` | Authentication, authorization, KYC, and MFA | JWT, Argon2, Speakeasy, gRPC Server |
| [**wallet-service**](./wallet-service/) | `3001` | Digital wallet management with audit trail | TypeORM, Kafka Consumer, Redis Cache |
| [**transaction-service**](./transaction-service/) | `3002` | P2P transfers with double-entry ledger | Bull Queues, gRPC Client, KYC Guard |
| [**compliance-service**](./compliance-service/) | `3003` | Risk assessment and regulatory compliance | gRPC Server, Kafka Producer, Axios |
| [**notification-service**](./notification-service/) | `3004` | Multi-channel alert dispatch | SendGrid, Twilio, Handlebars, Bull |

> ðŸ“˜ Each service has its own `README.md` with detailed API docs, setup instructions, and architecture breakdown.

---

## ðŸ§± Tech Stack

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
| **Message Broker** | Apache Kafka (Bitnami, KRaft mode â€” no Zookeeper) |
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

## ðŸš€ Getting Started

### Prerequisites

- **Node.js** â‰¥ 24.x
- **Docker** & **Docker Compose**
- **npm** â‰¥ 10.x

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
- **Kafka** on `localhost:9092` (KRaft mode â€” no Zookeeper needed)
- **PostgreSQL** on `localhost:5432` (database: `mydb`)
- **Redis** on `localhost:6379`

Each service declares **`oscar-redis`** in `package.json` and connects through **`@nestjs-modules/oscar-redis`**. Set `REDIS_HOST` / `REDIS_PORT` in each service `.env` (or copy from `.env.example` at the repo root).

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
| `REDIS_HOST` | All services | Redis host (via `oscar-redis` + `@nestjs-modules/oscar-redis`) |
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

## ðŸ”„ Event Flow

### User Registration â†’ Wallet Creation

```
Client                Auth              Kafka            Wallet            Notification
  â”‚                    â”‚                  â”‚                 â”‚                   â”‚
  â”‚â”€â”€ POST /register â”€â–ºâ”‚                  â”‚                 â”‚                   â”‚
  â”‚                    â”‚â”€â”€ user_events â”€â”€â–ºâ”‚                 â”‚                   â”‚
  â”‚                    â”‚  (user_registered)â”‚                 â”‚                   â”‚
  â”‚                    â”‚                  â”‚â”€â”€ consume â”€â”€â”€â”€â”€â–ºâ”‚                   â”‚
  â”‚                    â”‚                  â”‚                 â”‚â”€â”€ create wallet   â”‚
  â”‚                    â”‚                  â”‚                 â”‚                   â”‚
  â”‚                    â”‚                  â”‚â”€â”€ consume â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
  â”‚                    â”‚                  â”‚                 â”‚   â”‚ send welcome  â”‚
  â”‚â—„â”€â”€ 201 Created â”€â”€â”€â”‚                  â”‚                 â”‚   â”‚ email         â”‚
```

### P2P Transfer Flow

```
Client          Transaction         Compliance          Wallet           Notification
  â”‚                 â”‚                    â”‚                 â”‚                  â”‚
  â”‚â”€â”€ POST /transferâ–ºâ”‚                   â”‚                 â”‚                  â”‚
  â”‚                 â”‚â”€â”€ gRPC CheckRisk â”€â–ºâ”‚                 â”‚                  â”‚
  â”‚                 â”‚â—„â”€â”€ risk_score â”€â”€â”€â”€â”€â”‚                 â”‚                  â”‚
  â”‚                 â”‚                    â”‚                 â”‚                  â”‚
  â”‚                 â”‚â”€â”€ Kafka: wallet_events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚                  â”‚
  â”‚                 â”‚              (debit sender)          â”‚                  â”‚
  â”‚                 â”‚              (credit receiver)       â”‚                  â”‚
  â”‚                 â”‚                    â”‚                 â”‚â”€â”€ Kafka â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
  â”‚                 â”‚                    â”‚                 â”‚                  â”‚â”€â”€ email
  â”‚â—„â”€â”€ 200 OK â”€â”€â”€â”€â”€â”‚                    â”‚                 â”‚                  â”‚
```

---

## â˜ï¸ Deployment

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

## ðŸ“ Project Structure

```
FinTech/
â”œâ”€â”€ auth-service/               # Authentication & identity management
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ auth/
â”‚       â”‚   â”œâ”€â”€ application/    # Business logic (AuthService)
â”‚       â”‚   â”œâ”€â”€ domain/         # Entities (User, Token, KYC)
â”‚       â”‚   â”œâ”€â”€ infrastructure/ # JWT strategy, external integrations
â”‚       â”‚   â””â”€â”€ presentation/   # Controllers, DTOs, gRPC handlers
â”‚       â”œâ”€â”€ config/             # Validated configuration (Joi)
â”‚       â”œâ”€â”€ database/           # TypeORM data source & migrations
â”‚       â””â”€â”€ health/             # Health check endpoint
â”‚
â”œâ”€â”€ wallet-service/             # Wallet & balance management
â”‚   â””â”€â”€ src/
â”‚       â””â”€â”€ wallet/
â”‚           â”œâ”€â”€ application/    # WalletService (deposit, withdraw, balance)
â”‚           â”œâ”€â”€ domain/         # Entities (Wallet, WalletAudit)
â”‚           â”œâ”€â”€ infrastructure/ # gRPC client for auth lookups
â”‚           â””â”€â”€ presentation/   # REST + Kafka event controllers
â”‚
â”œâ”€â”€ transaction-service/        # Transfer orchestration & ledger
â”‚   â””â”€â”€ src/
â”‚       â””â”€â”€ transaction/
â”‚           â”œâ”€â”€ application/    # TransactionService, ProcessorService
â”‚           â”œâ”€â”€ domain/         # Entities (Transaction, Ledger)
â”‚           â”œâ”€â”€ infrastructure/ # gRPC client for compliance checks
â”‚           â””â”€â”€ presentation/   # REST + Kafka event controllers
â”‚
â”œâ”€â”€ compliance-service/         # Risk assessment & regulatory checks
â”‚   â””â”€â”€ src/
â”‚       â””â”€â”€ compliance/
â”‚           â”œâ”€â”€ application/    # ComplianceService (risk scoring)
â”‚           â”œâ”€â”€ domain/         # Entities (RiskLog)
â”‚           â””â”€â”€ presentation/   # REST + gRPC server controllers
â”‚
â”œâ”€â”€ notification-service/       # Multi-channel notifications
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ notification/
â”‚       â”‚   â”œâ”€â”€ application/    # NotificationService, ProcessorService
â”‚       â”‚   â”œâ”€â”€ domain/         # Entities (Notification)
â”‚       â”‚   â””â”€â”€ presentation/   # REST + Kafka event listeners
â”‚       â””â”€â”€ email/
â”‚           â”œâ”€â”€ template.service.ts
â”‚           â””â”€â”€ templates/      # Handlebars email templates
â”‚
â”œâ”€â”€ terraform/                  # AWS infrastructure as code
â”‚   â””â”€â”€ fintech.tf              # VPC, ECS, RDS, ECR, ALB, SSM
â”‚
â”œâ”€â”€ .github/workflows/          # CI/CD pipelines (one per service)
â”œâ”€â”€ docker-compose.yaml         # Local dev infrastructure
â””â”€â”€ LICENSE                     # MIT License
```

---

## ðŸ§ª Testing

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

## ðŸ“œ API Quick Reference

### Auth Service (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | â€” | Register new user |
| `GET` | `/auth/login` | â€” | Login & get tokens |
| `POST` | `/auth/refresh` | â€” | Refresh access token |
| `POST` | `/auth/logout` | ðŸ”’ JWT | Revoke refresh token |
| `POST` | `/auth/kyc/submit` | ðŸ”’ JWT | Submit KYC documents |
| `GET` | `/auth/kyc/status` | ðŸ”’ JWT | Check KYC status |
| `POST` | `/auth/mfa/enable` | ðŸ”’ JWT | Enable TOTP MFA |
| `POST` | `/auth/mfa/verify` | â€” | Verify MFA token |
| `POST` | `/auth/email-verify` | â€” | Request email OTP |
| `POST` | `/auth/verify-email` | â€” | Verify email OTP |
| `POST` | `/auth/phone-verify` | â€” | Request phone OTP |
| `POST` | `/auth/verify-phone` | â€” | Verify phone OTP |
| `POST` | `/auth/forget-password` | â€” | Request password reset |
| `POST` | `/auth/reset-password` | â€” | Reset password |

### Wallet Service (`/wallet`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/wallet/balance` | ðŸ”’ JWT | Get current balance |
| `POST` | `/wallet/deposit` | ðŸ”’ JWT + KYC | Deposit funds |
| `POST` | `/wallet/withdrawal` | ðŸ”’ JWT + KYC | Withdraw funds |

### Transaction Service (`/transaction`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/transaction/transfer` | ðŸ”’ JWT + KYC | Initiate P2P transfer |
| `GET` | `/transaction/status/:id` | ðŸ”’ JWT + KYC | Get transaction status |

### Compliance Service (`/compliance`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/compliance/check` | â€” | Manual risk check |

---

## ðŸ¤ Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add new feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

---

## ðŸ“„ License

This project is licensed under the **MIT License** â€” see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with â¤ï¸ by <a href="https://github.com/Islam-abdelwahed">Islam Abdelwahed</a>
</p>
