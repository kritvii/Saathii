# Saathi — MongoDB version

Express + MongoDB (Mongoose) + bcrypt passwords + JWT sessions.

## 1. Set up (macOS)
```bash
cd saathi-mongodb
npm install
```

## 2. Connect the database — pick one

**A. Local MongoDB (easiest for development)**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```
Keep `MONGODB_URI=mongodb://127.0.0.1:27017/saathi` in `.env`.

**B. MongoDB Atlas (cloud, free tier)**
1. Create a free cluster at cloud.mongodb.com.
2. Database Access → add a user with a password.
3. Network Access → *Add current IP address*.
4. Connect → Drivers → Node.js → copy the string and put it in `.env`, adding the database name `saathi`:
   `MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/saathi?retryWrites=true&w=majority`
   (If the password has symbols like `@` or `#`, URL-encode them.)

Check the connection:
```bash
npm run db:check
```

## 3. Run
```bash
npm start            # or: npm run dev  (auto-restarts on file changes)
```
Open http://localhost:3004. On first start the server creates the collections and adds:
- 12 sample opportunities (volunteering, events, internships, part-time jobs) — tagged **Sample** in the UI. Set `SEED_SAMPLE_DATA=false` to skip them.
- The 8 listed NGOs shown on the NGOs page.

Seeding is idempotent: restarting never creates duplicates.

`GET /api/health` shows whether the database is connected. If MongoDB is down, the site still loads, shows a clear notice, and the server keeps retrying.

## What's where
| Feature | API |
|---|---|
| Home-screen numbers (opportunities, organisations, categories, members) | `GET /api/stats` — counted live from MongoDB |
| Opportunity list with your applied/saved state | `GET /api/opportunities` (token optional) |
| Apply / withdraw | `POST` / `DELETE /api/opportunities/:id/apply` |
| Save / unsave | `POST` / `DELETE /api/opportunities/:id/save` |
| Dashboard (applied + saved with full details, posted by you + applicant counts) | `GET /api/dashboard` |
| Post an opportunity (Business / NGO profiles) | `POST /api/opportunities` — form on the dashboard |

## Security notes
The JWT is kept in localStorage for this starter. For production, prefer HttpOnly cookies, rate limiting, email verification and password reset. Never commit `.env`.
