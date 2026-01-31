# SHRN-v3 - URL Shortener Platform

A full-stack URL shortener application with comprehensive analytics, user authentication, and link management capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [License](#license)

## 🌟 Overview

SHRN-v3 is a modern URL shortener platform that allows users to create, manage, and track short links with detailed analytics. The application provides geo-location tracking, device detection, and browser analytics for each redirect, giving users valuable insights into their link performance.

## ✨ Features

### User Management
- **User Registration & Authentication** - Secure sign-up and sign-in with JWT tokens
- **Email Verification** - Token-based email verification system (in development)
- **Password Security** - Bcrypt password hashing with salt rounds

### Link Management
- **Short Link Generation** - Create short URLs with unique 8-character codes
- **Link Reactivation** - Automatically reactivate previously deactivated links
- **Custom Expiration** - Set expiration dates for short links
- **Active/Inactive Status** - Toggle link status to control accessibility
- **CRUD Operations** - Full create, read, update, and delete functionality

### Analytics & Tracking
- **Real-time Analytics** - Track every redirect with detailed metrics
- **Geographic Data** - Country-level geo-location using MaxMind GeoLite2
- **Device Detection** - Identify device types (desktop, mobile, tablet)
- **Browser Analytics** - Track browser types and versions
- **Privacy-Focused** - IP addresses are hashed (SHA-256) for privacy
- **Time-Series Data** - Timestamp-based analytics with indexed queries

### Security & Privacy
- **JWT Authentication** - Secure token-based authentication (72-hour expiry)
- **IP Hashing** - Privacy-preserving analytics through SHA-256 IP hashing
- **CORS Protection** - Configured CORS for frontend integration
- **Data Validation** - Zod schema validation for all inputs

## 🛠 Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Express.js 5](https://expressjs.com/) - Web application framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database
- **ORM**: [Prisma 7](https://www.prisma.io/) - Next-generation ORM
- **Authentication**: JWT + Bcrypt
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **React**: 19.2.3

### Key Dependencies
- **maxmind** - Geo-location services
- **ua-parser-js** - User agent parsing
- **pg** - PostgreSQL client with Prisma adapter
- **cors** - Cross-origin resource sharing

## 📁 Project Structure

```
shrn-v3/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   └── migrations/                # Database migrations
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userControllers.ts     # User auth logic
│   │   │   ├── shortLinkControllers.ts # Link CRUD operations
│   │   │   └── redirectionController.ts # Redirect & analytics
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts      # JWT verification
│   │   ├── routes/
│   │   │   ├── userRoutes.ts          # User endpoints
│   │   │   └── shortLinkRoutes.ts     # Link management endpoints
│   │   ├── utils/
│   │   │   ├── analyticsUtils.ts      # Analytics helper functions
│   │   │   ├── prismaClient.ts        # Prisma client instance
│   │   │   ├── createRandomString.ts  # Short code generator
│   │   │   └── sendEmail.ts           # Email service
│   │   ├── types/
│   │   │   └── types.ts               # Zod schemas & TypeScript types
│   │   ├── generated/prisma/          # Generated Prisma Client
│   │   └── index.ts                   # Application entry point
│   ├── GeoLite2-Country.mmdb          # MaxMind geo database
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx                 # Root layout
    │   ├── page.tsx                   # Home page
    │   └── globals.css                # Global styles
    ├── public/                        # Static assets
    ├── package.json
    └── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- **Bun** 1.0 or higher
- **PostgreSQL** database
- **Node.js** 20+ (for frontend)
- MaxMind GeoLite2 Country database

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shrn-v3/backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/shrn_db"
   JWT_SECRET="your-secret-key-here"
   PORT=3000
   ```

4. **Run database migrations**
   ```bash
   bunx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   bunx prisma generate
   ```

6. **Download GeoLite2 Database**
   - Download GeoLite2-Country.mmdb from [MaxMind](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data)
   - Place it in the backend root directory

7. **Start the development server**
   ```bash
   bun run dev
   ```

   The server will start on `http://localhost:3000`

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

All protected endpoints require a JWT token in the `token` header:
```
token: <your-jwt-token>
```

### Endpoints

#### User Routes (`/v1/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/user/signup` | ❌ | Register a new user |
| POST | `/v1/user/signin` | ❌ | Sign in and receive JWT token |
| POST | `/v1/user/verification` | ✅ | Verify user email (in development) |

**Sign Up Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "JohnDoe"
}
```

**Sign In Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Sign In Response:**
```json
{
  "success": true,
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "error": null,
  "msg": "SignedIn successfully"
}
```

#### Short Link Routes (`/v1/shortLink`)

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/shortLink/generateShortLink` | Create a new short link |
| GET | `/v1/shortLink/getAllShortLinks` | Get all user's short links |
| GET | `/v1/shortLink/getSingleShortLink/:shortLinkId` | Get specific short link details |
| DELETE | `/v1/shortLink/deleteShortLink/:shortLinkId` | Delete a short link |
| PATCH | `/v1/shortLink/updateShortLink/:shortLinkId` | Update short link properties |
| GET | `/v1/shortLink/getShortLinkAnalytics/:shortLinkId` | Get analytics for a short link |

**Generate Short Link Request:**
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "expiresAt": "2026-12-31T23:59:59Z"  // Optional
}
```

**Generate Short Link Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxy1234567890",
    "originalUrl": "https://example.com/very/long/url",
    "shortCode": "aBcD1234",
    "userId": "clxy0987654321",
    "createdAt": "2026-01-31T10:00:00Z",
    "updatedAt": "2026-01-31T10:00:00Z",
    "expiresAt": "2026-12-31T23:59:59Z",
    "isActive": true
  },
  "error": null,
  "msg": "Short link generated successfully"
}
```

