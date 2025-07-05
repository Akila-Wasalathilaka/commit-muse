import * as vscode from 'vscode';
import * as path from 'path';
import { GitService } from '../services/GitService';
import { AIService } from '../services/AIService';

export class WebviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private readonly extensionUri: vscode.Uri;

    constructor(
        private context: vscode.ExtensionContext,
        private gitService: GitService,
        private aiService: AIService
    ) {
        this.extensionUri = context.extensionUri;
    }

    public showPanel() {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (this.panel) {
            this.panel.reveal(column);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'akyyra-commit-muse',
            '🚀 Akyyra Commit Muse',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this.extensionUri],
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.setupWebviewMessageHandling();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.context.subscriptions);

        // Load initial data
        this.updateWebviewData();
    }

    public activateVoiceInput() {
        if (this.panel) {
            this.panel.webview.postMessage({ command: 'activateVoice' });
        }
    }

    private setupWebviewMessageHandling() {
        if (!this.panel) {
            return;
        }

        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'generateCommit':
                        await this.handleGenerateCommit(message.vibe);
                        break;
                    case 'commitChanges':
                        await this.handleCommitChanges(message.message);
                        break;
                    case 'stageFiles':
                        await this.handleStageFiles(message.files);
                        break;
                    case 'voiceInput':
                        await this.handleVoiceInput(message.text);
                        break;
                    case 'summarizePR':
                        await this.handleSummarizePR();
                        break;
                    case 'refreshData':
                        await this.updateWebviewData();
                        break;
                    case 'openSettings':
                        vscode.commands.executeCommand('workbench.action.openSettings', 'akyyra-commit-muse');
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleGenerateCommit(vibe: string) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.sendMessage({ command: 'error', message: 'No workspace folder found' });
                return;
            }

            this.sendMessage({ command: 'loading', isLoading: true });

            const diff = await this.gitService.getStagedDiff(workspaceFolder.uri.fsPath);
            if (!diff) {
                this.sendMessage({ 
                    command: 'error', 
                    message: 'No staged changes found. Please stage some files first.' 
                });
                this.sendMessage({ command: 'loading', isLoading: false });
                return;
            }

            const message = await this.aiService.generateCommitMessage(diff, vibe);
            if (message) {
                this.sendMessage({ 
                    command: 'commitGenerated', 
                    message: message 
                });
            } else {
                this.sendMessage({ 
                    command: 'error', 
                    message: 'Failed to generate commit message' 
                });
            }

            this.sendMessage({ command: 'loading', isLoading: false });
        } catch (error) {
            this.sendMessage({ 
                command: 'error', 
                message: `Error: ${error}` 
            });
            this.sendMessage({ command: 'loading', isLoading: false });
        }
    }

    private async handleCommitChanges(message: string) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.sendMessage({ command: 'error', message: 'No workspace folder found' });
                return;
            }

            const success = await this.gitService.commitChanges(message, workspaceFolder.uri.fsPath);
            if (success) {
                this.sendMessage({ 
                    command: 'success', 
                    message: 'Changes committed successfully! 🎉' 
                });
                await this.updateWebviewData();
            } else {
                this.sendMessage({ 
                    command: 'error', 
                    message: 'Failed to commit changes' 
                });
            }
        } catch (error) {
            this.sendMessage({ 
                command: 'error', 
                message: `Error: ${error}` 
            });
        }
    }

    private async handleStageFiles(files: string[]) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.sendMessage({ command: 'error', message: 'No workspace folder found' });
                return;
            }

            const success = await this.gitService.stageFiles(files, workspaceFolder.uri.fsPath);
            if (success) {
                this.sendMessage({ 
                    command: 'success', 
                    message: 'Files staged successfully!' 
                });
                await this.updateWebviewData();
            } else {
                this.sendMessage({ 
                    command: 'error', 
                    message: 'Failed to stage files' 
                });
            }
        } catch (error) {
            this.sendMessage({ 
                command: 'error', 
                message: `Error: ${error}` 
            });
        }
    }

    private async handleVoiceInput(text: string) {
        try {
            // Enhance the voice input with AI if needed
            const config = vscode.workspace.getConfiguration('akyyra-commit-muse');
            const defaultVibe = config.get<string>('defaultVibe', 'conventional');
            
            // For now, just use the text as-is, but we could enhance it with AI
            this.sendMessage({ 
                command: 'commitGenerated', 
                message: text 
            });
        } catch (error) {
            this.sendMessage({ 
                command: 'error', 
                message: `Voice input error: ${error}` 
            });
        }
    }

    private async handleSummarizePR() {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.sendMessage({ command: 'error', message: 'No workspace folder found' });
                return;
            }

            this.sendMessage({ command: 'loading', isLoading: true });

            const prDiff = await this.gitService.getPRDiff(workspaceFolder.uri.fsPath);
            if (!prDiff) {
                this.sendMessage({ 
                    command: 'error', 
                    message: 'No PR changes found. Make sure you\'re on a feature branch.' 
                });
                this.sendMessage({ command: 'loading', isLoading: false });
                return;
            }

            const summary = await this.aiService.summarizePR(prDiff);
            if (summary) {
                this.sendMessage({ 
                    command: 'prSummary', 
                    summary: summary 
                });
            } else {
                this.sendMessage({ 
                    command: 'error', 
                    message: 'Failed to generate PR summary' 
                });
            }

            this.sendMessage({ command: 'loading', isLoading: false });
        } catch (error) {
            this.sendMessage({ 
                command: 'error', 
                message: `Error: ${error}` 
            });
            this.sendMessage({ command: 'loading', isLoading: false });
        }
    }

    private async updateWebviewData() {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return;
            }

            const [repoInfo, unstagedFiles, stagedFiles, vibes] = await Promise.all([
                this.gitService.getRepoInfo(workspaceFolder.uri.fsPath),
                this.gitService.getUnstagedFiles(workspaceFolder.uri.fsPath),
                this.gitService.getStagedFiles(workspaceFolder.uri.fsPath),
                Promise.resolve(this.aiService.getAvailableVibes())
            ]);

            const config = vscode.workspace.getConfiguration('akyyra-commit-muse');

            this.sendMessage({
                command: 'updateData',
                data: {
                    repoInfo,
                    unstagedFiles,
                    stagedFiles,
                    vibes,
                    config: {
                        defaultVibe: config.get<string>('defaultVibe', 'conventional'),
                        aiProvider: config.get<string>('aiProvider', 'openai'),
                        hasApiKey: !!config.get<string>('apiKey', ''),
                        voiceLanguage: config.get<string>('voiceLanguage', 'en-US')
                    }
                }
            });
        } catch (error) {
            console.error('Error updating webview data:', error);
        }
    }

    private sendMessage(message: any) {
        if (this.panel) {
            this.panel.webview.postMessage(message);
        }
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akyyra Commit Muse</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .neon-glow {
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .commit-vibe {
            transition: all 0.3s ease;
        }
        .commit-vibe:hover {
            transform: scale(1.05);
        }
        .file-item {
            transition: all 0.2s ease;
        }
        .file-item:hover {
            background: rgba(102, 126, 234, 0.1);
        }
        .loading-spinner {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        }
        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }
        .toast.success {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        .toast.error {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        .voice-pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div id="toast" class="toast"></div>
    
    <!-- Header -->
    <div class="gradient-bg p-6 text-center">
        <h1 class="text-3xl font-bold mb-2">🚀 Akyyra Commit Muse</h1>
        <p class="text-blue-100">AI-powered Git commits that actually slap</p>
    </div>

    <div class="container mx-auto p-6 max-w-4xl">
        <!-- Repository Info -->
        <div id="repo-info" class="glass rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold mb-1">Repository Status</h2>
                    <p id="branch-info" class="text-gray-300">Loading...</p>
                </div>
                <button onclick="refreshData()" class="btn-primary px-4 py-2 rounded-lg text-white font-medium">
                    🔄 Refresh
                </button>
            </div>
        </div>

        <!-- File Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Unstaged Files -->
            <div class="glass rounded-lg p-4">
                <h3 class="text-lg font-semibold mb-3 flex items-center">
                    📄 Unstaged Changes
                    <span id="unstaged-count" class="ml-2 bg-orange-500 text-xs px-2 py-1 rounded-full">0</span>
                </h3>
                <div id="unstaged-files" class="space-y-2 max-h-40 overflow-y-auto">
                    <!-- Files will be populated here -->
                </div>
                <button onclick="stageAllFiles()" class="mt-3 w-full bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded text-sm font-medium transition-colors">
                    Stage All
                </button>
            </div>

            <!-- Staged Files -->
            <div class="glass rounded-lg p-4">
                <h3 class="text-lg font-semibold mb-3 flex items-center">
                    ✅ Staged Changes
                    <span id="staged-count" class="ml-2 bg-green-500 text-xs px-2 py-1 rounded-full">0</span>
                </h3>
                <div id="staged-files" class="space-y-2 max-h-40 overflow-y-auto">
                    <!-- Files will be populated here -->
                </div>
            </div>
        </div>

        <!-- Commit Vibes -->
        <div class="glass rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">🎨 Choose Your Vibe</h3>
            <div id="commit-vibes" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <!-- Vibes will be populated here -->
            </div>
        </div>

        <!-- Commit Message Area -->
        <div class="glass rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold">💬 Commit Message</h3>
                <div class="flex gap-2">
                    <button id="voice-btn" onclick="startVoiceInput()" class="btn-primary px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2">
                        🎤 Voice
                    </button>
                    <button id="generate-btn" onclick="generateCommit()" class="btn-primary px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2">
                        <span id="generate-spinner" class="loading-spinner hidden">⚡</span>
                        ✨ Generate
                    </button>
                </div>
            </div>
            
            <textarea 
                id="commit-message" 
                placeholder="Type your commit message or use AI to generate one..."
                class="w-full h-24 bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
            ></textarea>
            
            <div class="flex gap-3 mt-4">
                <button onclick="commitChanges()" class="btn-primary px-6 py-3 rounded-lg text-white font-medium flex-1">
                    🚀 Commit Changes
                </button>
                <button onclick="summarizePR()" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg text-white font-medium transition-colors">
                    📊 Summarize PR
                </button>
            </div>
        </div>

        <!-- PR Summary -->
        <div id="pr-summary" class="glass rounded-lg p-6 mb-6 hidden">
            <h3 class="text-xl font-semibold mb-4">📋 PR Summary</h3>
            <div id="pr-summary-content" class="bg-gray-800 p-4 rounded-lg text-gray-300">
                <!-- PR summary will appear here -->
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="glass rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4">⚡ Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onclick="openSettings()" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-center transition-colors">
                    ⚙️<br><span class="text-sm">Settings</span>
                </button>
                <button onclick="refreshData()" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-center transition-colors">
                    🔄<br><span class="text-sm">Refresh</span>
                </button>
                <button onclick="copyLastCommit()" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-center transition-colors">
                    📋<br><span class="text-sm">Copy Last</span>
                </button>
                <button onclick="clearMessage()" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-center transition-colors">
                    🗑️<br><span class="text-sm">Clear</span>
                </button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentVibe = 'conventional';
        let isRecording = false;
        let recognition = null;

        // Initialize speech recognition if available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                document.getElementById('commit-message').value = transcript;
                vscode.postMessage({ command: 'voiceInput', text: transcript });
            };

            recognition.onerror = function(event) {
                showToast('Voice input error: ' + event.error, 'error');
                stopVoiceInput();
            };

            recognition.onend = function() {
                stopVoiceInput();
            };
        }

        // Message handling from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'updateData':
                    updateUI(message.data);
                    break;
                case 'commitGenerated':
                    document.getElementById('commit-message').value = message.message;
                    showToast('Commit message generated! 🎉', 'success');
                    break;
                case 'success':
                    showToast(message.message, 'success');
                    break;
                case 'error':
                    showToast(message.message, 'error');
                    break;
                case 'loading':
                    toggleLoading(message.isLoading);
                    break;
                case 'prSummary':
                    showPRSummary(message.summary);
                    break;
                case 'activateVoice':
                    startVoiceInput();
                    break;
            }
        });

        function updateUI(data) {
            // Update repo info
            const branchInfo = document.getElementById('branch-info');
            if (data.repoInfo) {
                branchInfo.textContent = \`Branch: \${data.repoInfo.branch} | Changes: \${data.repoInfo.hasChanges ? 'Yes' : 'None'}\`;
            }

            // Update unstaged files
            updateFileList('unstaged-files', data.unstagedFiles || [], 'unstaged-count', true);
            
            // Update staged files
            updateFileList('staged-files', data.stagedFiles || [], 'staged-count', false);

            // Update commit vibes
            updateCommitVibes(data.vibes || []);

            // Update voice language if needed
            if (recognition && data.config?.voiceLanguage) {
                recognition.lang = data.config.voiceLanguage;
            }
        }

        function updateFileList(containerId, files, countId, showStageButton) {
            const container = document.getElementById(containerId);
            const count = document.getElementById(countId);
            
            count.textContent = files.length;
            container.innerHTML = '';

            if (files.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-sm">No files</p>';
                return;
            }

            files.forEach(file => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file-item flex items-center justify-between p-2 rounded bg-gray-800';
                fileDiv.innerHTML = \`
                    <span class="text-sm truncate flex-1">\${file}</span>
                    \${showStageButton ? \`<button onclick="stageFile('\${file}')" class="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded ml-2">Stage</button>\` : ''}
                \`;
                container.appendChild(fileDiv);
            });
        }

        function updateCommitVibes(vibes) {
            const container = document.getElementById('commit-vibes');
            container.innerHTML = '';

            vibes.forEach(vibe => {
                const vibeDiv = document.createElement('div');
                vibeDiv.className = \`commit-vibe p-3 rounded-lg cursor-pointer border-2 transition-all \${currentVibe === vibe.name.toLowerCase().replace(' ', '') ? 'border-blue-500 bg-blue-900' : 'border-gray-600 bg-gray-800'}\`;
                vibeDiv.onclick = () => selectVibe(vibe.name.toLowerCase().replace(' ', ''));
                vibeDiv.innerHTML = \`
                    <div class="font-medium text-sm">\${vibe.name}</div>
                    <div class="text-xs text-gray-400 mt-1">\${vibe.example}</div>
                \`;
                container.appendChild(vibeDiv);
            });
        }

        function selectVibe(vibe) {
            currentVibe = vibe;
            updateCommitVibes(document.querySelectorAll('.commit-vibe'));
            
            // Update UI to show selected vibe
            document.querySelectorAll('.commit-vibe').forEach(el => {
                el.className = el.className.replace('border-blue-500 bg-blue-900', 'border-gray-600 bg-gray-800');
            });
            event.target.closest('.commit-vibe').className = event.target.closest('.commit-vibe').className.replace('border-gray-600 bg-gray-800', 'border-blue-500 bg-blue-900');
        }

        function generateCommit() {
            vscode.postMessage({ command: 'generateCommit', vibe: currentVibe });
        }

        function commitChanges() {
            const message = document.getElementById('commit-message').value.trim();
            if (!message) {
                showToast('Please enter a commit message', 'error');
                return;
            }
            vscode.postMessage({ command: 'commitChanges', message });
        }

        function stageFile(file) {
            vscode.postMessage({ command: 'stageFiles', files: [file] });
        }

        function stageAllFiles() {
            const unstagedFiles = Array.from(document.querySelectorAll('#unstaged-files .file-item span'))
                .map(span => span.textContent);
            if (unstagedFiles.length > 0) {
                vscode.postMessage({ command: 'stageFiles', files: unstagedFiles });
            }
        }

        function startVoiceInput() {
            if (!recognition) {
                showToast('Voice input not supported in this browser', 'error');
                return;
            }

            if (isRecording) {
                stopVoiceInput();
                return;
            }

            isRecording = true;
            const voiceBtn = document.getElementById('voice-btn');
            voiceBtn.innerHTML = '🛑 Stop';
            voiceBtn.className += ' voice-pulse';
            
            recognition.start();
            showToast('Listening... Speak your commit message', 'success');
        }

        function stopVoiceInput() {
            if (recognition && isRecording) {
                recognition.stop();
            }
            
            isRecording = false;
            const voiceBtn = document.getElementById('voice-btn');
            voiceBtn.innerHTML = '🎤 Voice';
            voiceBtn.className = voiceBtn.className.replace(' voice-pulse', '');
        }

        function summarizePR() {
            vscode.postMessage({ command: 'summarizePR' });
        }

        function showPRSummary(summary) {
            const container = document.getElementById('pr-summary');
            const content = document.getElementById('pr-summary-content');
            content.textContent = summary;
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }

        function refreshData() {
            vscode.postMessage({ command: 'refreshData' });
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }

        function copyLastCommit() {
            // This would copy the last commit message
            showToast('Feature coming soon!', 'success');
        }

        function clearMessage() {
            document.getElementById('commit-message').value = '';
        }

        function toggleLoading(isLoading) {
            const spinner = document.getElementById('generate-spinner');
            const generateBtn = document.getElementById('generate-btn');
            
            if (isLoading) {
                spinner.classList.remove('hidden');
                generateBtn.disabled = true;
            } else {
                spinner.classList.add('hidden');
                generateBtn.disabled = false;
            }
        }

        function showToast(message, type) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = \`toast \${type} show\`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Initialize
        vscode.postMessage({ command: 'refreshData' });
    </script>
</body>
</html>`;
    }
}
