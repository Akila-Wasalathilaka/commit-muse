# Contributing to Akyyra Commit Muse

Thank you for your interest in contributing to Akyyra Commit Muse! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the [GitHub Issues](https://github.com/akyyra/commit-muse/issues) page
- Search existing issues before creating a new one
- Provide clear reproduction steps
- Include VS Code version and operating system
- Add relevant error messages or screenshots

### Suggesting Features
- Open a feature request on GitHub Issues
- Describe the use case and expected behavior
- Explain how it fits with the extension's goals
- Consider if it could be implemented as a separate extension

### Code Contributions

#### Development Setup
1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/commit-muse.git
   cd commit-muse
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Open in VS Code**
   ```bash
   code .
   ```

4. **Run in Development Mode**
   - Press `F5` to launch Extension Development Host
   - Or use "Run Extension" from the Run view

#### Development Guidelines

**Code Style**
- Use TypeScript for all new code
- Follow existing code formatting
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

**Testing**
- Write tests for new features
- Ensure existing tests pass: `npm test`
- Test with different Git repository states
- Test error conditions and edge cases

**Architecture**
- Keep components focused and single-purpose
- Use dependency injection for testability
- Handle errors gracefully with user feedback
- Follow VS Code extension best practices

#### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run compile
   npm test
   npm run lint
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a pull request on GitHub
   - Provide clear description of changes
   - Link to related issues

## 📋 Development Standards

### Code Organization
```
src/
├── extension.ts          # Main extension entry point
├── panels/              # Webview panels and providers
├── git/                 # Git operations and management
├── ai/                  # AI commit message generation
├── utils/               # Shared utilities and helpers
└── test/                # Test files and test setup
```

### TypeScript Guidelines
- Enable strict mode in tsconfig.json
- Use explicit types instead of `any`
- Prefer interfaces over type aliases for objects
- Use enum for constants with multiple values

### Error Handling
- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log detailed errors for debugging
- Don't expose internal errors to users

### Git Integration
- Use the simple-git library for Git operations
- Handle repository state changes gracefully
- Support repositories in any state (dirty, clean, etc.)
- Respect user's Git configuration

### AI Integration
- Support multiple AI providers
- Handle API failures gracefully
- Respect rate limits and API quotas
- Don't send sensitive information to AI APIs

## 🎯 Project Goals

### Primary Goals
- **Simplicity**: Easy to use without learning curve
- **Performance**: Fast and responsive user experience
- **Reliability**: Works consistently across different Git repositories
- **Accessibility**: Usable by developers with different abilities

### Design Principles
- **VS Code Native**: Feels like part of VS Code
- **Non-Intrusive**: Doesn't interfere with existing workflows
- **Extensible**: Easy to add new features and AI providers
- **Secure**: Handles API keys and data safely

## 🔍 Review Process

### What We Look For
- **Functionality**: Does it work as intended?
- **Code Quality**: Is it readable and maintainable?
- **Testing**: Are there adequate tests?
- **Documentation**: Are changes documented?
- **Performance**: Does it impact extension performance?

### Review Timeline
- Initial review within 3-5 business days
- Follow-up reviews within 1-2 business days
- Complex changes may require additional review time

## 🚀 Release Process

### Version Numbering
- Follow [Semantic Versioning](https://semver.org/)
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number bumped
- [ ] Extension tested in development host
- [ ] Package created and tested

## ❓ Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Code Review**: Feedback on pull requests

### Documentation
- **README.md**: User documentation and setup
- **Code Comments**: Inline documentation
- **Type Definitions**: TypeScript interfaces and types

### Common Questions

**Q: How do I add a new AI provider?**
A: Extend the `AICommitGenerator` class and add the provider to the configuration enum.

**Q: How do I add a new commit style?**
A: Add the style to the `commitStyles` object in `AICommitGenerator`.

**Q: How do I test with different Git states?**
A: Create test repositories in various states or use Git commands to modify the current repository.

**Q: How do I debug the webview?**
A: Use the Developer Tools in the Extension Development Host (Ctrl+Shift+I).

---

Thank you for contributing to Akyyra Commit Muse! Your contributions help make Git workflows better for developers everywhere. 🎵
