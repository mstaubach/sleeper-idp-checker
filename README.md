# Sleeper IDP Availability Checker

Check IDP (Individual Defensive Player) availability in your Sleeper fantasy football league. Paste rankings from sites like PFF, upload a CSV, or manually enter players — the tool checks each one against your league's rosters.

## Features

- **Three input methods**: Paste text, upload CSV/TXT, or manual entry with autocomplete
- **Fuzzy name matching**: Handles variations like "Pat Queen" vs "Patrick Queen" vs "P. Queen"
- **Position filtering**: Filter by LB, DL (DE/DT), or DB (CB/S)
- **Availability toggle**: Show all players or available only
- **Waiver info**: FAAB budgets or rolling waiver priority
- **Unmatched player reporting**: See which names couldn't be matched

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
npm test
```

### Configuration

Enter your Sleeper league ID in the input field at the top of the page. You can find your league ID in the Sleeper app URL.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- fuse.js (fuzzy matching)
- Sleeper API (public, no auth required)

## Deployment

Deploy to Vercel — just import from GitHub and it auto-detects the Next.js config.
