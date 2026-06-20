# EcoTrack AI 🌱

**Calculate, track, and reduce your personal carbon footprint with the help of AI.**

EcoTrack AI is a modern web application that empowers individuals to understand their environmental impact through an interactive carbon footprint calculator, personalized AI-driven sustainability advice, gamified daily challenges, and rich visual analytics — all wrapped in a premium green-themed UI.

---

## Features

### 🧮 Carbon Footprint Calculator
- Multi-step wizard (Transport, Energy, Diet, Waste, Shopping) with real-time calculation
- Sliders, toggles, and selection cards for fine-grained input
- Category breakdown and emission rating (A+ to C) with tree-equivalent offset metric
- Results logged to your personal dashboard for trend tracking

### 🤖 AI Sustainability Advisor
- Conversational chatbot powered by **OpenAI GPT-4o-mini** (with intelligent heuristic fallback)
- Personalized advice based on your actual logged footprint data
- Every recommendation includes estimated kg CO₂ savings and relatable comparisons (tree planting, car km, phone charges)
- Daily Action suggestions for immediate impact
- Contextual topic suggestions based on your highest emission category

### 📊 Dashboard & Analytics
- KPI widgets: monthly footprint, goal alignment bar, forest absorption, AI coach link
- Interactive Recharts visualizations: donut pie (emissions share), area chart (trend vs goal), bar chart (benchmarks)
- Historical log table with per-category breakdown
- Unit toggle between kg CO₂ and tree offset

### 🏆 Daily Challenges
- Gamified eco-tasks (no single-use plastic, active commuting, meatless dinner, etc.)
- Points and CO₂-saved tracking with per-day completion limits
- Sustainability Tips Library: 5 categories with actionable guidance
- Seamless handoff to AI coach for personalized plans

### 🔐 Dual-Mode Storage
- **Cloud mode** with Firebase Authentication & Firestore when configured
- **Sandbox mode** with localStorage for offline/development use
- Seamless auto-detection — no code changes required

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.9 (App Router) |
| **UI Library** | React 19.2.4 |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts 3.8.1 |
| **Icons** | Lucide React 1.21 |
| **AI Engine** | OpenAI API v6 (GPT-4o-mini) + custom rule-based fallback |
| **Authentication** | Firebase Auth v12 (optional, localStorage sandbox fallback) |
| **Database** | Firestore v12 (optional, localStorage sandbox fallback) |
| **Language** | JavaScript (ES2022) |
| **Runtime** | Node.js 18+ |

---

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ecotrack-ai.git
cd ecotrack-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables (Optional)

Copy `.env.local` and add your API keys to enable cloud features:

```env
# OpenAI API Key — enables real AI chat (without it, a rule-based engine is used)
OPENAI_API_KEY=sk-your-key-here

# Firebase Configuration — enables cloud auth & data sync (without it, localStorage is used)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

The app runs in **sandbox mode** by default using localStorage — no configuration needed to get started.

### Build for Production

```bash
npm run build
npm start
```

---

## Screenshots

| Homepage | Carbon Calculator |
|---|---|
| *Animated hero with stats cards and feature grid* | *6-step wizard with real-time footprint preview* |

| Dashboard & Charts | AI Chatbot |
|---|---|
| *KPI widgets, donut/area/bar charts, log history* | *Personalized GPT-4o-mini sustainability advice* |

| Daily Challenges | Challenges Library |
|---|---|
| *Gamified tasks with points and CO2 tracking* | *5-category tips with tabbed interface* |

> Screenshots are placeholder references. Actual UI may vary.

---

## Project Structure

```
src/
├── app/
│   ├── api/assistant/route.js    # AI chatbot API endpoint
│   ├── calculator/page.js        # Multi-step carbon footprint wizard
│   ├── challenges/page.js        # Daily eco-tasks & tips library
│   ├── chatbot/page.js           # AI sustainability advisor chat
│   ├── dashboard/page.js         # Analytics dashboard with charts
│   ├── login/page.js             # Authentication page
│   ├── globals.css               # Theme, animations, glass utilities
│   ├── layout.js                 # Root layout with nav/footer
│   └── page.js                   # Landing page (hero, features, CTA)
├── components/
│   ├── Navbar.jsx                # Responsive sticky navigation
│   ├── Footer.jsx                # Site footer with integration status
│   └── DashboardCharts.jsx       # Recharts visualizations
└── lib/
    ├── auth.js                   # Dual-mode auth (Firebase + localStorage)
    ├── calculator.js             # Emission factors & calculation engine
    └── db.js                     # Dual-mode database (Firestore + localStorage)
```

---

## Future Improvements

- **Email/Password Reset** — Add password recovery flow for Firebase auth
- **Social Login** — Google, GitHub, and Apple OAuth providers
- **Mobile App** — React Native or PWA wrapper for native mobile experience
- **Community Leaderboards** — Compare footprint reductions with friends
- **Monthly Reports** — Auto-generated PDF summaries of your carbon trends
- **Carbon Offset Integration** — Purchase verified offsets directly through the app
- **Multi-language Support** — i18n for international users
- **Wearable Integration** — Import transport data from Google Fit / Apple Health
- **Team / Household Mode** — Combine multiple profiles into a group footprint
- **Food Barcode Scanner** — Scan products for instant carbon impact data

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ for a sustainable future. Every kg CO₂ counts.</p>
```
