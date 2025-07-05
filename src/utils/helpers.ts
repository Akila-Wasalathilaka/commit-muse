import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;

    static initialize() {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('Akyyra Commit Muse');
        }
    }

    static info(message: string) {
        this.log('INFO', message);
    }

    static warn(message: string) {
        this.log('WARN', message);
    }

    static error(message: string, error?: Error) {
        this.log('ERROR', message);
        if (error) {
            this.log('ERROR', error.stack || error.toString());
        }
    }

    static debug(message: string) {
        this.log('DEBUG', message);
    }

    private static log(level: string, message: string) {
        if (this.outputChannel) {
            const timestamp = new Date().toISOString();
            this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
        }
    }

    static show() {
        if (this.outputChannel) {
            this.outputChannel.show();
        }
    }
}

export function formatError(error: any): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return JSON.stringify(error);
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

export function sanitizeFileName(fileName: string): string {
    return fileName.replace(/[<>:"/\\|?*]/g, '_');
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}

export function isValidGitRepository(workspacePath: string): boolean {
    try {
        const fs = require('fs');
        const path = require('path');
        return fs.existsSync(path.join(workspacePath, '.git'));
    } catch {
        return false;
    }
}

export function getRelativePath(fullPath: string, workspacePath: string): string {
    const path = require('path');
    return path.relative(workspacePath, fullPath);
}

export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}
