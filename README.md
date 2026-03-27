# LEDGER - Brutalist Expense Tracker

A fully functional Expense Tracker React app with a bold, distinctive UI theme inspired by **"brutalist financial ledger meets underground zine culture"**.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run both API server and React dev server
npm run dev:all

# Or run separately:
npm run server    # API server on http://localhost:3001
npm run dev       # React app on http://localhost:5173
```

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   └── transactions/
│       ├── index.js        # GET all, POST create
│       └── [id].js         # GET/PUT/DELETE single
├── server/
│   └── server.js           # Express API server (local dev)
├── src/
│   ├── App.jsx             # Main React component
│   ├── api.js              # API client
│   ├── main.jsx            # Entry point
│   └── index.css           # Base styles
├── db.json                 # JSON database
├── package.json
└── vercel.json             # Vercel configuration
```

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List all transactions |
| GET | `/api/transactions?month=YYYY-MM` | Filter by month |
| GET | `/api/transactions/:id` | Get single transaction |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

## 🎨 Design Features

- **Brutalist aesthetic**: Raw, typographic-driven, high-contrast
- **Color palette**: Off-white (#F5F0E8), Near-black (#0D0D0D), Acid yellow (#E8FF00), Blood red (#CC1400)
- **Typography**: Bebas Neue (headings) + Courier Prime (body)
- **No rounded corners**: Everything is sharp and rectangular
- **Grain texture overlay**: SVG noise filter for paper feel
- **Dot-grid pattern**: CSS radial-gradient background

## ✨ Features

- Transaction CRUD operations
- Income/Expense categorization
- Monthly navigation
- Category filtering
- Column sorting
- Inline editing
- Running balance calculation
- Category-wise expense tracking with visual bars
- Responsive design with mobile bottom tab bar
- localStorage-like persistence via JSON file

## 🚢 Deploy to Vercel

1. Push your code to GitHub

2. Import project in Vercel

3. Vercel will automatically detect the settings from `vercel.json`

4. Deploy!

### Note on Data Persistence

The `db.json` file is **not persistent** across Vercel deployments. For production use, consider:

- **Option A**: Use a database service (Supabase, Firebase, MongoDB Atlas)
- **Option B**: Use Vercel KV/Postgres
- **Option C**: Use Vercel Blob Storage for the JSON file

To connect to an external database, update `src/api.js` and the serverless functions in `api/`.

## 📝 Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run server     # Start Express API server
npm run dev:all    # Run both servers concurrently
```

## 🧱 Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Express.js (local) / Vercel Serverless Functions (production)
- **Styling**: CSS-in-JS (no external UI libraries)
- **Fonts**: Bebas Neue, Courier Prime (Google Fonts)
- **Deployment**: Vercel
