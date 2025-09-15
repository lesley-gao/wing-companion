# WingCompanion - Travel Companion & Airport Pickup Platform

A community-focused networking platform designed for Chinese community members in New Zealand, facilitating travel companion matching and airport pickup services.

## 📋 Table of Contents

<!-- - [📹 Project Video Presentation](#-project-video-presentation) -->
- [Project Overview](#project-overview)
- [Mockups](#mockups)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
- [📁 Project Structure](#-project-structure)

<!-- ## 📹 Project Video Presentation

**Video Link: [WingCompanion Project Demo](your-video-link-here)** -->

## Project Overview:

1. **Brief Introduction to the Project**

   - WingCompanion is a comprehensive networking platform that connects Chinese community members in Auckland, New Zealand
   - Addresses the specific challenge of language barriers and navigation difficulties faced by non-English speaking elderly travelers
   - Facilitates travel companion matching and airport pickup services through a trusted community network
   - Features comprehensive user verification, real-time messaging
   - Designed for mutual aid principles where community members both give and receive assistance

2. **How the Project Relates to "Networking" Theme**

   - **Community Building**: Creates a network of trusted travelers and helpers
   - **Social Connections**: Enables users to connect before, during, and after travel
   - **Trust Networks**: Verification system builds trust within the community
   - **Real-time Communication**: SignalR-powered messaging for instant networking
   - **Networking**: Connects people with similar travel patterns

3. **Unique Features Worth Highlighting**

   - **Bilingual Support**: Full English/Chinese interface for the target community
   - **Real-time Messaging**: Live chat with SignalR for instant communication
   - **Comprehensive Verification**: User verification for safety

4. **Advanced Features Implementation Checklist**

   ✅ **Storybook Integration**: All UI components documented and tested in Storybook

   - Component library with interactive documentation
   - Visual testing and component development workflow
   - Accessibility testing and responsive design validation

   ✅ **Unit Testing**: Comprehensive test coverage for both frontend and backend

   - Frontend: Jest + React Testing Library (>80% coverage)
   - Backend: MSTest + Moq (>85% coverage)
   - API integration tests for all endpoints

   ✅ **State Management**: Redux Toolkit implementation

   - Centralized state management for user data, UI state, and API caching
   - RTK Query for efficient API data fetching and caching
   - Optimistic updates and error handling

   ✅ **Theme Switching**: Light/Dark mode support

   - Material-UI theme provider with custom color schemes
   - Persistent theme preferences
   - Smooth transitions and consistent styling

## UI Preview

![WingCompanion Light Mode](frontend/public/images/mockup1.png)

![WingCompanion Dark Mode](frontend/public/images/mockup2.png)

![WingCompanion Light Mode2](frontend/public/images/mockup3.png)

## 🚀 Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd WingCompanion
   ```

2. **Setup backend**

   ```bash
   cd backend
   dotnet restore
   dotnet build
   cd ..
   ```

3. **Setup frontend**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Run the application**

   ```bash
   # Terminal 1: Start backend
   cd backend
   dotnet run

   # Terminal 2: Start frontend (in new terminal)
   cd frontend
   npm start
   ```

## 📁 Project Structure

```
NetworkingApp/
├── 📁 backend/                   # .NET 8 Web API
│   ├── 📁 Controllers/           # Web API controllers
│   ├── 📁 Data/                  # Database context and migrations
│   ├── 📁 Models/                # Data models and DTOs
│   ├── 📁 Services/              # Business logic services
│   ├── 📁 Hubs/                  # SignalR hubs
│   ├── 📁 Tests/                 # Unit and integration tests
│   ├── 📁 Filters/               # Request/response filters
│   ├── 📁 Middleware/            # Custom middleware
│   ├── 📁 Templates/             # Email templates
│   ├── 📁 Configuration/         # Configuration classes
│   ├── 📁 Pages/                 # Razor pages
│   ├── 📁 Properties/            # Project properties
│   ├── 📁 bin/                   # Build output
│   ├── 📁 obj/                   # Build intermediates
│   ├── 📁 logs/                  # Application logs
│   ├── 📁 publish/               # Published application
│   ├── 📄 Program.cs             # Application entry point
│   ├── 📄 NetworkingApp.csproj   # .NET project file
│   ├── 📄 NetworkingApp.sln      # Solution file
│   ├── 📄 appsettings.json       # App configuration
│   ├── 📄 appsettings.Development.json # Development config
│   ├── 📄 appsettings.production.json # Production config
│   ├── 📄 appsettings.test.json  # Test config
│   ├── 📄 azure-appsettings.json # Azure configuration
│   ├── 📄 coverlet.runsettings   # Code coverage configuration
│   ├── 📄 FlightCompanion.db     # SQLite database (dev)
│   ├── 📄 publish.zip            # Deployment package
│   └── 📄 webapp_logs.zip        # Log archive
├── 📁 frontend/                  # React TypeScript frontend
│   ├── 📁 public/                # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 store/             # Redux store and slices
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📁 services/          # API services
│   │   ├── 📁 themes/            # Theme providers
│   │   ├── 📁 utils/             # Utility functions
│   │   ├── 📁 locales/           # Internationalization files
│   │   ├── 📁 stories/           # Storybook stories
│   │   ├── 📁 config/            # Configuration files
│   │   └── 📁 store/             # Redux store
│   ├── 📁 e2e/                   # End-to-end tests
│   ├── 📁 .storybook/            # Storybook configuration
│   ├── 📁 scripts/               # Build and utility scripts
│   ├── 📁 test-results/          # Test output
│   ├── 📁 build/                 # Production build
│   ├── 📄 package.json           # Frontend dependencies
│   ├── 📄 package-lock.json      # Locked dependencies
│   ├── 📄 tailwind.config.js     # Tailwind configuration
│   ├── 📄 tsconfig.json          # TypeScript configuration
│   ├── 📄 vite.config.mjs        # Vite build configuration
│   ├── 📄 playwright.config.ts   # Playwright test configuration
│   ├── 📄 jest.config.json       # Jest test configuration
│   ├── 📄 postcss.config.js      # PostCSS configuration
│   ├── 📄 .eslintrc.json         # ESLint configuration
│   ├── 📄 index.html             # HTML entry point
│   └── 📄 README.md              # Frontend documentation
├── 📁 infra/                     # Azure infrastructure as code
│   ├── 📁 bicep/                 # Bicep templates
│   │   ├── 📄 main.bicep         # Main infrastructure template
│   │   ├── 📁 modules/           # Modular Bicep templates
│   │   └── 📁 parameters/        # Environment-specific parameters
│   └── 📄 README.md              # Infrastructure documentation
├── 📁 Docs/                      # Project documentation
│   ├── 📄 AuthControllerAPI.md   # API documentation
│   ├── 📄 DataProtection.md      # Security documentation
│   ├── 📄 UserVerificationWorkflow.md
│   └── 📄 TASK-*.md              # Implementation task summaries
├── 📁 Scripts/                   # PowerShell deployment scripts
├── 📁 .github/                   # GitHub configuration
│   └── 📁 workflows/             # GitHub Actions CI/CD
├── 📁 .vscode/                   # VS Code settings
├── 📄 azure.yaml                 # Azure Developer CLI configuration
├── 📄 bicepconfig.json           # Bicep configuration
├── 📄 .gitignore                 # Git ignore rules
├── 📄 env.template               # Environment variables template
└── 📄 README.md                  # This file
```

---

**Built with ❤️ for the Chinese community in New Zealand**
