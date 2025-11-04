# Quick Setup Guide

## What's Included

This is a **complete, working full-stack authentication and subscription management system** with:

✅ **Backend**: Node.js + Express + SQLite  
✅ **Frontend**: React + Vite + Tailwind CSS v3  
✅ **Features**: Auth, subscriptions, billing, plan upgrades/downgrades  
✅ **Database**: Pre-configured SQLite with migrations  
✅ **Styling**: Clean white/black minimalist design  

## Installation & Running

### 1. Extract the ZIP file

```bash
unzip auth-subscription-system.zip
cd auth-subscription-system
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Start both servers

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### 4. Test the system

1. Go to http://localhost:3000
2. Sign up with any email/password
3. View dashboard with Free plan
4. Upgrade to Pro/Ultra/Extreme
5. Check billing history
6. Downgrade or change plans

## Individual Commands

```bash
# Start only backend
npm run dev:server

# Start only frontend
npm run dev:client

# Build frontend
npm run build:client

# Build everything
npm run build
```

## Push to GitHub

Once you're ready to push to your repo:

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: full-stack auth & subscription system"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/upgrade` - Change plan
- `GET /api/subscriptions/history` - Get billing history

## Database

SQLite database is automatically created at `server/auth.db` on first run.

Tables:
- `users` - User accounts
- `subscriptions` - Active subscriptions
- `billing_history` - Transaction history

## Key Files

```
server/
├── src/index.js           # Main server
├── src/db.js              # Database setup
├── src/middleware.js      # JWT auth
└── src/routes/            # API routes

client/
├── src/App.jsx            # Main app
├── src/api.js             # API client
├── src/context/           # Auth state
└── src/pages/             # All pages
```

## Important Notes

⚠️ **Simulated Payment System**
- No real payments are processed
- All data stored locally in SQLite
- Perfect for development/demo
- For production, integrate Stripe/PayPal

## Troubleshooting

**Port already in use?**
```bash
# Change port in server/src/index.js or client/vite.config.js
```

**Dependencies not installing?**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Database issues?**
```bash
# Delete and recreate
rm server/auth.db
npm run dev:server
```

## Next Steps

1. ✅ Extract and install
2. ✅ Run `npm run dev`
3. ✅ Test the system
4. ✅ Push to GitHub
5. ✅ Deploy (Vercel, Heroku, etc.)

Enjoy! 🚀
