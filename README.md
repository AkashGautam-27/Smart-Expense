# SmartSpend: Intelligent Personal Finance Manager

SmartSpend is an AI-powered personal finance and expense tracking application designed for seamless money management. With a dedicated **Indian Personal Finance AI**, it helps you track spending, strictly manage budgets, and gain deep, actionable wealth-building insights. 

## ✨ Key Features

- **Gemini AI Wealth Advisor**: Get personalized, context-aware insights on your spending habits, budget ceiling warnings, and high-value saving tips natively formatted in INR (₹).
- **AI Voice Assistant**: Speak directly to the app to log new transactions or filter your ledger (e.g. *"Show me my food expenses"* or *"Add ₹500 for consulting income"*).
- **AI Receipt Scanner**: Upload digital bills or receipts to automatically extract vendors, dates, and amounts.
- **Interactive Dashboard**: Track your financial health with beautiful charts (Recharts), dynamic budget progress bars, and net wealth flow analytics.
- **Advanced Ledger**: Search, filter, edit, and manage your complete transaction history across custom categories and payment methods (UPI, Card, Cash).
- **PDF & Excel Reports**: Instantly generate and download consolidated financial statements formatted beautifully for your personal records.

## 🚀 Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Lucide-React, Recharts, jsPDF, XLSX.
- **Backend**: Node.js, Express, Google GenAI (`@google/genai`).
- **Database**: MongoDB(Atlas).

## 🛠️ Getting Started

**Prerequisites:** Node.js (v18+)

### 1. Clone & Setup
Clone the repository to your local machine.

### 2. Environment Variables
 You must supply your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
Open two terminal windows—one for the frontend (client) and one for the backend (server).

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 4. Run the Application
Start the development servers for both environments.

**Server:**
```bash
cd server
npm run dev
```
*(Runs by default on http://localhost:5000)*

**Client:**
```bash
cd client
npm run dev
```
*(Runs by default on http://localhost:5173)*

## 💡 Usage Highlights
- **Currency Rules:** SmartSpend is strictly configured to use **Indian Rupees (₹)** for all calculations, responses, and visual formats.
- **Budgets:** Set up category limits (e.g. Housing, Food, Shopping) in the Dashboard to trigger real-time AI ceiling warnings when you approach your boundaries.

## 🗂️ File & Folder Structure

```text
Smart-Expense/
├── client/                 # Frontend React Application (Vite)
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components (Sidebar, Navbar, VoiceAssistant)
│       ├── context/        # React Context (AuthContext, TransactionContext)
│       ├── pages/          # Application pages (Dashboard, Ledger, Reports, Profile, etc.)
│       └── utils/          # Helper utilities (API config, formatting)
├── server/                 # Backend Node.js / Express Application
│   ├── controllers/        # Request handlers (analytics, auth, budget, etc.)
│   ├── middleware/         # Express middlewares (JWT Auth)
│   ├── models/             # Database schemas & models
│   ├── routes/             # API route definitions (aiRoutes, authRoutes, etc.)
│   └── services/           # External service integrations (Gemini AI, Email logic)
└── README.md               # Project documentation
```

## 🔄 Project Flows

1. **Authentication Flow**: Users register or log in. The backend validates credentials and issues a JWT token. This token is stored on the client and sent in the headers of all subsequent API requests for security.
2. **Transaction Management Flow**: Users add, edit, or delete transactions via the Dashboard or Ledger. The React Context state updates immediately for a snappy UI, while syncing asynchronously with the backend database.
3. **AI Insight Flow**: Transaction history and budget data are securely sent to the Gemini AI backend endpoint. The AI analyzes the data and returns structured JSON insights, savings tips, and ceiling warnings formatted in INR, which are then rendered on the Dashboard and Reports pages.
4. **Voice Command Flow**: Users speak into the microphone UI. The transcribed text is sent to the backend where Gemini interprets the intent, choosing to either intelligently filter the ledger view or pre-fill a new transaction form.

## 👥 User and Admin Roles

- **Standard User**: 
  - Can register and manage their own financial profile.
  - Can log, edit, and categorize personal transactions securely.
  - Can set category budgets and generate personalized financial PDF reports.
  - *Data Isolation:* Users only have access to their own scoped data.
- **Admin**:
  - Holds elevated privileges to oversee platform health and metrics.
  - Has access to the exclusive Admin Dashboard to monitor user registrations, active sessions, and global application analytics.
  - *Security:* Admin roles are strictly verified via JWT middleware before granting access to admin-only API routes.

## 👨‍💻 Developer

Developed and maintained by **Akash Gautam**.

## 📄 License

This project is licensed under the MIT License.

---
*Built with ❤️ Akash Gautam & AI.*
