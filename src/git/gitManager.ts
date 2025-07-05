import * as vscode from 'vscode';
import { SimpleGit, simpleGit, StatusResult, LogResult, BranchSummary } from 'simple-git';
import * as path from 'path';

export interface GitStatus {
    branch: string;
    ahead: number;
    behind: number;
    staged: string[];
    modified: string[];
    untracked: string[];
    conflicted: string[];
}

export interface GitCommit {
    hash: string;
    date: string;
    message: string;
    author: string;
    refs: string;
}

export class GitManager {
    private git: SimpleGit;
    private workspaceRoot: string;

    constructor() {
        try {
            this.workspaceRoot = this.getWorkspaceRoot();
            if (!this.workspaceRoot) {
                throw new Error('No workspace folder found');
            }

            // Initialize git with more robust options
            this.git = simpleGit({
                baseDir: this.workspaceRoot,
                binary: 'git',
                maxConcurrentProcesses: 6,
                trimmed: false,
                config: ['core.quotepath=false', 'core.autocrlf=false']
            });

            // Verify git is available
            this.git.checkIsRepo()
                .then(isRepo => {
                    if (!isRepo) {
                        throw new Error('Not a git repository');
                    }
                    console.log('GitManager: Repository verified successfully');
                })
                .catch(error => {
                    console.error('GitManager: Repository verification failed:', error);
                    throw error;
                });

            console.log('GitManager: Initialized successfully for:', this.workspaceRoot);
        } catch (error) {
            console.error('GitManager: Failed to initialize:', error);
            throw error;
        }
    }

    private getWorkspaceRoot(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('No workspace folder found. Please open a folder in VS Code.');
        }
        return workspaceFolders[0].uri.fsPath;
    }

    async getStatus(): Promise<GitStatus> {
        try {
            const status = await this.git.status();
            const branch = await this.git.branch();
            
            return {
                branch: status.current || 'unknown',
                ahead: status.ahead,
                behind: status.behind,
                staged: status.staged,
                modified: status.modified,
                untracked: status.not_added,
                conflicted: status.conflicted
            };
        } catch (error) {
            console.error('Error getting Git status:', error);
            throw error;
        }
    }

    async getStagedDiff(): Promise<string> {
        try {
            return await this.git.diff(['--cached']);
        } catch (error) {
            console.error('Error getting staged diff:', error);
            return '';
        }
    }

    async getFileDiff(filePath: string): Promise<string> {
        try {
            return await this.git.diff([filePath]);
        } catch (error) {
            console.error('Error getting file diff:', error);
            return '';
        }
    }

    async stageFile(filePath: string): Promise<void> {
        try {
            await this.git.add(filePath);
        } catch (error) {
            console.error('Error staging file:', error);
            throw error;
        }
    }

    async unstageFile(filePath: string): Promise<void> {
        try {
            await this.git.reset(['HEAD', filePath]);
        } catch (error) {
            console.error('Error unstaging file:', error);
            throw error;
        }
    }

    async stageAll(): Promise<void> {
        try {
            await this.git.add('.');
        } catch (error) {
            console.error('Error staging all files:', error);
            throw error;
        }
    }

    async commit(message: string): Promise<void> {
        try {
            await this.git.commit(message);
        } catch (error) {
            console.error('Error committing:', error);
            throw error;
        }
    }

    async getBranches(): Promise<BranchSummary> {
        try {
            return await this.git.branch();
        } catch (error) {
            console.error('Error getting branches:', error);
            throw error;
        }
    }

    async createBranch(branchName: string): Promise<void> {
        try {
            await this.git.checkoutLocalBranch(branchName);
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    }

    async switchBranch(branchName: string): Promise<void> {
        try {
            await this.git.checkout(branchName);
        } catch (error) {
            console.error('Error switching branch:', error);
            throw error;
        }
    }

    async deleteBranch(branchName: string): Promise<void> {
        try {
            await this.git.deleteLocalBranch(branchName);
        } catch (error) {
            console.error('Error deleting branch:', error);
            throw error;
        }
    }

    async getCommitHistory(limit: number = 20): Promise<GitCommit[]> {
        try {
            const log = await this.git.log({ maxCount: limit });
            return log.all.map(commit => ({
                hash: commit.hash,
                date: commit.date,
                message: commit.message,
                author: commit.author_name,
                refs: commit.refs
            }));
        } catch (error) {
            console.error('Error getting commit history:', error);
            return [];
        }
    }

    async pull(): Promise<void> {
        try {
            await this.git.pull();
        } catch (error) {
            console.error('Error pulling:', error);
            throw error;
        }
    }

    async push(): Promise<void> {
        try {
            await this.git.push();
        } catch (error) {
            console.error('Error pushing:', error);
            throw error;
        }
    }

    async fetch(): Promise<void> {
        try {
            await this.git.fetch();
        } catch (error) {
            console.error('Error fetching:', error);
            throw error;
        }
    }

    async isRepository(): Promise<boolean> {
        try {
            await this.git.status();
            return true;
        } catch {
            return false;
        }
    }
}
