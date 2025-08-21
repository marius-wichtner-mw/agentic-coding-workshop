# Context
Game results tracking platform (agentic coding workshop) - tracks game results across different types of games with scoreboards and player rankings. Main project is in `/hackathon-starter/` directory with Next.js template.

## Technical Stack
- Framework: Next.js 15.5.0 with Turbopack
- Language: TypeScript
- Database: SQLite with better-sqlite3
- Styling: Tailwind CSS v4
- Testing: Jest with Testing Library
- Linting: ESLint with Next.js config
- API Documentation: Swagger/OpenAPI
- Package Manager: npm

## Project Structure
- `/hackathon-starter/` - Main Next.js application
- `/app/` - Next.js 13+ app router structure
- `/app/api/` - API routes for backend functionality
- `/components/` - Reusable React components
- `/lib/` - Database and utility functions
- `/public/` - Static assets
- `/data/` - SQLite database files

## Development Guidelines
- Use Next.js 13+ app router patterns
- Follow existing component structure in `/components/`
- Use TypeScript for all new files
- Follow Tailwind CSS utility-first approach
- Write tests for components in `__tests__/` directories
- Use proper Next.js API route patterns in `/app/api/`
- Add Swagger documentation for all API endpoints
- Use SQLite for data persistence
- Implement proper error handling and validation

## Database Schema
- **users**: id, username, created_at
- **games**: id, name, type, image_url, created_by, created_at
- **game_results**: id, game_id, player1_id, player2_id, player1_score, player2_score, winner_id, timestamp, notes
- **sessions**: id, user_id, expires_at, created_at

## Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run test` - Run Jest tests
- `npm run lint` - Run ESLint

## Commit Guidelines
Use clear, descriptive commit messages organized by logical functionality:

### Examples:
```
Add SQLite dependencies for game tracker
- Add better-sqlite3 and sqlite3 packages
- Required for persistent data storage

Set up SQLite database schema and session management
- Create database schema for users, games, and game_results
- Add session management with cookie-based authentication
- Implement database connection and type definitions

Implement user management API endpoints
- Update /api/users to use SQLite with username validation
- Add /api/users/[id] for user profile updates
- Support user creation and username modification
- Implement proper error handling and validation
```

## Success Criteria
- [ ] TypeScript compilation passes
- [ ] `npm run lint` passes without errors
- [ ] `npm run test` passes with existing tests
- [ ] `npm run build` completes successfully
- [ ] Code follows Next.js 13+ app router conventions
- [ ] Components have corresponding tests where applicable
- [ ] Tailwind CSS used for styling
- [ ] SQLite database operations work correctly
- [ ] API endpoints documented with Swagger
- [ ] No regression in existing functionality

## UX/UI Guidelines
- **Design System**: Clean, modern interface with consistent spacing
- **Color Palette**: 
  - Primary: Blue (authentication, primary actions)
  - Success: Green (confirmations, success states)
  - Warning: Yellow (alerts, warnings)
  - Danger: Red (errors, destructive actions)
  - Neutral: Gray scale (text, borders, backgrounds)
- **Typography**: System fonts with clear hierarchy
- **Interactive Elements**:
  - Buttons: Clear call-to-action with hover states
  - Forms: Proper validation and error messaging
  - Cards: Consistent shadow and border radius
  - Navigation: Intuitive flow between features
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Proper semantic HTML, ARIA labels, keyboard navigation
- **Loading States**: Show progress for async operations
- **Error Handling**: User-friendly error messages with recovery options

## User Experience Flow
1. **Authentication**: Login/Register → Profile Management
2. **Game Management**: Browse Games → Create New Game → Game Details
3. **Result Tracking**: Select Game → Add Players → Submit Scores → View Results
4. **Scoreboards**: Game Rankings → Player Statistics → Historical Data

## API Documentation
- Available at: http://localhost:3000/api-docs
- Interactive Swagger UI for testing endpoints
- Complete API schema definitions