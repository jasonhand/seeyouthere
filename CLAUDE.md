# See Ya There Project Information

## Project Overview
See Ya There is a React-based web application for group date planning. It helps users find the best dates for group meetups by allowing each user to select their availability and displaying the best options.

## Key Features
- Calendar view for date selection
- Multi-user support with individual availability tracking
- Results view showing dates sorted by most available users
- Integration with music festival data

## Technology Stack
- React 18
- TypeScript
- TailwindCSS
- Vite (build tool)
- Lucide React (for icons)

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run preview` - Preview production build

## Project Structure
- `/src` - Source code
  - `GroupDateFinder.tsx` - Main component with calendar and results view
  - `main.tsx` - Entry point
  - `index.css` - Global styles with TailwindCSS imports

## Notes for Claude Code
- This is a frontend-only project with no backend integration yet
- The app displays a calendar of dates with music festival overlays
- Users can select their availability dates and view aggregate results
- Current implementation has hardcoded user data
