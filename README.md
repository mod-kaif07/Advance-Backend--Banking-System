# README.md

# Advance Banking System Backend

🚀 **Live Project:** [https://advance-backend-banking-system.onrender.com/](https://advance-backend-banking-system.onrender.com/)

A robust, production-ready backend for a modern banking system.  
Built with Node.js, Express.js, MongoDB, and JWT authentication, this system provides secure, auditable, and scalable APIs for banking operations.

---

## Overview

This project solves the problem of building a secure, auditable, and extensible backend for digital banking platforms.  
It supports user management, role-based access, double-entry ledger accounting, idempotent transactions, JWT authentication with token blacklisting, and email notifications.

---

## Key Features

- **User & Role Management:** Secure registration, login, and RBAC.
- **JWT Authentication:** Secure, stateless sessions with cookie support.
- **Token Blacklisting:** Secure logout and token revocation.
- **Ledger-based Accounting:** Double-entry, auditable transaction records.
- **Idempotent Transactions:** Prevents duplicate transfers.
- **Email Notifications:** Transactional emails for critical events.
- **API-First Design:** RESTful, versioned endpoints.
- **Error Handling:** Consistent, structured error responses.
- **Security Best Practices:** Rate limiting, input validation, and more.

---

## Tech Stack

- **Node.js** (Express.js)
- **MongoDB** (Mongoose ODM)
- **JWT** (jsonwebtoken)
- **Nodemailer** (email)
- **dotenv** (env config)
- **Cookie-parser**
- **Helmet, CORS** (security)

---

## System Architecture

1. **Client** sends API requests (with JWT in HTTP-only cookies).
2. **Express.js** routes requests to controllers.
3. **Controllers** validate, authorize, and process business logic.
4. **Mongoose Models** interact with MongoDB (with transaction sessions).
5. **Ledger** records all financial events (double-entry).
6. **Email Service** sends notifications.
7. **Middleware** handles authentication, idempotency, and error handling.

![Architecture Diagram](docs/architecture.png) <!-- Add your diagram here -->

---

## Installation & Setup

```bash
git clone <repo-url>
cd Advance-Backend- Banking System
npm install
cp .env.example .env
# Edit .env with your secrets
npm run dev
```

---

## Environment Variables

`.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/banking
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
```

---

## Running Locally

```bash
npm run dev
# Server runs at http://localhost:3000
```

---

## API Overview

| Method | Endpoint           | Description                 | Auth Required | Roles      |
| ------ | ------------------ | --------------------------- | ------------- | ---------- |
| POST   | /api/auth/register | Register new user           | No            | -          |
| POST   | /api/auth/login    | Login and get JWT           | No            | -          |
| POST   | /api/auth/logout   | Logout (blacklist token)    | Yes           | All        |
| GET    | /api/users/me      | Get current user profile    | Yes           | All        |
| GET    | /api/users/:id     | Get user by ID (admin only) | Yes           | Admin      |
| POST   | /api/transactions  | Create new transaction      | Yes           | User/Admin |
| GET    | /api/transactions  | List transactions           | Yes           | User/Admin |
| ...    | ...                | ...                         | ...           | ...        |

---

## Authentication Flow

- On login, server issues JWT in an HTTP-only cookie.
- All protected routes require valid JWT.
- On logout, JWT is blacklisted (cannot be reused).
- Token expiry and blacklist checked on every request.

---

## Transaction Flow

- All transfers use double-entry ledger (debit/credit).
- Each transaction is atomic (MongoDB session).
- Idempotency key required to prevent duplicates.

---

## Error Handling & Status Codes

- **400**: Bad Request (validation, missing params)
- **401**: Unauthorized (invalid/missing JWT)
- **403**: Forbidden (insufficient role)
- **404**: Not Found (resource missing)
- **409**: Conflict (duplicate, idempotency)
- **500**: Internal Server Error

---

## Security Practices

- JWT in HTTP-only cookies
- Token blacklist on logout
- Rate limiting (per IP)
- Input validation & sanitization
- Secure password hashing (bcrypt)
- Helmet, CORS, and secure headers

---

## Project Structure

```
src/
  app.js                # Express app setup
  config/               # DB and config
  controller/           # Route controllers
  middleware/           # Auth, error, idempotency
  models/               # Mongoose schemas
  routes/               # API route definitions
  services/             # Email, etc.
```

---

## Deployment Guide

- Use process manager (PM2, systemd) for Node.js.
- Set NODE_ENV=production.
- Use HTTPS (TLS) in production.
- Store secrets securely (not in repo).
- Enable MongoDB authentication & backups.
- Configure CORS for your frontend domain.

---

## Future Improvements

- 2FA/MFA authentication
- Audit logging & analytics
- Webhooks for external integrations
- Admin dashboard
- OpenAPI/Swagger docs
- Automated testing & CI/CD

---

For full technical documentation, see [`docs/`](docs/).