#### Redirection Route

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/re/:shortCode` | ❌ | Redirect to original URL and log analytics |

**Usage:**
```
http://localhost:3000/re/aBcD1234
```

This endpoint:
1. Validates the short code
2. Redirects (302) to the original URL
3. Logs analytics data (IP hash, country, browser, device)

## 🗄 Database Schema

### User
- `id` - CUID primary key
- `email` - Unique email address
- `name` - Optional username
- `hashedPassword` - Bcrypt hashed password
- `isVerified` - Email verification status
- `createdAt`, `updatedAt` - Timestamps

### ShortUrl
- `id` - CUID primary key
- `originalUrl` - Full original URL (text)
- `shortCode` - Unique 8-character code
- `userId` - Foreign key to User
- `expiresAt` - Optional expiration date
- `isActive` - Toggle link availability
- `createdAt`, `updatedAt` - Timestamps

### RedirectLog
- `id` - CUID primary key
- `shortUrlId` - Foreign key to ShortUrl
- `timestamp` - Redirect time
- `ipHash` - SHA-256 hashed IP address
- `browser` - Browser name/version
- `country` - 2-letter country code
- `device` - Device type (desktop/mobile/tablet)

**Indexed:** `(shortUrlId, timestamp)` for efficient analytics queries

### VerificationToken
- `userId` - Foreign key to User
- `token` - Unique verification token
- `expires` - Token expiration datetime
- **Composite primary key:** `(userId, token)`

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3000

# Optional: Email service configuration (for verification)
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
```

## 💻 Development

### Available Scripts (Backend)

```bash
# Development with auto-reload
bun run dev

# Production start
bun run start

# Database migrations
bunx prisma migrate dev

# Generate Prisma Client
bunx prisma generate

# Open Prisma Studio (database GUI)
bunx prisma studio

# Reset database (⚠️ destructive)
bunx prisma migrate reset
```

### Code Style

- **TypeScript** for type safety
- **Zod** for runtime validation
- **Async/await** for asynchronous operations
- **Try/catch** for error handling
- Consistent response format: `{ success, data, error, msg }`

## 🔒 Security Features

1. **Password Hashing** - Bcrypt with 8 salt rounds
2. **JWT Tokens** - 72-hour expiration, secret-based signing
3. **IP Privacy** - SHA-256 hashing of IP addresses
4. **SQL Injection Protection** - Prisma parameterized queries
5. **CORS Configuration** - Restricted to frontend origin
6. **Input Validation** - Zod schema validation on all inputs

## 📊 Analytics Capabilities

The platform tracks:
- **Geographic Distribution** - Country-level location data
- **Device Breakdown** - Desktop vs mobile vs tablet
- **Browser Analytics** - Browser types and versions
- **Time-Series Data** - Redirect timestamps for trend analysis
- **Privacy-Preserving** - Hashed IPs prevent user identification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

---

**Built with ❤️ using Bun, Express, Prisma and Typescript**
