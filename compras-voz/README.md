# compras-voz

Expense tracker app with voice recording. Transcribes audio via OpenAI Whisper, parses transactions with GPT-4o-mini, and stores them locally in SQLite via Drizzle ORM.

Built with **Expo (SDK 54)** / **React Native 0.81.5** / **expo-router**.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Android Studio](https://developer.android.com/studio) with an emulator or a physical device with USB debugging enabled
- JDK 17 (bundled with Android Studio)
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd compras-voz
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_OPENAI_BASE_URL=https://api.openai.com/v1
```

### 3. Run on Android

> ⚠️ This app uses SQLite and native audio — it **cannot** run in Expo Go. A development build is required.

```bash
npm run android
```

This compiles and installs the dev build on your connected device/emulator and starts the Metro bundler.

---

## Database

The app uses **Drizzle ORM** with **expo-sqlite**. Migrations run automatically on app start.

| Command               | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `npm run db:generate` | Generate a new migration after editing `src/db/schema.ts` |
| `npm run db:studio`   | Open Drizzle Studio to inspect the local database         |

**To add or change tables:**

1. Edit [`src/db/schema.ts`](src/db/schema.ts)
2. Run `npm run db:generate`
3. Restart the app — the migration applies automatically

---

## Project structure

```
src/
  app/            # expo-router screens and layouts
    (tabs)/       # tab screens (Home, Resumen, Cuentas, Categorías)
    _layout.tsx   # root layout — runs migrations, seeds categories
  components/     # shared UI components (AppHeader, SettingsDrawer, VoiceRecorder)
  constants/      # theme, config
  db/             # Drizzle schema
  services/       # DB queries (transaction, account, category) + OpenAI/Whisper
  types/          # TypeScript interfaces
drizzle/          # Generated SQL migrations
```
