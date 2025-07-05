# Changelog

All notable changes to the Akyyra Commit Muse extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-05

### Added
- 🎵 **Initial release of Akyyra Commit Muse**
- **Git Dashboard** with real-time status monitoring
- **AI Commit Message Generation** with 5 style options:
  - Conventional Commits
  - TLDR Developer
  - Corporate
  - Gen Z
  - Custom
- **Multi-AI Provider Support**:
  - OpenAI GPT-3.5 Turbo
  - Mistral AI
  - Anthropic Claude
- **File Management**:
  - Stage/unstage individual files
  - Stage all changes at once
  - View file diffs in VS Code
- **Branch Information**:
  - Current branch display
  - Ahead/behind commit counters
  - Sync status indicators
- **Git Operations**:
  - Pull, push, and fetch commands
  - Commit with custom messages
  - Error handling and user feedback
- **Commit History**:
  - Last 10 commits display
  - Author, date, and message information
  - Commit hash display
- **Professional UI**:
  - VS Code native theming
  - Responsive design
  - Smooth animations
  - Accessibility support
- **Configuration Options**:
  - AI provider selection
  - API key management
  - Default commit style
  - Auto-stage toggle
- **Logging and Debugging**:
  - Output channel for troubleshooting
  - Comprehensive error handling
  - Development tools and tasks

### Features
- **Sidebar Integration**: Always-available Git control center
- **Real-time Updates**: Automatic refresh on file changes
- **Smart Error Handling**: User-friendly error messages
- **Extensible Architecture**: Easy to add new features
- **TypeScript**: Fully typed for better development experience

### Developer Experience
- Complete TypeScript setup with strict mode
- ESLint configuration for code quality
- Mocha test framework integration
- VS Code debugging configuration
- Watch mode for development
- Comprehensive documentation

### Security
- API keys stored securely in VS Code settings
- No data collection or telemetry
- All Git operations performed locally

### Performance
- Lightweight extension with minimal resource usage
- Efficient Git operations using simple-git library
- Debounced updates to prevent excessive API calls
- Optimized webview for smooth user experience
