import * as vscode from 'vscode';
import { simpleGit, SimpleGit } from 'simple-git';
import * as path from 'path';

export class GitService {
    private git: SimpleGit | null = null;

    constructor() {
        this.initializeGit();
    }

    private async initializeGit() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            this.git = simpleGit(workspaceFolder.uri.fsPath);
        }
    }

    async getStagedDiff(workspacePath?: string): Promise<string | null> {
        try {
            const git = workspacePath ? simpleGit(workspacePath) : this.git;
            if (!git) {
                return null;
            }

            // Check if there are staged changes
            const status = await git.status();
            if (status.staged.length === 0) {
                return null;
            }

            // Get the diff of staged changes
            const diff = await git.diff(['--cached']);
            return diff;
        } catch (error) {
            console.error('Error getting staged diff:', error);
            return null;
        }
    }

    async getPRDiff(workspacePath?: string): Promise<string | null> {
        try {
            const git = workspacePath ? simpleGit(workspacePath) : this.git;
            if (!git) {
                return null;
            }

            // Get current branch
            const status = await git.status();
            const currentBranch = status.current;

            if (!currentBranch || currentBranch === 'main' || currentBranch === 'master') {
                return null;
            }

            // Get diff between current branch and main/master
            let baseBranch = 'main';
            try {
                await git.revparse(['--verify', 'main']);
            } catch {
                baseBranch = 'master';
            }

            const diff = await git.diff([`${baseBranch}...${currentBranch}`]);
            return diff;
        } catch (error) {
            console.error('Error getting PR diff:', error);
            return null;
        }
    }

    async getRepoInfo(workspacePath?: string): Promise<{ branch: string; hasChanges: boolean } | null> {
        try {
            const git = workspacePath ? simpleGit(workspacePath) : this.git;
            if (!git) {
                return null;
            }

            const status = await git.status();
            return {
                branch: status.current || 'unknown',
                hasChanges: status.files.length > 0
            };
        } catch (error) {
            console.error('Error getting repo info:', error);
            return null;
        }
    }

    async commitChanges(message: string, workspacePath?: string): Promise<boolean> {
        try {
            const git = workspacePath ? simpleGit(workspacePath) : this.git;
            if (!git) {
                return false;
            }

            await git.commit(message);
            return true;
        } catch (error) {
            console.error('Error committing changes:', error);
            return false;
        }
    }

    async stageFiles(files: string[], workspacePath?: string): Promise<boolean> {
        try {
            const git = workspacePath ? simpleGit(workspacePath) : this.git;
            if (!git) {
                return false;
            }

            await git.add(files);
            return true;
        } catch (error) {
            console.error('Error staging files:', error);
            return false;
        }
    }

    async getUnstagedFiles(workspacePath?: string): Promise<string[]> {
        try {
            const git = workspacePath ? simpleGit(workspacePath) : this.git;
            if (!git) {
                return [];
            }

            const status = await git.status();
            return status.files
                .filter(file => file.index === ' ' || file.index === '?')
                .map(file => file.path);
        } catch (error) {
            console.error('Error getting unstaged files:', error);
            return [];
        }
    }

    async getStagedFiles(workspacePath?: string): Promise<string[]> {
        try {
            const git = workspacePath ? simpleGit(workspacePath) : this.git;
            if (!git) {
                return [];
            }

            const status = await git.status();
            return status.staged;
        } catch (error) {
            console.error('Error getting staged files:', error);
            return [];
        }
    }
}
