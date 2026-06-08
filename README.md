
# UrbanCycle ♻️

[![Expo](https://img.shields.io/badge/Expo-40BFFF?logo=expo&logoColor=white&style=for-the-badge)](https://expo.dev/)  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/) [![React Native](https://img.shields.io/badge/React%20Native-61DAFB?logo=react&logoColor=white&style=for-the-badge)](https://reactnative.dev/)  [![React](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)](https://reactnative.dev/)

## Project Overview ✨

UrbanCycle is a comprehensive waste management and municipal reporting solution. It is a dual-project repository consisting of:
- **Mobile**: A consumer-facing React Native (Expo) app for users to submit reports, track statuses, and interact with community features.
- **Web**: An admin-only Next.js dashboard used by municipal workers for report triage, analytics, and map-based operations.

Both applications share the same backend domain model powered by Supabase.

## Screenshots 📸

<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <p float="left">
    <img height="600" alt="download (1)" src="https://github.com/user-attachments/assets/131fbbcc-1d7d-4bcd-8939-1bd6c9504256" />
    <img height="600" alt="Screenshot_2026-05-25_195401-removebg-preview" src="https://github.com/user-attachments/assets/22fe3fe9-1b1e-4719-a901-8faf5f5070c4" />
  </p>
             
  <p float="left">
    <img height="600" alt="download 3 " src="https://github.com/user-attachments/assets/59b45d91-a14d-4702-b4eb-ab8c1bdaccb4" />
    <img height="600" alt="download4" src="https://github.com/user-attachments/assets/7ef41e68-7516-4689-8de4-1166773835b4" />
  </p>

  <p float="left">
    <img height="600" alt="download5" src="https://github.com/user-attachments/assets/facd8144-b9c9-4a3a-8757-934e7adaa598" />
    <img height="600" alt="download6" src="https://github.com/user-attachments/assets/0dacd8b0-836b-4c4d-a4a5-4739a56a1f5e" />
  </p>
  
  <p float="left">
    <img height="600" alt="download7" src="https://github.com/user-attachments/assets/d2992bb0-a2c8-4a71-a47a-035a7c6daca1" />
    <img height="600" alt="download8" src="https://github.com/user-attachments/assets/fadd4401-edd3-48a3-9321-3390ee720755" />
  </p>

  
  <p float="left">
    <img height="600" alt="download9" src="https://github.com/user-attachments/assets/f8b13e9a-8d37-4a23-bea6-af3fbf1ce1af" />
    <img height="600" alt="download10" src="https://github.com/user-attachments/assets/94b49861-f0fc-4296-b78f-382a6de5f5ab" />
  </p>

  <img width="800" height="391" alt="Recording2026-05-25201759-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/8b1438f6-d11a-451b-9293-aceed9510cc5" />
</div>

## Tech Stack 🛠️

### Shared Backend
- **Supabase**: Authentication, PostgreSQL database, storage, and shared environment models (`user`, `reports`, `item`, `transactions`).

### 📱 Mobile (`/mobile`)
- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **UI Flow**: Global custom-made bottom-sheet controller (`SooBottomSheet`)

### 💻 Web (`/web`)
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS & shadcn/ui primitives (`src/components/ui`)
- **Maps**: Leaflet (loaded dynamically to avoid Server-Side Rendering issues)
- **State Management**: Zustand

## Getting Started ⚡

### Prerequisites
- Node.js (v18+)
- A Supabase project with database configured

### Environment Variables
You will need to configure environment variables for both projects. Ensure these variables are treated as required non-null values.

**Mobile (`mobile/.env`)**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

**Web (`web/.env.local`)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation & Running

**1. For the Mobile App:**
```bash
cd mobile
npm install
npm run start      # Start Expo dev server

# Or to run natively:
# npm run android
# npm run ios
```

**2. For the Web Dashboard:**
```bash
cd web
npm install
npm run dev        # Start Next.js dev server
```

## Development Scripts 📜

### Mobile (`mobile/`)
- `npm run start` - Starts the Expo development server
- `npm run android` - Native Android run
- `npm run ios` - Native iOS run
- `npm run web` - Expo web target
- `npm run lint` - Runs linting

### Web (`web/`)
- `npm run dev` - Starts development server
- `npm run build` - Builds for production
- `npm run start` - Starts the built production application
- `npm run lint` - Runs linting
