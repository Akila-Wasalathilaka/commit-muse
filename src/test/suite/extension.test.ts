import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('akyyra.akyyra-commit-muse'));
    });

    test('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('akyyra.akyyra-commit-muse');
        assert.ok(extension);
        
        await extension.activate();
        assert.strictEqual(extension.isActive, true);
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        
        assert.ok(commands.includes('akyyra.refresh'));
        assert.ok(commands.includes('akyyra.generateCommitMessage'));
        assert.ok(commands.includes('akyyra.openSettings'));
        assert.ok(commands.includes('akyyra.showLogs'));
    });
});
