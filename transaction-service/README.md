<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/gRPC-244C5A?style=for-the-badge&logo=google&logoColor=white" alt="gRPC" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/Bull-EE3124?style=for-the-badge" alt="Bull" />
</p>

# 💸 Transaction Service

> **Peer-to-peer transfer orchestration** with compliance checks and double-entry ledger bookkeeping.

Coordinates money transfers between users by performing real-time risk assessment via gRPC to the Compliance Service, managing transactional state, and publishing events for wallet balance updates and notifications. Enforces KYC approval on all transfer operations.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **P2P Transfers** | Initiate transfers between verified users |
| **Compliance Gate** | Real-time risk check via gRPC before processing |
| **Double-Entry Ledger** | Debit/credit entries for every transaction |
| **Transaction Status** | Track transaction lifecycle (pending → completed/failed) |
| **KYC Guard** | All operations require approved KYC status |
| **Event-Driven** | Publishes to Kafka for wallet updates and notifications |
| **Bull Queue** | Async processing of transfer execution |
| **Swagger Docs** | Auto-generated OpenAPI docs at `/api/docs` |

---

## 🏗️ Architecture

```
src/
├── transaction/
│   ├── application/                  # Business logic
│   │   ├── transaction.service.ts    # Transfer orchestration & ledger
│   │   └── processor.service.ts      # Bull queue processor
│   ├── domain/                       # Domain entities
│   │   └── entities/
│   │       ├── transaction.entity.ts # Transaction (amount, status, users)
│   │       └── ledger.entity.ts      # Ledger entries (debit/credit)
│   ├── infrastructure/               # External integrations
│   │   └── compliance.proto          # gRPC client for risk checks
│   └── presentation/                 # API layer
│       ├── transaction.controller.ts # REST endpoints
│       ├── event.controller.ts       # Kafka event handlers
│       └── dto/
│           └── transfer.dto.ts
├── common/
│   └── guards/
│       └── kyc.guard.ts              # KYC verification guard
├── config/                           # Validated configuration
├── database/                         # TypeORM data source
└── main.ts                           # Bootstrap (HTTP + Kafka)
```

---

## 🔌 API Endpoints

All endpoints require **JWT authentication** and **KYC approval**.

| Method | Endpoint | Guard | Description |
|--------|----------|-------|-------------|
| `POST` | `/transaction/transfer` | 🔒 JWT + KYC | Initiate a P2P transfer |
| `GET` | `/transaction/status/:transactionId` | 🔒 JWT + KYC | Get transaction status |

### Request Example

**Transfer**
```json
POST /transaction/transfer
{
  "toUserId": "uuid-of-recipient",
  "amount": 250.00,
  "currency": "USD",
  "description": "Payment for services"
}
```

### Response Example

```json
{
  "transactionId": "txn-uuid",
  "status": "pending",
  "amount": 250.00,
  "fromUserId": "sender-uuid",
  "toUserId": "recipient-uuid",
  "riskScore": 12,
  "createdAt": "2026-07-03T12:00:00Z"
}
```

---

## 🔗 Inter-Service Communication

### gRPC Client → Compliance Service

Before processing any transfer, this service calls the Compliance Service:

```protobuf
service ComplianceService {
    rpc CheckRisk(CheckRiskRequest) returns (CheckRiskResponse) {}
}

message CheckRiskRequest {
    string transaction_id = 1;
    string from_user_id = 2;
    string to_user_id = 3;
    double amount = 4;
}

message CheckRiskResponse {
    bool approved = 1;
    int32 risk_score = 2;
}
```

### Transfer Flow

```
1. Client → POST /transaction/transfer
2. Transaction Service → gRPC CheckRisk → Compliance Service
3. If approved:
   a. Create Transaction record (status: pending)
   b. Create Ledger entries (debit sender, credit receiver)
   c. Publish Kafka event → wallet_events (debit/credit)
   d. Publish Kafka event → transaction_events (completed)
   e. Update Transaction status → completed
4. If rejected:
   a. Create Transaction record (status: failed)
   b. Return risk rejection to client
```

---

## ⚡ Kafka Events

### Events Consumed

| Topic | Event | Action |
|-------|-------|--------|
| `wallet_events` | `balance_confirmed` | Confirms wallet debit/credit success |

### Events Produced

| Topic | Event | Payload |
|-------|-------|---------|
| `wallet_events` | `debit` / `credit` | `{ userId, amount, transactionId }` |
| `transaction_events` | `transaction_completed` | `{ fromUserId, toUserId, amount }` |

---

## 🛠️ Setup

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3002` | HTTP server port |
| `DB_HOST` | ✅ | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USERNAME` | ✅ | — | Database user |
| `DB_PASSWORD` | ✅ | — | Database password |
| `DB_NAME` | ✅ | — | Database name |
| `KAFKA_BROKERS` | No | `host.docker.internal:9092` | Kafka broker addresses |
| `JWT_SECRET` | ✅ | — | JWT secret (shared with auth-service) |
| `COMPLIANCE_GRPC_URL` | ✅ | — | Compliance service gRPC address |

### Quick Start

```bash
npm install
npm run start:dev
```

### Docker

```bash
docker build -t fintech-transaction .
docker run -p 3002:3002 --env-file .env fintech-transaction
```

---

## 📚 Swagger

```
http://localhost:3002/api/docs
```

---

[← Back to Main README](../README.md)
