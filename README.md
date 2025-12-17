# HolidayZ - Family Savings Tracker

A beautiful React application for tracking family savings goals, designed for the De Beer family.

## 🎯 Features

- **Family Authentication**: Simple family member selection system
- **Savings Goals Management**: Create, edit, and delete savings goals with target amounts and deadlines
- **Personal Savings Tracking**: Each family member can log their contributions
- **Real-time Dashboard**: Overview of all goals with progress tracking and family contributions
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Data Persistence**: All data is saved locally and persists between sessions
- **Privacy**: Family members can only edit/delete their own savings entries

## 👥 Family Members

The application is pre-configured for 4 family members:
- Kenith De Beer (kenith.debeer@gmail.com)
- Family Member 2
- Family Member 3  
- Family Member 4

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd HolidayZ
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to \`http://localhost:5173\`

## 🏗️ Building for Production

Build the application:
\`\`\`bash
npm run build
\`\`\`

Preview the production build:
\`\`\`bash
npm run preview
\`\`\`

## ☁️ Google Cloud Deployment

This application is configured for easy deployment to Google Cloud App Engine.

### Prerequisites for Deployment

1. **Google Cloud Project**: Create a project at [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable App Engine**: Enable the App Engine Admin API
3. **Service Account**: Create a service account with App Engine Admin permissions
4. **GitHub Secrets**: Set up the following secrets in your GitHub repository:
   - \`GCP_SA_KEY\`: Service account key JSON (base64 encoded)
   - \`GCP_PROJECT_ID\`: Your Google Cloud project ID

### Manual Deployment

1. Install Google Cloud CLI
2. Authenticate: \`gcloud auth login\`
3. Set project: \`gcloud config set project YOUR_PROJECT_ID\`
4. Build the app: \`npm run build\`
5. Deploy: \`gcloud app deploy\`

### Automated Deployment

The application includes GitHub Actions workflow for automatic deployment:
- Push to \`main\` or \`master\` branch triggers deployment
- Builds the application
- Deploys to Google Cloud App Engine
- Promotes the new version and stops the previous one

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite (with Rolldown)
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Context API + useReducer
- **Data Persistence**: Local Storage
- **Deployment**: Google Cloud App Engine
- **CI/CD**: GitHub Actions

## 📱 Application Structure

### Pages
- **Authentication**: Family member selection
- **Dashboard**: Overview of all savings goals and progress
- **Goals**: Manage savings goals (create, edit, delete)
- **Savings**: Track personal contributions (add, edit, delete own entries)

### Key Features
- **Responsive Navigation**: Desktop and mobile-friendly navigation
- **Progress Tracking**: Visual progress bars for each goal
- **Family Contributions**: See how much each family member has contributed
- **Data Validation**: Form validation for all inputs
- **Confirmation Dialogs**: Safety prompts for destructive actions

## 🔒 Privacy & Security

- Each family member can only:
  - View all goals and overall progress
  - Add, edit, and delete their own savings entries
  - Cannot modify other family members' entries
- All data is stored locally in the browser
- No external data collection or tracking

## 🤝 Contributing

This is a private family application, but if you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📄 License

This project is private and intended for family use only.

## 👨‍👩‍👧‍👦 About

Created with ❤️ for the De Beer family to help achieve their savings goals together.

---

**Happy Saving! 💰✨**
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
