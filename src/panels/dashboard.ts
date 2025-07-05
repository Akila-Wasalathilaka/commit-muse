import * as vscode from 'vscode';
import { GitManager, GitStatus } from '../git/gitManager';
import { AICommitGenerator } from '../ai/generateMessage';
import * as path from 'path';

export class AkyraDashboardProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'akyyra-dashboard';
    
    private _view?: vscode.WebviewView;
    private _gitStatus?: GitStatus;
    private _gitManager?: GitManager;
    private _aiGenerator?: AICommitGenerator;

    constructor(
        private readonly _extensionUri: vscode.Uri
    ) {
        // Subscribe to git changes
        vscode.workspace.onDidChangeWorkspaceFolders(() => this.refresh());
        const gitExt = vscode.extensions.getExtension('vscode.git');
        if (gitExt) {
            gitExt.activate().then(() => {
                console.log('Akyyra: Git extension activated');
                this.refresh();
            });
        }
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ): void | Thenable<void> {
        console.log('Akyyra: resolveWebviewView called for viewType:', AkyraDashboardProvider.viewType);
        console.log('Akyyra: webviewView object:', !!webviewView);
        console.log('Akyyra: context object:', !!context);
        
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        console.log('Akyyra: Webview options set, generating HTML...');
        try {
            const html = this._getHtmlForWebview(webviewView.webview);
            webviewView.webview.html = html;
            console.log('Akyyra: HTML set successfully, length:', html.length);
        } catch (error) {
            console.error('Akyyra: Error setting webview HTML:', error);
            // Set a minimal fallback HTML
            webviewView.webview.html = `<!DOCTYPE html>
            <html><head><title>Akyyra</title></head>
            <body><h1>🎵 Akyyra Commit Muse</h1><p>Loading...</p></body></html>`;
        }

        // Initialize Git manager and AI generator here
        try {
            console.log('Akyyra: Initializing Git manager');
            if (!this._gitManager) {
                this._gitManager = new GitManager();
                this._aiGenerator = new AICommitGenerator();
                // Initial status update
                this.refresh().catch(err => {
                    console.error('Akyyra: Failed to get initial Git status:', err);
                });
            }
            console.log('Akyyra: Git manager initialized');
        } catch (error) {
            console.error('Akyyra: Failed to initialize Git manager:', error);
            webviewView.webview.html = this._getErrorHtml('Failed to initialize Git. Please ensure you are in a Git repository.');
        }

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                if (!this.ensureInitialized()) {
                    vscode.window.showErrorMessage('Git manager not initialized. Please ensure you are in a Git repository.');
                    return;
                }
                
                switch (message.type) {
                    case 'refresh':
                        this.refresh();
                        break;
                    case 'stageFile':
                        this.stageFile(message.file);
                        break;
                    case 'unstageFile':
                        this.unstageFile(message.file);
                        break;
                    case 'stageAll':
                        this.stageAll();
                        break;
                    case 'commit':
                        this.commit(message.message);
                        break;
                    case 'generateCommit':
                        this.generateCommitMessage(message.style);
                        break;
                    case 'switchBranch':
                        this.switchBranch(message.branch);
                        break;
                    case 'createBranch':
                        this.createBranch(message.name);
                        break;
                    case 'pull':
                        this.pull();
                        break;
                    case 'push':
                        this.push();
                        break;
                    case 'fetch':
                        this.fetch();
                        break;
                    case 'showDiff':
                        this.showFileDiff(message.file);
                        break;
                }
            },
            undefined,
            []
        );

        // Initial load
        this.refresh();
    }

    public async refresh() {
        if (!this._view) {
            return;
        }

        try {
            // Show loading first
            this._view.webview.postMessage({
                type: 'showLoading'
            });

            if (!this._gitManager) {
                // Initialize Git manager if not done yet
                this._gitManager = new GitManager();
                this._aiGenerator = new AICommitGenerator();
                
                // Wait a bit for initialization
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const isRepo = await this._gitManager.isRepository();
            if (!isRepo) {
                this._view.webview.postMessage({
                    type: 'error',
                    message: 'No Git repository found in workspace'
                });
                return;
            }

            this._gitStatus = await this._gitManager.getStatus();
            const branches = await this._gitManager.getBranches();
            const commits = await this._gitManager.getCommitHistory(10);

            this._view.webview.postMessage({
                type: 'updateStatus',
                data: {
                    status: this._gitStatus,
                    branches: branches,
                    commits: commits
                }
            });
        } catch (error: any) {
            console.error('Refresh error:', error);
            this._view.webview.postMessage({
                type: 'error',
                message: `Error: ${error.message}`
            });
        }
    }

    public async generateCommitMessage(style?: string) {
        if (!this._view || !this._gitManager || !this._aiGenerator) {
            return;
        }

        try {
            const config = vscode.workspace.getConfiguration('akyyra');
            const defaultStyle = style || config.get<string>('commitStyle', 'conventional');
            
            const diff = await this._gitManager.getStagedDiff();
            const message = await this._aiGenerator.generateCommitMessage(diff, defaultStyle);

            this._view.webview.postMessage({
                type: 'commitMessageGenerated',
                message: message
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to generate commit message: ${error.message}`);
        }
    }

    private ensureInitialized(): boolean {
        return this._gitManager !== undefined;
    }

    private async stageFile(file: string) {
        if (!this.ensureInitialized()) {
            vscode.window.showErrorMessage('Git manager not initialized');
            return;
        }
        
        try {
            await this._gitManager!.stageFile(file);
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to stage file: ${error.message}`);
        }
    }

    private async unstageFile(file: string) {
        if (!this.ensureInitialized()) return;
        try {
            await this._gitManager!.unstageFile(file);
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to unstage file: ${error.message}`);
        }
    }

    private async stageAll() {
        if (!this.ensureInitialized()) return;
        try {
            await this._gitManager!.stageAll();
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to stage all files: ${error.message}`);
        }
    }

    private async commit(message: string) {
        if (!this.ensureInitialized()) return;
        try {
            if (!message.trim()) {
                vscode.window.showErrorMessage('Commit message cannot be empty');
                return;
            }

            await this._gitManager!.commit(message);
            vscode.window.showInformationMessage('✅ Changes committed successfully!');
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to commit: ${error.message}`);
        }
    }

    private async switchBranch(branch: string) {
        if (!this.ensureInitialized()) return;
        try {
            await this._gitManager!.switchBranch(branch);
            vscode.window.showInformationMessage(`Switched to branch: ${branch}`);
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to switch branch: ${error.message}`);
        }
    }

    private async createBranch(name: string) {
        if (!this.ensureInitialized()) return;
        try {
            await this._gitManager!.createBranch(name);
            vscode.window.showInformationMessage(`Created and switched to branch: ${name}`);
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to create branch: ${error.message}`);
        }
    }

    private async pull() {
        if (!this.ensureInitialized()) return;
        try {
            await this._gitManager!.pull();
            vscode.window.showInformationMessage('⬇️ Pulled changes successfully!');
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to pull: ${error.message}`);
        }
    }

    private async push() {
        if (!this.ensureInitialized()) return;
        try {
            await this._gitManager!.push();
            vscode.window.showInformationMessage('⬆️ Pushed changes successfully!');
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to push: ${error.message}`);
        }
    }

    private async fetch() {
        if (!this.ensureInitialized()) return;
        try {
            await this._gitManager!.fetch();
            vscode.window.showInformationMessage('🔄 Fetched changes successfully!');
            this.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to fetch: ${error.message}`);
        }
    }

    private async showFileDiff(file: string) {
        if (!this.ensureInitialized()) return;
        try {
            const diff = await this._gitManager!.getFileDiff(file);
            const doc = await vscode.workspace.openTextDocument({
                content: diff,
                language: 'diff'
            });
            await vscode.window.showTextDocument(doc);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to show diff: ${error.message}`);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Simple fallback HTML to test basic functionality
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Akyyra Commit Muse</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    padding: 16px;
                    font-size: 13px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin-bottom: 8px;
                }
                .button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 4px;
                    width: 100%;
                }
                .status {
                    padding: 12px;
                    background: var(--vscode-panel-background);
                    border-radius: 6px;
                    margin: 8px 0;
                }
                #loading {
                    text-align: center;
                    padding: 40px 20px;
                }
                .hidden {
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🎵 Akyyra</div>
                <div style="font-size: 11px; color: var(--vscode-descriptionForeground);">Commit Muse</div>
            </div>
            
            <div id="loading">
                <div>Loading Git status...</div>
                <button class="button" onclick="refresh()" style="margin-top: 12px;">Refresh</button>
            </div>
            
            <div id="content" class="hidden">
                <div class="status">
                    <strong>Git Status:</strong>
                    <div id="status-info">Checking...</div>
                </div>
                
                <button class="button" onclick="refresh()">🔄 Refresh Status</button>
                <button class="button" onclick="testGit()">🧪 Test Git</button>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function refresh() {
                    console.log('Akyyra: Refresh button clicked');
                    vscode.postMessage({ type: 'refresh' });
                }
                
                function testGit() {
                    console.log('Akyyra: Test Git button clicked');
                    vscode.postMessage({ type: 'testGit' });
                }
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    console.log('Akyyra: Received message:', message.type);
                    
                    switch (message.type) {
                        case 'updateStatus':
                            document.getElementById('loading').classList.add('hidden');
                            document.getElementById('content').classList.remove('hidden');
                            document.getElementById('status-info').innerHTML = 
                                'Branch: ' + message.data.status.branch + '<br>' +
                                'Staged: ' + message.data.status.staged.length + ' files<br>' +
                                'Modified: ' + message.data.status.modified.length + ' files<br>' +
                                'Untracked: ' + message.data.status.untracked.length + ' files';
                            break;
                        case 'error':
                            document.getElementById('loading').classList.add('hidden');
                            document.getElementById('content').classList.remove('hidden');
                            document.getElementById('status-info').innerHTML = 
                                '<span style="color: var(--vscode-errorForeground);">Error: ' + message.message + '</span>';
                            break;
                    }
                });
                
                // Auto-refresh on load
                console.log('Akyyra: Webview loaded, sending initial refresh');
                refresh();
            </script>
        </body>
        </html>`;
    }

    private _getErrorHtml(message: string): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Akyra Commit Muse</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    padding: 16px;
                }
                .error {
                    color: var(--vscode-errorForeground);
                    margin: 16px 0;
                }
                .icon {
                    font-size: 24px;
                    margin-bottom: 16px;
                }
            </style>
        </head>
        <body>
            <div class="icon">⚠️</div>
            <div class="error">${message}</div>
        </body>
        </html>`;
    }
}
