# 🎵 Akyyra Commit Muse

**Professional Git control center with AI-powered commit messages for VS Code**

Transform your Git workflow with a beautiful, intelligent sidebar that handles all your version control needs. Think GitHub Desktop meets GitLens with AI superpowers, all inside VS Code.

## ✨ Features

### 🎯 **Smart Git Dashboard**
- **Always-pinned sidebar** for instant Git access
- **Real-time status** monitoring with auto-refresh
- **Visual file staging** with one-click stage/unstage
- **Branch management** with create, switch, and delete
- **Sync controls** for pull, push, and fetch operations

### 🤖 **AI Commit Assistant**
- **5 commit styles**: Conventional, TLDR Dev, Corporate, Gen Z, Custom
- **Multi-provider support**: OpenAI, Mistral, Claude
- **Smart diff analysis** for context-aware messages
- **One-click generation** from staged changes

### 📊 **Git History & Insights**
- **Commit timeline** with author and date info
- **File diff viewer** with syntax highlighting
- **Conflict detection** and resolution helpers
- **Branch sync status** with ahead/behind counters

### 🎨 **Beautiful UI**
- **VS Code native theming** that adapts to your setup
- **Responsive design** that works in any sidebar size
- **Smooth animations** and hover effects
- **Accessibility-first** design with keyboard navigation

## 🚀 Quick Start

1. **Install the extension** from VS Code Marketplace
2. **Open any Git repository** in VS Code
3. **Click the Akyyra icon** in the Activity Bar
4. **Configure your AI provider** in settings (optional)
5. **Start committing with style!**

## ⚙️ Configuration

### AI Provider Setup

1. Open VS Code Settings (`Ctrl+,`)
2. Search for "Akyyra"
3. Configure your preferred AI provider:

#### OpenAI Setup
- Set **AI Provider** to `openai`
- Add your **API Key** from [OpenAI Platform](https://platform.openai.com/api-keys)

#### Mistral Setup
- Set **AI Provider** to `mistral`
- Add your **API Key** from [Mistral Console](https://console.mistral.ai/)

#### Claude Setup
- Set **AI Provider** to `claude`
- Add your **API Key** from [Anthropic Console](https://console.anthropic.com/)

### Commit Styles

Choose your default commit message style:

- **Conventional**: `feat(scope): add new feature`
- **TLDR Dev**: `add user authentication system`
- **Corporate**: `Implement user authentication system with JWT tokens`
- **Gen Z**: `✨ auth system is now live fr fr 🔐`
- **Custom**: Flexible style for any format

## 🎯 Usage

### Staging Files
- **Stage individual files**: Click the "Stage" button next to any modified file
- **Stage all changes**: Click "Stage All" in the Changes section
- **Unstage files**: Click "Unstage" next to staged files

### Creating Commits
1. **Stage your changes** using the file buttons or "Stage All"
2. **Generate AI message** by clicking the ✨ AI button or style buttons
3. **Edit the message** if needed in the text area
4. **Commit** by clicking "Commit Changes"

### Branch Management
- **View current branch** and sync status in the Branch section
- **Pull/Push/Fetch** using the action buttons
- **Switch branches** using the dropdown (future feature)

### Viewing Changes
- **Click any file** to view its diff in a new tab
- **Hover over files** to see quick status information
- **Review commit history** in the History section

## 🛠️ Development

### Prerequisites
- Node.js 16+
- VS Code 1.80+
- Git repository

### Building from Source
```bash
# Clone the repository
git clone https://github.com/akyyra/commit-muse.git
cd commit-muse

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package
```

### Testing
```bash
# Run tests
npm test

# Lint code
npm run lint

# Watch for changes
npm run watch
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- VS Code Extension API team
- Simple Git library maintainers
- AI providers (OpenAI, Mistral, Anthropic)
- The amazing VS Code community

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/akyyra/commit-muse/issues)
- **Discussions**: [Join the community](https://github.com/akyyra/commit-muse/discussions)
- **Documentation**: [Full docs](https://akyyra.github.io/commit-muse)

---

**Made with ❤️ by the Akyyra team**

*Transform your Git workflow today with Akyyra Commit Muse!*
