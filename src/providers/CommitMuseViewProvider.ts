import * as vscode from 'vscode';
import { GitService } from '../services/GitService';
import { AIService } from '../services/AIService';

export class CommitMuseViewProvider implements vscode.TreeDataProvider<CommitItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CommitItem | undefined | null | void> = new vscode.EventEmitter<CommitItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CommitItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(
        private context: vscode.ExtensionContext,
        private gitService: GitService,
        private aiService: AIService
    ) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CommitItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: CommitItem): Promise<CommitItem[]> {
        if (!element) {
            // Root level items
            return this.getRootItems();
        }
        
        if (element.contextValue === 'vibes') {
            return this.getVibeItems();
        }
        
        if (element.contextValue === 'changes') {
            return this.getChangeItems();
        }

        return [];
    }

    private async getRootItems(): Promise<CommitItem[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }

        const items: CommitItem[] = [];

        // Repository status
        const repoInfo = await this.gitService.getRepoInfo(workspaceFolder.uri.fsPath);
        if (repoInfo) {
            items.push(new CommitItem(
                `📋 Branch: ${repoInfo.branch}`,
                '',
                vscode.TreeItemCollapsibleState.None,
                'status'
            ));
        }

        // Changes section
        const [stagedFiles, unstagedFiles] = await Promise.all([
            this.gitService.getStagedFiles(workspaceFolder.uri.fsPath),
            this.gitService.getUnstagedFiles(workspaceFolder.uri.fsPath)
        ]);

        const totalChanges = stagedFiles.length + unstagedFiles.length;
        items.push(new CommitItem(
            `📁 Changes (${totalChanges})`,
            `${stagedFiles.length} staged, ${unstagedFiles.length} unstaged`,
            totalChanges > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
            'changes'
        ));

        // Quick actions
        items.push(new CommitItem(
            '✨ Generate AI Commit',
            'Generate commit message with AI',
            vscode.TreeItemCollapsibleState.None,
            'generate',
            {
                command: 'akyyra-commit-muse.generateCommitToSCM',
                title: 'Generate AI Commit',
                arguments: []
            }
        ));

        items.push(new CommitItem(
            '🎤 Voice Commit',
            'Use voice to create commit message',
            vscode.TreeItemCollapsibleState.None,
            'voice',
            {
                command: 'akyyra-commit-muse.voiceCommitToSCM',
                title: 'Voice Commit',
                arguments: []
            }
        ));

        // Commit vibes section
        items.push(new CommitItem(
            '🎨 Commit Vibes',
            'Choose your commit style',
            vscode.TreeItemCollapsibleState.Collapsed,
            'vibes'
        ));

        // PR Summary (if applicable)
        try {
            const prDiff = await this.gitService.getPRDiff(workspaceFolder.uri.fsPath);
            if (prDiff) {
                items.push(new CommitItem(
                    '📊 Summarize PR',
                    'Generate PR summary',
                    vscode.TreeItemCollapsibleState.None,
                    'pr',
                    {
                        command: 'akyyra-commit-muse.summarizePR',
                        title: 'Summarize PR',
                        arguments: []
                    }
                ));
            }
        } catch (error) {
            // PR not available, skip
        }

        return items;
    }

    private getVibeItems(): CommitItem[] {
        const vibes = this.aiService.getAvailableVibes();
        return vibes.map(vibe => new CommitItem(
            vibe.name,
            vibe.example,
            vscode.TreeItemCollapsibleState.None,
            'vibe',
            {
                command: 'akyyra-commit-muse.generateWithVibe',
                title: `Generate with ${vibe.name}`,
                arguments: [vibe.name.toLowerCase().replace(' ', '')]
            }
        ));
    }

    private async getChangeItems(): Promise<CommitItem[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }

        const [stagedFiles, unstagedFiles] = await Promise.all([
            this.gitService.getStagedFiles(workspaceFolder.uri.fsPath),
            this.gitService.getUnstagedFiles(workspaceFolder.uri.fsPath)
        ]);

        const items: CommitItem[] = [];

        // Show summary first
        if (stagedFiles.length > 0 || unstagedFiles.length > 0) {
            items.push(new CommitItem(
                `📊 Summary: ${stagedFiles.length + unstagedFiles.length} files changed`,
                `${stagedFiles.length} staged, ${unstagedFiles.length} unstaged`,
                vscode.TreeItemCollapsibleState.None,
                'summary'
            ));
        }

        // Staged files section
        if (stagedFiles.length > 0) {
            items.push(new CommitItem(
                `✅ Staged Changes (${stagedFiles.length})`,
                'Ready to commit',
                vscode.TreeItemCollapsibleState.Expanded,
                'staged-group'
            ));

            stagedFiles.forEach(file => {
                const fileName = file.split('/').pop() || file;
                const fileType = this.getFileType(file);
                items.push(new CommitItem(
                    `  ${fileType} ${fileName}`,
                    file,
                    vscode.TreeItemCollapsibleState.None,
                    'staged-file'
                ));
            });
        }

        // Unstaged files section
        if (unstagedFiles.length > 0) {
            items.push(new CommitItem(
                `📝 Unstaged Changes (${unstagedFiles.length})`,
                'Click files to stage them',
                vscode.TreeItemCollapsibleState.Expanded,
                'unstaged-group'
            ));

            unstagedFiles.forEach(file => {
                const fileName = file.split('/').pop() || file;
                const fileType = this.getFileType(file);
                items.push(new CommitItem(
                    `  ${fileType} ${fileName}`,
                    `${file} • Click to stage`,
                    vscode.TreeItemCollapsibleState.None,
                    'unstaged-file',
                    {
                        command: 'akyyra-commit-muse.stageFile',
                        title: 'Stage file',
                        arguments: [file]
                    }
                ));
            });
        }

        // Show helpful message if no changes
        if (stagedFiles.length === 0 && unstagedFiles.length === 0) {
            items.push(new CommitItem(
                '💡 No changes detected',
                'Make some changes to see them here',
                vscode.TreeItemCollapsibleState.None,
                'no-changes'
            ));
        }

        return items;
    }

    private getFileType(filePath: string): string {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'ts': return '🟦';
            case 'js': return '🟨';
            case 'json': return '📋';
            case 'md': return '📝';
            case 'py': return '🐍';
            case 'html': return '🌐';
            case 'css': return '🎨';
            case 'scss': case 'sass': return '💅';
            case 'yml': case 'yaml': return '⚙️';
            case 'xml': return '📄';
            case 'svg': return '🖼️';
            case 'png': case 'jpg': case 'jpeg': case 'gif': return '🖼️';
            case 'pdf': return '📕';
            case 'txt': return '📄';
            case 'env': return '🔧';
            case 'gitignore': return '🚫';
            case 'dockerfile': return '🐳';
            default: return '📁';
        }
    }
}

