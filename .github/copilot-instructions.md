<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HolidayZ Family Savings Tracker - Copilot Instructions

## Project Overview
This is a React TypeScript application for family savings goal tracking. The application allows family members to:
- Create and manage savings goals
- Track individual contributions
- View family progress on a dashboard
- Maintain privacy (users can only edit their own entries)

## Technology Stack
- React 19 with TypeScript
- Vite build tool with Rolldown
- Tailwind CSS for styling
- Heroicons for icons
- Context API with useReducer for state management
- Local Storage for data persistence

## Code Style Preferences
- Use TypeScript with proper type annotations
- Use functional components with hooks
- Use Tailwind CSS classes for styling
- Follow React best practices (proper state management, component composition)
- Use type-only imports for TypeScript types: `import type { Type } from './types'`
- Prefer explicit interfaces over inline types

## Key Components
- `AppContext.tsx`: Global state management using Context API and useReducer
- `AuthPage.tsx`: Family member selection page
- `Dashboard.tsx`: Overview of all savings goals and progress
- `Goals.tsx`: CRUD operations for savings goals
- `Savings.tsx`: CRUD operations for personal savings entries
- `Layout.tsx`: Navigation and app shell

## Data Models
- `User`: Family member with id, name, and email
- `SavingsGoal`: Goal with target amount, description, deadline
- `SavingsEntry`: Individual contribution with amount, date, description
- `SavingsGoalWithProgress`: Extended goal with calculated progress and contributions

## Business Rules
- Family members can view all goals and overall progress
- Family members can only create, edit, and delete their own savings entries
- All data is persisted to localStorage
- Goals can be created/edited/deleted by any family member
- Progress calculations are done in real-time based on entries

## Deployment
- Configured for Google Cloud App Engine deployment
- GitHub Actions for CI/CD
- Static file serving for SPA routing
