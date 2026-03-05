# Municipal Web Dashboard

This is a Next.js dashboard for municipal officers to manage reports and view analytics.

## Getting Started

1.  Navigate to this folder:

    ```bash
    cd web

    ```

2.  Install dependencies (if not already done):

    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in this directory with your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

    Note: You can copy these from the main app's `.env` or `lib/utils/supabase.ts` file if they are hardcoded (not recommended).

4.  Run the development server:

    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- **Report Management**: diverse filtering, status updates (Pending -> In Progress -> Resolved).
- **Analytics**: Visual charts for report status distribution and trends over time.
- **Real-time Updates**: Functionality to refresh data.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Charts**: Recharts
- **Icons**: Lucide React
