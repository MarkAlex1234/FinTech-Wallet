<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka" />
</p>

# 💰 Wallet Service

> **Digital wallet management** with balance tracking, deposits, withdrawals, and a full audit trail.

Manages per-user wallets created automatically upon registration (via Kafka event). Supports deposits, withdrawals, and balance queries with KYC enforcement. Uses Redis for balance caching and gRPC to resolve user identity from the Auth Service.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Auto Wallet Creation** | Wallet created on `user_registered` Kafka event |
| **Balance Management** | Deposit, withdrawal, and real-time balance queries |
| **KYC Guard** | Deposit/withdrawal requires approved KYC status |
| **Audit Trail** | Every balance change is logged in `WalletAudit` entity |
| **Redis Caching** | Wallet balance cached for fast reads |
| **Event-Driven** | Listens to Kafka topics and publishes `wallet_events` |
| **gRPC Client** | Calls Auth Service for user contact resolution |
| **Swagger Docs** | Auto-generated OpenAPI docs at `/api/docs` |

---

## 🏗️ Architecture

```
src/
├── wallet/
│   ├── application/             # Business logic
│   │   └── wallet.service.ts    # Deposit, withdraw, balance ops
│   ├── domain/                  # Domain entities
│   │   └── entities/
│   │       ├── wallet.entity.ts       # Wallet (userId, balance, currency)
│   │       └── wallet-audit.entity.ts # Audit log (type, amount, timestamp)
│   ├── infrastructure/          # External integrations
│   │   └── auth.proto           # gRPC client proto for auth lookups
│   └── presentation/            # API layer
│       ├── wallet.controller.ts  # REST endpoints
│       ├── event.controller.ts   # Kafka event handlers
│       └── dto/
│           ├── deposit.dto.ts
│           └── withdrawal.dto.ts
├── common/
│   └── guards/
│       └── kyc.guard.ts         # KYC verification guard
├── config/                      # Validated configuration
├── database/                    # TypeORM data source
└── main.ts                      # Bootstrap (HTTP + Kafka)
```

---

## 🔌 API Endpoints

All endpoints require **JWT authentication** (`Authorization: Bearer <token>`).

| Method | Endpoint | Guard | Description |
|--------|----------|-------|-------------|
| `GET` | `/wallet/balance` | 🔒 JWT | Get current wallet balance |
| `POST` | `/wallet/deposit` | 🔒 JWT + KYC | Deposit funds into wallet |
| `POST` | `/wallet/withdrawal` | 🔒 JWT + KYC | Withdraw funds from wallet |

### Request Examples

**Deposit**
```json
POST /wallet/deposit
{
  "amount": 500.00,
  "currency": "USD"
}
```

**Withdrawal**
```json
POST /wallet/withdrawal
{
  "amount": 100.00,
  "currency": "USD"
}
```

---

## ⚡ Kafka Events

### Events Consumed

| Topic | Event | Action |
|-------|-------|--------|
| `user_events` | `user_registered` | Creates a new wallet for the user |
| `transaction_events` | `debit` / `credit` | Updates wallet balance for transfers |

### Events Produced

| Topic | Event | Payload |
|-------|-------|---------|
| `wallet_events` | `balance_updated` | `{ userId, newBalance, phone }` |
| `wallet_events` | `bank_linked` | `{ userId, phone }` |

---

## 🛠️ Setup

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | HTTP server port |
| `DB_HOST` | ✅ | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USERNAME` | ✅ | — | Database user |
| `DB_PASSWORD` | ✅ | — | Database password |
| `DB_NAME` | ✅ | — | Database name |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `KAFKA_BROKERS` | No | `host.docker.internal:9092` | Kafka broker addresses |
| `JWT_SECRET` | ✅ | — | JWT secret (shared with auth-service) |

### Quick Start

```bash
npm install
npm run start:dev
```

### Docker

```bash
docker build -t fintech-wallet .
docker run -p 3001:3001 --env-file .env fintech-wallet
```

---

## 📚 Swagger

```
http://localhost:3001/api/docs
```

---

[← Back to Main README](../README.md)
