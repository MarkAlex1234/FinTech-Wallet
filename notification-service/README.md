<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/SendGrid-1A82E2?style=for-the-badge&logo=sendgrid&logoColor=white" alt="SendGrid" />
  <img src="https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white" alt="Twilio" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/Handlebars-000000?style=for-the-badge&logo=handlebarsdotjs&logoColor=white" alt="Handlebars" />
</p>

# 📨 Notification Service

> **Multi-channel notification dispatch** — email via SendGrid, SMS via Twilio, with Handlebars templating and Bull queue processing.

Listens to Kafka events from all other services (auth, wallet, transaction, compliance) and dispatches contextual notifications through email and SMS channels. Uses Bull queues for reliable async delivery and Handlebars templates for rich HTML emails.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Email Delivery** | Transactional emails via SendGrid API |
| **SMS Delivery** | Text messages via Twilio API |
| **Template Engine** | Handlebars-based HTML email templates |
| **Event-Driven** | Listens to 4 Kafka topics across all services |
| **Queue Processing** | Bull (Redis) queues for reliable, retryable delivery |
| **Notification Log** | All notifications persisted for audit/debugging |
| **Swagger Docs** | Auto-generated OpenAPI docs at `/api/docs` |

---

## 🏗️ Architecture

```
src/
├── notification/
│   ├── application/                      # Business logic
│   │   ├── notification.service.ts       # Queue & dispatch logic
│   │   └── processor.service.ts          # Bull queue processor
│   ├── domain/                           # Domain entities
│   │   └── entities/
│   │       └── notification.entity.ts    # Notification log record
│   └── presentation/                     # API layer
│       ├── notification.controller.ts    # REST endpoints
│       └── event.controller.ts           # Kafka event listeners
├── email/
│   ├── template.service.ts              # Handlebars template compiler
│   └── templates/                       # HTML email templates
│       ├── verify-email.hbs             # Email verification template
│       └── reset-password.hbs           # Password reset template
├── config/                              # Validated configuration
├── database/                            # TypeORM data source
└── main.ts                              # Bootstrap (HTTP + Kafka)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notification` | — | List notifications (for admin/debugging) |

---

## ⚡ Kafka Event Listeners

This service is the **central consumer hub** — it listens to events from every other service in the platform:

### `user_events` (from Auth Service)

| Event | Channel | Action |
|-------|---------|--------|
| `user_registered` | 📧 Email | Send welcome email |
| `email_verify` | 📧 Email | Send verification OTP (Handlebars template) |
| `forget_password` | 📧 Email | Send password reset link (Handlebars template) |
| `phone_verify` | 📱 SMS | Send phone verification OTP via Twilio |

### `wallet_events` (from Wallet Service)

| Event | Channel | Action |
|-------|---------|--------|
| `balance_updated` | 📧 Email | Notify user of new balance |
| `bank_linked` | 📧 Email | Confirm bank account linked |

### `transaction_events` (from Transaction Service)

| Event | Channel | Action |
|-------|---------|--------|
| `transaction_completed` | 📧 Email | Confirm transfer completion with amount |

### `compliance_events` (from Compliance Service)

| Event | Channel | Action |
|-------|---------|--------|
| `risk_alert` | 📧 Email | Alert user of high-risk detection |

---

## 📧 Email Templates

The service uses **Handlebars** for dynamic HTML email rendering:

| Template | Variables | Used For |
|----------|-----------|----------|
| `verify-email.hbs` | `name`, `code`, `link` | Email OTP verification |
| `reset-password.hbs` | `name`, `resetLink` | Password reset flow |

Templates are compiled at runtime via `TemplateService`:

```typescript
const html = templateService.compileTemplate(Template.VERIFY_EMAIL, {
  name: "user@example.com",
  code: "123456",
  link: "https://app.fintech.com/verify?token=..."
});
```

---

## 🔄 Processing Flow

```
Kafka Event ──► Event Controller ──► NotificationService.queueNotification()
                                           │
                                           ▼
                                     Bull Queue (Redis)
                                           │
                                           ▼
                                   ProcessorService
                                     │           │
                                     ▼           ▼
                              SendGrid API   Twilio API
                              (email)        (sms)
                                     │           │
                                     ▼           ▼
                              Notification Entity
                              (persisted to DB)
```

---

## 🛠️ Setup

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3004` | HTTP server port |
| `DB_HOST` | ✅ | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USERNAME` | ✅ | — | Database user |
| `DB_PASSWORD` | ✅ | — | Database password |
| `DB_NAME` | ✅ | — | Database name |
| `KAFKA_BROKERS` | No | `host.docker.internal:9092` | Kafka broker addresses |
| `SENDGRID_API_KEY` | ✅ | — | SendGrid API key (`SG.xxx`) |
| `SENDGRID_FROM_EMAIL` | ✅ | — | Sender email address |
| `TWILIO_ACCOUNT_SID` | ✅ | — | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | ✅ | — | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | ✅ | — | Twilio sender phone number |
| `JWT_SECRET` | ✅ | — | JWT secret (shared) |

### Quick Start

```bash
npm install
npm run start:dev
```

### Docker

```bash
docker build -t fintech-notification .
docker run -p 3004:3004 --env-file .env fintech-notification
```

---

## 📚 Swagger

```
http://localhost:3004/api/docs
```

---

[← Back to Main README](../README.md)
