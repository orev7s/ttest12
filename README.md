# Auth & Subscription System

A full-stack authentication and subscription management system built with React, Node.js, Express, and SQLite.

## Features

- ✅ **User Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- ✅ **Subscription Management**: Free, Pro ($19.99), Ultra ($199.99), and Extreme ($499.99) plans
- ✅ **Plan Upgrades/Downgrades**: Seamless plan transitions with billing history
- ✅ **Dashboard**: User profile and current subscription display
- ✅ **Billing Page**: Complete billing history and subscription details
- ✅ **Simulated Payments**: Realistic payment flow without actual payment processing
- ✅ **Clean UI**: White/black minimalist design with Tailwind CSS v3

## Project Structure

```
auth-subscription-system/
├── server/                 # Node.js/Express backend
│   ├── src/
│   │   ├── index.js       # Main server file
│   │   ├── db.js          # Database setup
│   │   ├── middleware.js  # Auth middleware & JWT
│   │   └── routes/
│   │       ├── auth.js    # Authentication routes
│   │       └── subscriptions.js  # Subscription routes
│   └── package.json
├── client/                 # React frontend
│   ├── src/
│   │   ├── main.jsx       # Entry point
│   │   ├── App.jsx        # Main app component
│   │   ├── api.js         # API client
│   │   ├── index.css      # Tailwind styles
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Upgrade.jsx
│   │       └── Billing.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

2. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

### Running Individual Servers

**Backend only**:
```bash
npm run dev:server
```

**Frontend only**:
```bash
npm run dev:client
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user (requires token)

### Subscriptions

- `GET /api/subscriptions/plans` - Get all available plans
- `GET /api/subscriptions/current` - Get current subscription (requires token)
- `POST /api/subscriptions/upgrade` - Upgrade/downgrade plan (requires token)
- `GET /api/subscriptions/history` - Get billing history (requires token)

## Usage Flow

1. **Sign Up**: Create account with email, password, and name
2. **Login**: Authenticate with credentials
3. **Dashboard**: View profile and available plans
4. **Upgrade**: Select a new plan and confirm
5. **Billing**: View complete billing history and subscription details
6. **Logout**: Sign out from dashboard

## Database Schema

### Users Table
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT, UNIQUE)
- `password` (TEXT, hashed)
- `name` (TEXT)
- `plan` (TEXT, default: 'free')
- `created_at` (DATETIME)

### Subscriptions Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `plan` (TEXT)
- `price` (REAL)
- `status` (TEXT, default: 'active')
- `started_at` (DATETIME)
- `next_billing_date` (DATETIME)

### Billing History Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `subscription_id` (TEXT, FOREIGN KEY)
- `amount` (REAL)
- `plan` (TEXT)
- `type` (TEXT: 'upgrade', 'downgrade', 'cancellation')
- `status` (TEXT, default: 'completed')
- `created_at` (DATETIME)

## Authentication

- **JWT Tokens**: 7-day expiration
- **Password Hashing**: bcryptjs (10 salt rounds)
- **Token Storage**: localStorage (client-side)
- **Protected Routes**: All subscription endpoints require valid JWT token

## Styling

- **Framework**: Tailwind CSS v3
- **Color Scheme**: Black and white (light mode)
- **Components**: Custom built with Tailwind utilities
- **Responsive**: Mobile-first design

## Testing the System

### Test Account
```
Email: test@example.com
Password: password123
Name: Test User
```

### Test Flow
1. Sign up with test credentials
2. View dashboard with Free plan
3. Upgrade to Pro ($19.99)
4. Check billing history
5. Downgrade to Free
6. View updated subscription status

## Important Notes

⚠️ **This is a simulated payment system**:
- No actual payments are processed
- All transactions are stored locally in SQLite
- Suitable for development and demonstration purposes
- For production, integrate with real payment providers (Stripe, PayPal, etc.)

## Future Enhancements

- Real payment processing (Stripe integration)
- Email notifications
- Invoice generation (PDF)
- Admin dashboard
- Usage analytics
- Plan features/limits
- Promo codes
- Multiple payment methods

## License

MIT
