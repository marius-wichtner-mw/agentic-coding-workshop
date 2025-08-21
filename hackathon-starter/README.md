# Hackathon Starter

A simple Next.js starter template for hackathon projects. Focus on building, not setup!

## Features

- ⚡ **Next.js 15** with TypeScript
- 🎨 **Tailwind CSS** for styling
- ✅ **Jest** and React Testing Library configured
- 📱 **Responsive** design out of the box
- 🔄 **API Routes** with examples
- 🚀 **Fast refresh** with Turbopack

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
hackathon-starter/
├── app/                 # App router pages
│   ├── page.tsx        # Home page
│   ├── users/          # Users page example
│   └── api/            # API routes
│       ├── hello/      # Simple API example
│       └── users/      # Mock users API
├── components/          # React components
│   ├── HeroSection.tsx
│   ├── FeatureCard.tsx
│   └── __tests__/      # Component tests
├── public/             # Static assets
└── jest.config.js      # Jest configuration
```

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
```

## Quick Tips

### Adding a New Page
Create a new folder in `app/` with a `page.tsx` file:
```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About Us</h1>
}
```

### Creating an API Route
Add a `route.ts` file in `app/api/`:
```tsx
// app/api/data/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: 'Your data here' })
}
```

### Using the Mock API
The starter includes example API routes:
- `GET /api/hello` - Simple hello endpoint
- `GET /api/users` - Returns mock users
- `POST /api/users` - Creates a mock user

## Start Building!

You're all set! Start modifying the code to build your hackathon project. Good luck! 🚀
