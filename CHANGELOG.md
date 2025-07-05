# Change Log

All notable changes to the "akyyra-commit-muse" extension will be documented in this file.

## [0.0.1] - 2025-01-05

### ✨ Initial Release

#### 🧠 **AI-Powered Features**
- **Smart Commit Generation**: AI analyzes staged changes and generates contextual commit messages
- **Multiple AI Providers**: Support for OpenAI GPT-3.5/4, Anthropic Claude, and Mistral AI
- **Intelligent Prompting**: Optimized prompts for different commit styles and contexts

#### 🎨 **Commit Vibes & Styles**
- **Conventional Commits**: Standard `feat:`, `fix:`, `docs:` format
- **Emoji Style**: Commits with relevant emojis (✨, 🐛, 📚, etc.)
- **Corporate Professional**: Formal, business-appropriate commit messages
- **Casual & Friendly**: Approachable, easy-to-understand commit messages
- **Gen Z Vibes**: Fun, modern slang with personality while staying professional
- **Custom Prompts**: User-defined custom commit message styles

#### 🎤 **Voice Input**
- **Speech Recognition**: Click-to-talk commit message input
- **Multi-language Support**: Configurable voice recognition languages
- **Web Speech API Integration**: Browser-native speech recognition
- **Real-time Transcription**: Live speech-to-text conversion

#### 📊 **PR Summarization**
- **Intelligent PR Analysis**: Summarizes entire pull requests in 2-3 sentences
- **Impact Assessment**: Explains what changes do and their impact on the codebase
- **Review-Ready Output**: Perfect summaries for code review contexts
- **Branch Comparison**: Compares current branch with main/master

#### 🎯 **Workflow Integration**
- **Auto-Suggestions**: Optional commit message suggestions on file save
- **Git Integration**: Seamless staging and committing from the UI
- **File Management**: View, stage, and unstage files directly from the panel
- **Status Bar Integration**: Quick access and notifications
- **Command Palette**: All features accessible via VS Code commands

#### 🌍 **Modern UI/UX**
- **WebView Panel**: Beautiful, responsive interface built with TailwindCSS
- **Glass Morphism Design**: Modern glass effects and gradient backgrounds
- **Real-time Updates**: Live file status and repository information
- **Responsive Layout**: Works great on all screen sizes
- **Accessibility**: Screen reader support and keyboard navigation
- **Toast Notifications**: User-friendly success/error messages

#### ⚙️ **Configuration & Settings**
- **Flexible Configuration**: Extensive settings for all features
- **Secure API Key Storage**: Encrypted storage in VS Code settings
- **Default Vibe Selection**: Set your preferred commit style
- **Custom Prompt Support**: Write your own AI prompts
- **Voice Language Config**: Choose your preferred speech recognition language
- **Auto-Suggest Toggle**: Enable/disable automatic commit suggestions

#### 🔧 **Technical Features**
- **TypeScript Implementation**: Full TypeScript with strict mode
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance Optimized**: Efficient Git operations and AI API calls
- **Security First**: No data collection, local processing, secure API handling
- **Extensible Architecture**: Clean separation of concerns for future enhancements

#### 🏗️ **Development Tools**
- **ESBuild Integration**: Fast compilation and bundling
- **ESLint Configuration**: Code quality and consistency
- **Test Framework**: Mocha and Chai for comprehensive testing
- **Watch Mode**: Live development with automatic recompilation
- **Debug Support**: Full VS Code debugging integration

### 🎯 **Commands Added**
- `akyyra-commit-muse.openPanel`: Open the main Commit Muse panel
- `akyyra-commit-muse.generateCommit`: Generate AI commit message for staged changes
- `akyyra-commit-muse.voiceCommit`: Start voice input for commit messages
- `akyyra-commit-muse.summarizePR`: Generate intelligent PR summary
- `akyyra-commit-muse.settings`: Quick access to extension settings

### 🔧 **Configuration Options Added**
- `akyyra-commit-muse.aiProvider`: Choose AI provider (OpenAI, Anthropic, Mistral)
- `akyyra-commit-muse.apiKey`: Secure API key storage
- `akyyra-commit-muse.defaultVibe`: Default commit message style
- `akyyra-commit-muse.customPrompt`: Custom AI prompt for commit generation
- `akyyra-commit-muse.autoSuggest`: Enable automatic commit suggestions
- `akyyra-commit-muse.voiceLanguage`: Voice recognition language setting

### 🎨 **UI Components**
- **Repository Status Panel**: Live branch and change information
- **File Management Interface**: Staged and unstaged file visualization
- **Commit Vibe Selector**: Interactive style selection with examples
- **Commit Message Editor**: Rich text area with voice input integration
- **Quick Actions Panel**: One-click access to common operations
- **PR Summary Display**: Beautiful rendering of AI-generated summaries

### 🚀 **Performance & Quality**
- **Zero Compilation Errors**: Clean TypeScript compilation
- **Linting Compliance**: Passes all ESLint checks
- **Fast Startup**: Optimized extension activation
- **Efficient Git Operations**: Minimal overhead Git integration
- **Responsive UI**: Smooth interactions and animations

### 🔒 **Security & Privacy**
- **Local Git Operations**: All Git operations happen locally
- **Secure API Communication**: HTTPS-only API calls with proper error handling
- **No Data Collection**: Extension doesn't collect or transmit user data
- **Encrypted Settings**: API keys stored in VS Code's encrypted storage

### 📦 **Dependencies**
- **simple-git**: Reliable Git operations
- **axios**: HTTP client for AI API calls
- **TailwindCSS**: Modern UI framework (via CDN)
- **TypeScript**: Type-safe development
- **ESBuild**: Fast bundling and compilation

### 🎯 **Supported Platforms**
- **Windows**: Full compatibility with PowerShell
- **macOS**: Native support with Terminal
- **Linux**: Complete functionality with Bash/Zsh
- **VS Code Web**: WebView functionality in browser environments

---

## 📋 **Known Limitations**
- Voice input requires modern browser with Web Speech API support
- AI features require internet connection and valid API keys
- Git operations require repository to be initialized

## 🛣️ **Upcoming in v0.1.0**
- GitHub/GitLab integration for automatic PR title generation
- Commit history enhancement with AI rewriting
- Team collaboration features with shared custom vibes
- Advanced analytics and commit pattern insights
- Multi-repository support from single panel

---

**Initial release brings the full vision of AI-powered Git commits to life! 🚀**