import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GitService } from './services/GitService';
import { AIService } from './services/AIService';
import { WebviewProvider } from './providers/WebviewProvider';
import { StatusBarProvider } from './providers/StatusBarProvider';
import { CommitMuseViewProvider } from './providers/CommitMuseViewProvider';

let gitService: GitService;
let aiService: AIService;
let webviewProvider: WebviewProvider;
let statusBarProvider: StatusBarProvider;
let commitMuseViewProvider: CommitMuseViewProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Akyyra Commit Muse is now active!');

    // Initialize services
    gitService = new GitService();
    aiService = new AIService();
    webviewProvider = new WebviewProvider(context, gitService, aiService);
    statusBarProvider = new StatusBarProvider();
    commitMuseViewProvider = new CommitMuseViewProvider(context, gitService, aiService);

    // Register tree data provider for SCM sidebar
    vscode.window.registerTreeDataProvider('akyyra-commit-muse-view', commitMuseViewProvider);

    // Register commands
    const commands = [
        vscode.commands.registerCommand('akyyra-commit-muse.openPanel', () => {
            webviewProvider.showPanel();
        }),
        
        vscode.commands.registerCommand('akyyra-commit-muse.generateCommit', async () => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                const diff = await gitService.getStagedDiff(workspaceFolder.uri.fsPath);
                if (!diff) {
                    vscode.window.showInformationMessage('No staged changes found');
                    return;
                }

                const config = vscode.workspace.getConfiguration('akyyra-commit-muse');
                const vibe = config.get<string>('defaultVibe', 'conventional');
                const message = await aiService.generateCommitMessage(diff, vibe);
                
                if (message) {
                    vscode.window.showInformationMessage(`Generated: ${message}`);
                    // Copy to clipboard or show in panel
                    vscode.env.clipboard.writeText(message);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        }),

        vscode.commands.registerCommand('akyyra-commit-muse.voiceCommit', () => {
            webviewProvider.showPanel();
            webviewProvider.activateVoiceInput();
        }),

        vscode.commands.registerCommand('akyyra-commit-muse.summarizePR', async () => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                const prDiff = await gitService.getPRDiff(workspaceFolder.uri.fsPath);
                if (!prDiff) {
                    vscode.window.showInformationMessage('No PR changes found');
                    return;
                }

                const summary = await aiService.summarizePR(prDiff);
                if (summary) {
                    vscode.window.showInformationMessage(summary, { modal: true });
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        }),

        vscode.commands.registerCommand('akyyra-commit-muse.settings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'akyyra-commit-muse');
        }),

        // SCM integration commands
        vscode.commands.registerCommand('akyyra-commit-muse.generateCommitToSCM', async () => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                const diff = await gitService.getStagedDiff(workspaceFolder.uri.fsPath);
                if (!diff) {
                    vscode.window.showInformationMessage('No staged changes found. Please stage some files first.');
                    return;
                }

                const config = vscode.workspace.getConfiguration('akyyra-commit-muse');
                const vibe = config.get<string>('defaultVibe', 'conventional');
                
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Generating AI commit message...",
                    cancellable: false
                }, async () => {
                    const message = await aiService.generateCommitMessage(diff, vibe);
                    
                    if (message) {
                        // Set the message in SCM input box
                        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
                        if (gitExtension) {
                            const api = gitExtension.getAPI(1);
                            const repo = api.repositories[0];
                            if (repo) {
                                repo.inputBox.value = message;
                                vscode.window.showInformationMessage('✨ AI commit message generated!');
                            }
                        }
                    } else {
                        vscode.window.showErrorMessage('Failed to generate commit message');
                    }
                });
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        }),

        vscode.commands.registerCommand('akyyra-commit-muse.voiceCommitToSCM', () => {
            webviewProvider.showPanel();
            webviewProvider.activateVoiceInput();
        }),

        vscode.commands.registerCommand('akyyra-commit-muse.generateWithVibe', async (vibe: string) => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                const diff = await gitService.getStagedDiff(workspaceFolder.uri.fsPath);
                if (!diff) {
                    vscode.window.showInformationMessage('No staged changes found. Please stage some files first.');
                    return;
                }

                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: `Generating ${vibe} commit message...`,
                    cancellable: false
                }, async () => {
                    const message = await aiService.generateCommitMessage(diff, vibe);
                    
                    if (message) {
                        // Set the message in SCM input box
                        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
                        if (gitExtension) {
                            const api = gitExtension.getAPI(1);
                            const repo = api.repositories[0];
                            if (repo) {
                                repo.inputBox.value = message;
                                vscode.window.showInformationMessage(`✨ ${vibe} commit message generated!`);
                            }
                        }
                    }
                });
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        }),

        vscode.commands.registerCommand('akyyra-commit-muse.stageFile', async (filePath: string) => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    return;
                }

                await gitService.stageFile(workspaceFolder.uri.fsPath, filePath);
                commitMuseViewProvider.refresh();
                vscode.window.showInformationMessage(`Staged: ${filePath}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error staging file: ${error}`);
            }
        }),

        vscode.commands.registerCommand('akyyra-commit-muse.refresh', () => {
            commitMuseViewProvider.refresh();
        })
    ];

    // Watch for file changes to auto-suggest commits if enabled
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    fileWatcher.onDidChange(async (uri) => {
        const config = vscode.workspace.getConfiguration('akyyra-commit-muse');
        if (config.get<boolean>('autoSuggest', false)) {
            // Debounce and check for staged changes
            setTimeout(async () => {
                try {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                    if (workspaceFolder) {
                        const diff = await gitService.getStagedDiff(workspaceFolder.uri.fsPath);
                        if (diff) {
                            statusBarProvider.showSuggestion();
                        }
                    }
                } catch (error) {
                    // Silent fail for auto-suggest
                }
            }, 2000);
        }
        
        // Always refresh the sidebar view
        setTimeout(() => {
            commitMuseViewProvider.refresh();
        }, 1000);
    });

    // Watch for git status changes
    const gitWatcher = vscode.workspace.createFileSystemWatcher('**/.git/**');
    gitWatcher.onDidChange(() => {
        commitMuseViewProvider.refresh();
    });

    // Add all disposables to context
    context.subscriptions.push(
        ...commands,
        fileWatcher,
        gitWatcher,
        statusBarProvider
    );
}

export function deactivate() {
    console.log('👋 Akyyra Commit Muse deactivated');
}
