import * as vscode from 'vscode';

export class StatusBarProvider implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    private suggestionItem: vscode.StatusBarItem;

    constructor() {
        // Main status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.command = 'akyyra-commit-muse.openPanel';
        this.statusBarItem.text = '$(git-commit) Commit Muse';
        this.statusBarItem.tooltip = 'Open Akyyra Commit Muse';
        this.statusBarItem.show();

        // Suggestion status bar item (hidden by default)
        this.suggestionItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            99
        );
        this.suggestionItem.command = 'akyyra-commit-muse.generateCommit';
        this.suggestionItem.text = '$(sparkle) AI Suggestion Available';
        this.suggestionItem.tooltip = 'Click to generate AI commit message';
        this.suggestionItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        // Hidden by default
    }

    showSuggestion() {
        this.suggestionItem.show();
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideSuggestion();
        }, 10000);
    }

    hideSuggestion() {
        this.suggestionItem.hide();
    }

    updateStatus(text: string, tooltip?: string) {
        this.statusBarItem.text = text;
        if (tooltip) {
            this.statusBarItem.tooltip = tooltip;
        }
    }

    dispose() {
        this.statusBarItem.dispose();
        this.suggestionItem.dispose();
    }
}
