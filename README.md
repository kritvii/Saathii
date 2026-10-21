# Saathi 

**A community platform that connects people with local opportunities, businesses and NGOs, built around UN Sustainable Development Goal 1: No Poverty.**

Saathi ("companion" in Hindi) helps people find volunteering work, events, internships and part-time jobs, and helps businesses and NGOs reach the people who can support them. It is a full-stack web application built with Node.js, Express and MongoDB.

> Academic mini-project for Web Programming Lab (WPL), mapped to SDG 1: No Poverty.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Sample Data](#sample-data)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Features

- **Opportunity board**: browse volunteering roles, events, internships and part-time jobs
- **Apply / withdraw**: apply to an opportunity and withdraw at any time
- **Save / unsave**: bookmark opportunities to revisit later
- **Personal dashboard**: see everything you applied to or saved, with full details
- **Post opportunities**: Business and NGO profiles can publish listings and see applicant counts
- **NGO directory**: browse listed NGOs working on poverty-related causes
- **Live statistics**: home-screen counts (opportunities, organisations, categories, members) are calculated live from the database
- **Secure accounts**: passwords hashed with bcrypt, sessions handled with JWT
- **Graceful degradation**: if MongoDB is unreachable, the site still loads, shows a clear notice and keeps retrying the connection

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | HTML, CSS, JavaScript (`public/`)   |
| Backend        | Node.js, Express 4                  |
| Database       | MongoDB with Mongoose 8             |
| Authentication | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Utilities      | `cors`, `dotenv`                    |

---

## Project Structure

```
Saathii/
├── public/            # Frontend: HTML, CSS and client-side JS
├── server.js          # Express app, routes, Mongoose models, seeding
├── seed-data.js       # Sample opportunities and NGO data
├── check-db.js        # Script to test the MongoDB connection
├── .env.example       # Template for environment variables
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm
- MongoDB, either installed locally or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone and install

```bash
git clone https://github.com/kritvii/Saathii.git
cd Saathii
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env` (see [Environment Variables](#environment-variables)).

### 3. Connect a database (pick one)

**Option A: Local MongoDB (easiest for development)**

On macOS with Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Keep this in your `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/saathi
```

**Option B: MongoDB Atlas (cloud, free tier)**

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Database Access**: add a user with a password.
3. **Network Access**: choose *Add current IP address*.
4. **Connect → Drivers → Node.js**: copy the connection string into `.env` and add the database name `saathi`:

   ```env
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/saathi?retryWrites=true&w=majority
   ```

   If your password contains symbols such as `@` or `#`, URL-encode them.

Verify the connection:

```bash
npm run db:check
```

### 4. Run the app

```bash
npm start        # production-style start
npm run dev      # auto-restarts when files change
```

Open **http://localhost:3004** in your browser.

On first start, the server creates the collections and seeds them with sample data (see [Sample Data](#sample-data)). Seeding is idempotent, so restarting never creates duplicates.

---

## Environment Variables

Create a `.env` file in the project root. Use `.env.example` as the reference for the full list.

```env
# Required
MONGODB_URI=mongodb://127.0.0.1:27017/saathi
JWT_SECRET=replace-with-a-long-random-string

# Optional
PORT=3004
SEED_SAMPLE_DATA=true     # set to false to skip sample opportunities
```

> ⚠️ Never commit your real `.env` file. It is listed in `.gitignore` for a reason.

---

## Available Scripts

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `npm start`        | Starts the server with Node                        |
| `npm run dev`      | Starts the server with auto-restart on file change |
| `npm run db:check` | Tests the connection to MongoDB                    |

---

## API Reference

Protected routes expect a JWT in the `Authorization: Bearer <token>` header.

| Feature                                   | Endpoint                                        | Auth     |
| ----------------------------------------- | ----------------------------------------------- | -------- |
| Health check (shows database status)      | `GET /api/health`                               | None     |
| Home-screen statistics, counted live      | `GET /api/stats`                                | None     |
| List opportunities (with applied / saved state) | `GET /api/opportunities`                  | Optional |
| Post an opportunity (Business / NGO)      | `POST /api/opportunities`                       | Required |
| Apply to an opportunity                   | `POST /api/opportunities/:id/apply`             | Required |
| Withdraw an application                   | `DELETE /api/opportunities/:id/apply`           | Required |
| Save an opportunity                       | `POST /api/opportunities/:id/save`              | Required |
| Unsave an opportunity                     | `DELETE /api/opportunities/:id/save`            | Required |
| Dashboard (applied, saved, posted + applicant counts) | `GET /api/dashboard`                | Required |

---

## Sample Data

On first run the server adds:

- **12 sample opportunities** across volunteering, events, internships and part-time jobs, tagged **Sample** in the UI. Set `SEED_SAMPLE_DATA=false` to skip them.
- **8 NGOs** shown on the NGOs page.

---

## Security Notes

This project is a starter and keeps the JWT in `localStorage`. Before using it in production, consider:

- Storing tokens in **HttpOnly cookies**
- Adding **rate limiting**
- Adding **email verification** and **password reset**
- Keeping `.env` out of version control and rotating any secret that was ever committed

---

## Roadmap

- [ ] Business registration with GST number verification
- [ ] Search wizard with location and service filters
- [ ] Email verification and password reset
- [ ] Deployment (Render / Railway + MongoDB Atlas)

---

## Author

Built by [@kritvii](https://github.com/kritvii).
