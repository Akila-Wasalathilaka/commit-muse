import * as vscode from 'vscode';
import { AkyraDashboardProvider } from './panels/dashboard';
import { GitManager } from './git/gitManager';
import { AICommitGenerator } from './ai/generateMessage';
import { Logger } from './utils/helpers';

export async function activate(context: vscode.ExtensionContext) {
    // Initialize logger
    Logger.initialize();
    Logger.info('Akyyra Commit Muse is activating...');
    console.log('Akyyra: Extension activation started');

    // Wait for git extension to be available
    const gitExt = vscode.extensions.getExtension('vscode.git');
    if (gitExt) {
        await gitExt.activate();
        console.log('Akyyra: VS Code Git extension is active');
    }

    try {
        // Create and register the dashboard provider first
        console.log('Akyyra: Creating dashboard provider');
        const dashboardProvider = new AkyraDashboardProvider(context.extensionUri);
        
        console.log('Akyyra: Registering webview view provider for view ID:', AkyraDashboardProvider.viewType);
        const provider = vscode.window.registerWebviewViewProvider(
            AkyraDashboardProvider.viewType,
            dashboardProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        );
        
        context.subscriptions.push(provider);
        console.log('Akyyra: Webview view provider registered successfully for:', AkyraDashboardProvider.viewType);

        // Register commands
        const refreshCommand = vscode.commands.registerCommand('akyyra.refresh', () => {
            try {
                dashboardProvider.refresh();
            } catch (error) {
                Logger.error('Failed to refresh dashboard', error as Error);
                vscode.window.showErrorMessage('Failed to refresh Git status');
            }
        });

        const generateCommitCommand = vscode.commands.registerCommand('akyyra.generateCommitMessage', async () => {
            try {
                await dashboardProvider.generateCommitMessage();
            } catch (error) {
                Logger.error('Failed to generate commit message', error as Error);
                vscode.window.showErrorMessage('Failed to generate commit message');
            }
        });

        const settingsCommand = vscode.commands.registerCommand('akyyra.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'akyyra');
        });

        const showLogsCommand = vscode.commands.registerCommand('akyyra.showLogs', () => {
            Logger.show();
        });

        // Add a test command to verify the extension is working
        const testCommand = vscode.commands.registerCommand('akyyra.test', () => {
            vscode.window.showInformationMessage('🎵 Akyyra Commit Muse is working! Provider registered: ' + !!provider);
            console.log('Akyyra: Test command executed, provider registered:', !!provider);
        });

        context.subscriptions.push(refreshCommand, generateCommitCommand, settingsCommand, showLogsCommand, testCommand);

        Logger.info('Akyyra Commit Muse activated successfully');
        vscode.window.showInformationMessage('🎵 Akyyra Commit Muse is ready!');
    } catch (error) {
        Logger.error('Failed to activate Akyyra Commit Muse', error as Error);
        vscode.window.showErrorMessage('Failed to activate Akyyra Commit Muse. Check the output panel for details.');
    }
}

export function deactivate() {
    Logger.info('Akyyra Commit Muse has been deactivated.');
}
