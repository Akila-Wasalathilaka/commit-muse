# 🚀 Akyyra Commit Muse

> **AI-powered Git commit assistant that makes commit messages actually enjoyable** ✨

Transform your Git workflow with intelligent commit message generation, voice input, PR summarization, and multiple personality vibes. No more boring commit messages!

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-1.101.0+-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🌟 Features

### 🧠 **AI-Powered Commit Generation**
- **Smart Analysis**: Analyzes your staged changes and generates contextual commit messages
- **Multiple AI Providers**: Support for OpenAI, Anthropic Claude, and Mistral AI
- **Intelligent Prompting**: Uses optimized prompts for each commit style

### 🎨 **Commit Vibes & Styles**
- **Conventional Commits**: `feat: add user authentication with JWT tokens`
- **Emoji Style**: `✨ Add user authentication with JWT tokens`
- **Corporate Professional**: `Implement user authentication functionality using JWT tokens`
- **Casual & Friendly**: `Added login functionality so users can sign in securely`
- **Gen Z Vibes**: `no cap added fire auth system that actually slaps 🔥`
- **Custom Prompts**: Create your own unique commit styles

### 🎤 **Voice-to-Commit**
- **Speech Recognition**: Click the mic and speak your commit message
- **Multi-language Support**: Configurable voice recognition languages
- **AI Enhancement**: Optional AI processing of voice input

### 📊 **PR Summarization**
- **Intelligent Analysis**: Summarizes entire pull requests in 2-3 sentences
- **Impact Assessment**: Explains what changes do and their impact
- **Review-Ready**: Perfect for code review contexts

### 🎯 **Smart Workflow Integration**
- **Auto-Suggestions**: Optional commit suggestions on file save
- **Git Integration**: Seamless staging and committing from the UI
- **Status Bar Indicators**: Quick access and notifications
- **One-Click Actions**: Stage, commit, and manage files effortlessly

### 🌍 **Modern UI/UX**
- **WebView Panel**: Beautiful, responsive interface with TailwindCSS
- **Glass Morphism**: Modern design with glass effects and gradients
- **Real-time Updates**: Live file status and repository information
- **Accessibility**: Screen reader support and keyboard navigation

## 🚀 Quick Start

### 1. **Installation**
- Install from VS Code Marketplace (coming soon)
- Or clone and install locally:
  ```bash
  git clone <repository-url>
  cd akyyra-commit-muse
  npm install
  npm run compile
  ```

### 2. **Configuration**
1. Open VS Code Settings (`Ctrl+,`)
2. Search for "Akyyra Commit Muse"
3. Configure your AI provider and API key:
   - **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com)
   - **Anthropic**: Get API key from [console.anthropic.com](https://console.anthropic.com)
   - **Mistral**: Get API key from [console.mistral.ai](https://console.mistral.ai)

### 3. **Usage**
1. **Open the Panel**: 
   - Command Palette: `Akyyra: Open Commit Muse`
   - Status Bar: Click the "Commit Muse" button
   - Git SCM: Click the Akyyra icon

2. **Stage Your Changes**: Use the UI or VS Code's built-in Git panel

3. **Choose Your Vibe**: Select from conventional, emoji, corporate, casual, Gen Z, or custom

4. **Generate & Commit**:
   - Click "✨ Generate" for AI-powered messages
   - Use "🎤 Voice" for speech input
   - Click "🚀 Commit Changes" to commit

## ⚙️ Configuration Options

```json
{
  "akyyra-commit-muse.aiProvider": "openai",          // AI provider: openai, anthropic, mistral
  "akyyra-commit-muse.apiKey": "",                    // Your AI API key
  "akyyra-commit-muse.defaultVibe": "conventional",   // Default commit style
  "akyyra-commit-muse.customPrompt": "",              // Custom AI prompt
  "akyyra-commit-muse.autoSuggest": false,            // Auto-suggest on save
  "akyyra-commit-muse.voiceLanguage": "en-US"         // Voice recognition language
}
```

## 🎯 Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `akyyra-commit-muse.openPanel` | Open the main panel | - |
| `akyyra-commit-muse.generateCommit` | Generate AI commit message | - |
| `akyyra-commit-muse.voiceCommit` | Start voice input | - |
| `akyyra-commit-muse.summarizePR` | Summarize current PR | - |
| `akyyra-commit-muse.settings` | Open extension settings | - |

## 🏗️ Architecture

```
src/
├── extension.ts              # Main extension entry point
├── services/
│   ├── GitService.ts        # Git operations & repository management
│   └── AIService.ts         # AI provider integrations & prompt handling
└── providers/
    ├── WebviewProvider.ts   # Modern UI panel with TailwindCSS
    └── StatusBarProvider.ts # Status bar integration & notifications
```

## 🔒 Security & Privacy

- **API Keys**: Stored securely in VS Code's encrypted settings
- **Local Processing**: Git operations happen locally
- **No Data Collection**: Extension doesn't collect or transmit user data
- **Open Source**: Full transparency in code and operations

## 🛠️ Development

### Prerequisites
- Node.js 16+
- VS Code 1.101.0+
- Git repository for testing

### Setup
```bash
git clone <repository-url>
cd akyyra-commit-muse
npm install
npm run compile
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run watch

# Debug in VS Code
F5 (Launch Extension)
```

### Building
```bash
# Development build
npm run compile

# Production build
npm run package
```

## 📈 Roadmap

### 🔄 **Upcoming Features**
- [ ] **GitHub/GitLab Integration**: Automatic PR title and description generation
- [ ] **Commit History Enhancement**: AI-powered rewriting of old commits
- [ ] **Team Collaboration**: Shared custom vibes and templates
- [ ] **Advanced Analytics**: Commit pattern insights and suggestions
- [ ] **Multi-Repository Support**: Manage multiple repos from one panel

### 🌟 **Future Enhancements**
- [ ] **Plugin Ecosystem**: Community-created commit vibes
- [ ] **IDE Integration**: Support for other editors
- [ ] **Advanced Voice Features**: Voice commands for Git operations
- [ ] **Changelog Generation**: Auto-generate changelogs from commits
- [ ] **Commit Message Templates**: Industry-specific templates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute
- 🐛 **Bug Reports**: Found an issue? Let us know!
- 💡 **Feature Requests**: Have an idea? We'd love to hear it!
- 🔧 **Code Contributions**: Submit PRs for fixes and features
- 📚 **Documentation**: Help improve our docs
- 🎨 **Design**: UI/UX improvements and suggestions

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **OpenAI, Anthropic, Mistral**: For their amazing AI APIs
- **VS Code Team**: For the excellent extension platform
- **TailwindCSS**: For the beautiful UI framework
- **simple-git**: For Git integration
- **Community**: For feedback and contributions

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: support@akyyra.com

---

**Made with ❤️ by the Akyyra team**

*Transform your Git workflow today! 🚀*

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
#   c o m m i t - m u s e  
 