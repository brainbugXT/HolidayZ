# HolidayZ - Family Savings Tracker

A beautiful React application for tracking family savings goals, designed for the De Beer family.

## 🎯 Features

- **Family Authentication**: Simple family member selection system.
- **Savings Goals Management**: Create, edit, and delete savings goals with target amounts and deadlines.
- **Personal Savings Tracking**: Each family member can log their contributions.
- **Real-time Dashboard**: Overview of all goals with progress tracking and family contributions.
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices.
- **Data Persistence**: All data is saved locally in the browser and persists between sessions.
- **Privacy**: Family members can only edit or delete their own savings entries.

## 👥 Family Members

The application is pre-configured for 4 family members:
- Kenith De Beer (kenith.debeer@gmail.com)
- Family Member 2
- Family Member 3
- Family Member 4

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (or yarn/pnpm)

### Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd HolidayZ
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## ☁️ Automated Google Cloud Deployment

This application is configured for a cost-optimized, automated deployment to **Google Cloud App Engine** using GitHub Actions.

**The deployment process is triggered automatically on every push to the `main` branch.**

### How It Works

1.  **Push to `main`**: When you push a commit, the GitHub Actions workflow starts.
2.  **Build**: It builds the React application for production.
3.  **Deploy**: It deploys the build to a new, temporary version on App Engine.
4.  **Promote**: If the deployment is successful, it instantly promotes the new version to receive all traffic.
5.  **Cleanup**: It stops the previous version to save costs, keeping older versions available for rollbacks.

You can monitor the deployment progress in the **"Actions"** tab of your GitHub repository.

### Manual Deployment (Alternative)

If you ever need to deploy manually:

1.  **Install Google Cloud CLI**: [Follow the official instructions](https://cloud.google.com/sdk/docs/install).
2.  **Authenticate**: `gcloud auth login`
3.  **Set Project**: `gcloud config set project YOUR_PROJECT_ID`
4.  **Build**: `npm run build`
5.  **Deploy**: `gcloud app deploy`

## 🛠️ Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with Rolldown
- **UI Library**: Material-UI (MUI X)
- **Icons**: Material-UI Icons
- **State Management**: React Context API with `useReducer`
- **Data Persistence**: Browser Local Storage
- **Deployment**: Google Cloud App Engine
- **CI/CD**: GitHub Actions (Automated)

## 📚 Documentation

- **[MUI Migration Complete](./MUI_MIGRATION_COMPLETE.md)** - Details on the MUI migration
- **[Cache Clearing Explained](./CACHE_CLEARING_EXPLAINED.md)** - How automatic cache clearing works
- **[Deployment Verification](./DEPLOYMENT_VERIFICATION.md)** - Quick guide to verify deployments
- **[Deployment Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md)** - Common issues and solutions
- **[Cost Optimization](./COST_OPTIMIZATION.md)** - Cost-saving strategies
- **[GitHub Setup](./GITHUB_SETUP.md)** - Initial repository setup
- **[Deployment Setup](./DEPLOYMENT_SETUP.md)** - Google Cloud configuration

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
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is private and intended for family use only.

## 👨‍👩‍👧‍👦 About

Created with ❤️ for the De Beer family to help achieve their savings goals together.

---

**Happy Saving! 💰✨**
