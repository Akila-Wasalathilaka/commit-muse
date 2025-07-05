import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GitService } from './services/GitService';
import { AIService } from './services/AIService';
import { WebviewProvider } from './providers/WebviewProvider';
import { StatusBarProvider } from './providers/StatusBarProvider';

let gitService: GitService;
let aiService: AIService;
let webviewProvider: WebviewProvider;
let statusBarProvider: StatusBarProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Akyyra Commit Muse is now active!');

    // Initialize services
    gitService = new GitService();
    aiService = new AIService();
    webviewProvider = new WebviewProvider(context, gitService, aiService);
    statusBarProvider = new StatusBarProvider();

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
    });

    // Add all disposables to context
    context.subscriptions.push(
        ...commands,
        fileWatcher,
        statusBarProvider
    );
}

export function deactivate() {
    console.log('👋 Akyyra Commit Muse deactivated');
}
