# System Architecture

## Overview

**ProjectAccounts** is a Next.js 15 (App Router) web application designed for managing freelance project finances, client relationships, and team expenses. It features a dark, premium fintech-inspired UI with responsive mobile and desktop layouts.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15.5.9 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Custom CSS Variables |
| **UI Components** | shadcn/ui (Radix primitives) |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **Backend** | Google Sheets API (via Service Account) |
| **Deployment** | Firebase App Hosting / Vercel |

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── sheets/               # Google Sheets API endpoints
│   ├── phases/[phaseId]/         # Dynamic phase pages
│   ├── projects/
│   │   └── website-freelancing/  # Main project module
│   │       ├── admin/            # Admin Control Panel
│   │       ├── dashboard/        # Financial Dashboard
│   │       └── team/             # Team Expense Tracker
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles & design tokens
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── modals/                   # Modal components (ProjectControlPanelModal)
│   ├── about.tsx                 # About section with charts
│   ├── MagicBento.tsx            # Bento grid layout
│   ├── PasscodeProtect.tsx       # Authentication wrapper
│   └── ...                       # Other UI components
│
├── lib/
│   ├── api.ts                    # Google Sheets API client (CRUD operations)
│   ├── finance.ts                # Canonical finance calculation engine
│   ├── financeValidator.ts       # Finance data validation
│   ├── useFinanceStore.ts        # Zustand global state store
│   ├── recalc.ts                 # Server-side recalculation service
│   └── utils.ts                  # Utility functions
│
├── hooks/                        # Custom React hooks
└── types/                        # TypeScript type definitions
```

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI LAYER (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Dashboard   │  │ Admin Panel  │  │    Team Panel        │   │
│  │  (Read-only) │  │ (Full CRUD)  │  │  (Expense Tracking)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STATE LAYER (Zustand)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               useFinanceStore                             │   │
│  │  • clients, payments, teamLedger, logs                   │   │
│  │  • globalFinance, clientFinances (Map)                   │   │
│  │  • CRUD actions (addClient, updatePricing, etc.)         │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CALCULATION LAYER (Pure Functions)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    finance.ts                             │   │
│  │  • calculateFinance() - Per-client calculations          │   │
│  │  • calculateGlobalFinance() - Dashboard aggregates       │   │
│  │  • Payment normalization (Credit/Debit handling)         │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      api.ts                               │   │
│  │  • getClients(), getPayments(), getTeamLedger()          │   │
│  │  • addClient(), updateClient(), deleteClient()           │   │
│  │  • addPayment(), addTeamLedgerEntry()                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATA LAYER (Google Sheets)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Spreadsheet ID: from GOOGLE_SHEET_ID env var            │   │
│  │  Sheets: Clients | Payments | TeamLedger | Logs          │   │
│  │  Auth: Service Account (JSON key in env)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Read Flow (Dashboard/Admin Load)
```
1. Component mounts → useFinanceStore.initialize()
2. Store calls api.ts → getClients(), getPayments(), getTeamLedger()
3. API routes → Google Sheets API (authenticated via service account)
4. Data returns → Store runs calculateFinance() for each client
5. Store updates → clientFinances Map, globalFinance object
6. Components re-render with computed data
```

### Write Flow (Admin Panel Actions)
```
1. User action (e.g., "Create Client")
2. Component calls store.addClient(data)
3. Store calls api.addClient(data) → API Route → Google Sheets
4. On success: Store re-fetches all data
5. Recalculation runs → UI updates reactively
```

---

## Key Data Models

### FinanceResult (Per-Client)
```typescript
interface FinanceResult {
  totalValue: number;      // Contract value (serviceCost + domain + extras)
  totalPaid: number;       // Sum of all payments (net of debits)
  pending: number;         // totalValue - totalPaid
  totalRevenue: number;    // Same as totalPaid
  profit: number;          // totalValue - actualDomainCost
  teamGiven: number;       // Money given to team for this client
  teamSpent: number;       // Money spent by team for this client
  teamInvestment: number;  // Investment entries
  teamWallet: number;      // teamGiven - teamSpent
  progressPercent: number; // (totalPaid / totalValue) * 100
}
```

### GlobalFinanceResult (Dashboard)
```typescript
interface GlobalFinanceResult {
  totalRevenue: number;      // Sum of all client revenues
  projectedRevenue: number;  // Sum of all contract values
  totalPending: number;      // Sum of all pending amounts
  totalCash: number;         // Sum of cash-mode payments
}
```

---

## Security Model

| Feature | Implementation |
|---------|----------------|
| **Admin Panel** | Passcode protection (PasscodeProtect component) |
| **Team Panel** | Passcode protection (separate code) |
| **Google Sheets** | Service Account authentication (server-side only) |
| **Environment** | Sensitive keys in `.env.local` (not committed) |

---

## Responsive Design

| Breakpoint | Target |
|------------|--------|
| `< 768px` (md:hidden) | Mobile-first premium dark UI |
| `≥ 768px` (md:block) | Desktop multi-column layout |

The application uses Tailwind's responsive prefixes with mobile-first defaults, ensuring feature parity across all screen sizes.

---

## File Descriptions

| File | Purpose |
|------|---------|
| `lib/finance.ts` | **Canonical** calculation engine. Single source of truth for all financial math. |
| `lib/useFinanceStore.ts` | Zustand store managing global state, CRUD operations, and derived calculations. |
| `lib/api.ts` | API client for Google Sheets operations. Handles all external data access. |
| `lib/recalc.ts` | Server-side recalculation service with locking (prevents race conditions). |
| `app/projects/website-freelancing/admin/page.tsx` | Admin Panel with client management, pricing, payments, and team money tabs. |
| `app/projects/website-freelancing/dashboard/page.tsx` | Read-only financial overview with charts. |
| `app/projects/website-freelancing/team/page.tsx` | Team expense tracking and ledger management. |

---

## Environment Variables

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=<spreadsheet-id>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email>
GOOGLE_PRIVATE_KEY=<base64-encoded-private-key>

# Passcodes (optional, for demo)
NEXT_PUBLIC_ADMIN_PASSCODE=<admin-passcode>
NEXT_PUBLIC_TEAM_PASSCODE=<team-passcode>
```

---

## Deployment

The application is configured for:
- **Firebase App Hosting** (`apphosting.yaml`)
- **Vercel** (standard Next.js deployment)

Build command: `npm run build`
Dev server: `npm run dev` (uses Turbopack)

---

## Design Principles

1. **Single Source of Truth**: All financial calculations flow through `finance.ts`
2. **Separation of Concerns**: UI → State → Calculation → API → Data layers
3. **Mobile-First**: Responsive design with feature parity
4. **Premium Aesthetics**: Dark fintech SaaS theme with glassmorphism and micro-animations
5. **Type Safety**: Full TypeScript coverage with strict interfaces
