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
- Docker and Docker Compose (for local database)

### Installation

#### Option 1: Local Development (with in-memory database)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

⚠️ **Note**: Data will not persist between server restarts with this method.

#### Option 2: Docker Development (with persistent database)

```bash
# Start all services (MongoDB + Next.js app)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

**Access Points:**

- **Application**: [http://localhost:3000](http://localhost:3000)
- **MongoDB**: localhost:27017
- **MongoDB Admin**: [http://localhost:8081](http://localhost:8081)

### Troubleshooting

#### Docker Issues

If Docker fails to pull images, try:

1. **Check Docker is running:**

   ```bash
   docker --version
   docker-compose --version
   ```

2. **Pull images manually:**

   ```bash
   docker pull mongo:6.0
   docker pull mongo-express:1.0.0
   ```

3. **Clean up and retry:**

   ```bash
   docker-compose down -v --remove-orphans
   docker-compose up -d --build
   ```

4. **Alternative: Local MongoDB**
   If Docker continues to fail, install MongoDB locally:
   ```bash
   # Install from: https://www.mongodb.com/try/download/community
   # Then run:
   setup-local-mongo.bat
   ```

#### Environment Variables

Create a `.env` file for custom configuration:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/game_results?authSource=admin
NODE_ENV=development
```

**Environment Variables:**
Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

## Project Structure

```
hackathon-starter/
├── app/                 # App router pages
│   ├── page.tsx        # Home page
│   ├── users/          # Users management page
│   └── api/            # API routes
│       ├── hello/      # Simple API example
│       └── users/      # User management API
├── components/          # React components
│   ├── HeroSection.tsx
│   ├── FeatureCard.tsx
│   └── __tests__/      # Component tests
├── lib/                 # Library code
│   └── db/             # Database utilities
│       ├── models/     # Mongoose models
│       └── utils/      # Database connection
├── public/             # Static assets
├── __mocks__/          # Jest mocks for testing
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile         # Docker image configuration
├── .env.example       # Environment variables template
└── jest.config.mjs     # Jest configuration
```

## Available Scripts

```bash
# Development
npm run dev        # Start development server (local, in-memory DB)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint

# Testing
npm run test       # Run tests
npm run test:watch # Run tests in watch mode

# Docker Development (Persistent Database)
npm run docker:dev # Start all services with helper script
npm run docker:up  # Start Docker Compose services
npm run docker:down # Stop all services
npm run docker:logs # View service logs
npm run docker:clean # Stop services and remove volumes
```

## Quick Tips

### Adding a New Page

Create a new folder in `app/` with a `page.tsx` file:

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

### Creating an API Route

Add a `route.ts` file in `app/api/`:

```tsx
// app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: "Your data here" });
}
```

### Using the Mock API

The starter includes example API routes:

- `GET /api/hello` - Simple hello endpoint
- `GET /api/users` - Returns mock users
- `POST /api/users` - Creates a mock user

## Start Building!

You're all set! Start modifying the code to build your hackathon project. Good luck! 🚀
