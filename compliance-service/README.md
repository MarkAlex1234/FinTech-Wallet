<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/gRPC-244C5A?style=for-the-badge&logo=google&logoColor=white" alt="gRPC" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

# 🛡️ Compliance Service

> **Real-time risk assessment and regulatory compliance engine** for financial transactions.

Provides synchronous risk scoring via gRPC for the Transaction Service and asynchronous compliance monitoring via Kafka. Evaluates transactions against configurable risk rules and logs all assessments for audit purposes.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Risk Scoring** | Real-time transaction risk assessment with numerical scores |
| **gRPC Server** | `CheckRisk` RPC for synchronous compliance checks |
| **Risk Logging** | All assessments persisted in `RiskLog` entity |
| **Event Publishing** | High-risk alerts sent to Kafka for notification dispatch |
| **Manual Check** | REST endpoint for testing and manual risk evaluation |
| **Swagger Docs** | Auto-generated OpenAPI docs at `/api/docs` |

---

## 🏗️ Architecture

```
src/
├── compliance/
│   ├── application/                    # Business logic
│   │   └── compliance.service.ts       # Risk scoring algorithms
│   ├── domain/                         # Domain entities
│   │   └── entities/
│   │       └── risk-log.entity.ts      # Risk assessment log
│   ├── presentation/                   # API layer
│   │   ├── compliance.controller.ts    # REST endpoint (manual check)
│   │   └── grpc.controller.ts          # gRPC server handler
│   └── compliance.proto                # gRPC service definition
├── config/                             # Validated configuration
├── database/                           # TypeORM data source
└── main.ts                             # Bootstrap (HTTP + Kafka + gRPC)
```

---

## 🔌 API Endpoints

### REST

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/compliance/check` | — | Manual risk check (for testing) |

### gRPC Server

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
    bool approved = 1;       // true = safe, false = blocked
    int32 risk_score = 2;    // 0-100, higher = riskier
}
```

### Risk Check Request Example

```json
POST /compliance/check
{
  "transaction_id": "txn-uuid",
  "from_user_id": "sender-uuid",
  "to_user_id": "receiver-uuid",
  "amount": 10000.00
}
```

### Response Example

```json
{
  "approved": false,
  "risk_score": 87
}
```

---

## 🔗 How It Integrates

```
Transaction Service ──── gRPC CheckRisk ────► Compliance Service
                                                     │
                                                     ├── Evaluate risk rules
                                                     ├── Log to RiskLog table
                                                     ├── If high risk:
                                                     │   └── Publish Kafka → compliance_events
                                                     │                            │
                                                     │                            ▼
                                                     │                   Notification Service
                                                     │                   (sends risk alert)
                                                     │
                                                     └── Return approved/risk_score
```

---

## ⚡ Kafka Events

### Events Produced

| Topic | Event | Payload | Trigger |
|-------|-------|---------|---------|
| `compliance_events` | `risk_alert` | `{ email, riskScore, transactionId }` | When risk score exceeds threshold |

### Events Consumed

| Topic | Event | Action |
|-------|-------|--------|
| `transaction_events` | `transaction_created` | Passive monitoring / batch analysis |

---

## 🛠️ Setup

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3003` | HTTP server port |
| `DB_HOST` | ✅ | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USERNAME` | ✅ | — | Database user |
| `DB_PASSWORD` | ✅ | — | Database password |
| `DB_NAME` | ✅ | — | Database name |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `KAFKA_BROKERS` | No | `host.docker.internal:9092` | Kafka broker addresses |
| `GRPC_HOST` | ✅ | — | gRPC server bind address |
| `GRPC_PORT` | No | `5679` | gRPC server port |
| `JWT_SECRET` | ✅ | — | JWT secret (shared) |

### Quick Start

```bash
npm install
npm run start:dev
```

### Docker

```bash
docker build -t fintech-compliance .
docker run -p 3003:3003 --env-file .env fintech-compliance
```

---

## 📚 Swagger

```
http://localhost:3003/api/docs
```

---

[← Back to Main README](../README.md)