export class CommitItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.description = description;
        this.contextValue = contextValue;
        this.command = command;

        // Set icons based on context
        switch (contextValue) {
            case 'generate':
                this.iconPath = new vscode.ThemeIcon('sparkle');
                break;
            case 'voice':
                this.iconPath = new vscode.ThemeIcon('mic');
                break;
            case 'vibes':
                this.iconPath = new vscode.ThemeIcon('color-mode');
                break;
            case 'changes':
                this.iconPath = new vscode.ThemeIcon('git-commit');
                break;
            case 'pr':
                this.iconPath = new vscode.ThemeIcon('git-pull-request');
                break;
            case 'vibe':
                this.iconPath = new vscode.ThemeIcon('symbol-color');
                break;
            case 'staged-file':
                this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
                break;
            case 'unstaged-file':
                this.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.yellow'));
                break;
            case 'staged-group':
                this.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor('charts.green'));
                break;
            case 'unstaged-group':
                this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.yellow'));
                break;
            case 'status':
                this.iconPath = new vscode.ThemeIcon('git-branch');
                break;
            case 'summary':
                this.iconPath = new vscode.ThemeIcon('graph');
                break;
            case 'no-changes':
                this.iconPath = new vscode.ThemeIcon('info');
                break;
        }
    }
}
