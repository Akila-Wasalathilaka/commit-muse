import * as vscode from 'vscode';
import axios from 'axios';

export interface CommitVibe {
    name: string;
    prompt: string;
    example: string;
}

export class AIService {
    private readonly vibes: Map<string, CommitVibe> = new Map([
        ['conventional', {
            name: 'Conventional Commits',
            prompt: 'Generate a conventional commit message (feat:, fix:, docs:, style:, refactor:, test:, chore:). Be concise and descriptive.',
            example: 'feat: add user authentication with JWT tokens'
        }],
        ['emoji', {
            name: 'Emoji Style',
            prompt: 'Generate a commit message with relevant emojis. Use emojis that match the type of change.',
            example: '✨ Add user authentication with JWT tokens'
        }],
        ['corporate', {
            name: 'Corporate Professional',
            prompt: 'Generate a professional, formal commit message suitable for corporate environments.',
            example: 'Implement user authentication functionality using JWT tokens'
        }],
        ['casual', {
            name: 'Casual & Friendly',
            prompt: 'Generate a casual, friendly commit message that explains what was done in simple terms.',
            example: 'Added login functionality so users can sign in securely'
        }],
        ['genz', {
            name: 'Gen Z Vibes',
            prompt: 'Generate a fun, Gen Z style commit message with modern slang and energy. Keep it professional but with personality.',
            example: 'no cap added fire auth system that actually slaps 🔥'
        }]
    ]);

    async generateCommitMessage(diff: string, vibe: string = 'conventional'): Promise<string | null> {
        try {
            const config = vscode.workspace.getConfiguration('akyyra-commit-muse');
            const provider = config.get<string>('aiProvider', 'openai');
            const apiKey = config.get<string>('apiKey', '');

            if (!apiKey) {
                vscode.window.showErrorMessage('Please configure your AI API key in settings');
                return null;
            }

            const selectedVibe = vibe === 'custom' 
                ? { prompt: config.get<string>('customPrompt', ''), name: 'Custom', example: '' }
                : this.vibes.get(vibe) || this.vibes.get('conventional')!;

            return await this.callAI(provider, apiKey, diff, selectedVibe);
        } catch (error) {
            console.error('Error generating commit message:', error);
            vscode.window.showErrorMessage(`Failed to generate commit message: ${error}`);
            return null;
        }
    }

    async summarizePR(diff: string): Promise<string | null> {
        try {
            const config = vscode.workspace.getConfiguration('akyyra-commit-muse');
            const provider = config.get<string>('aiProvider', 'openai');
            const apiKey = config.get<string>('apiKey', '');

            if (!apiKey) {
                vscode.window.showErrorMessage('Please configure your AI API key in settings');
                return null;
            }

            const prompt = `Summarize this pull request in 2-3 sentences. Explain what the changes do and their impact. Be clear and concise.

Here's the diff:
${diff}

Provide a summary that would be useful for code reviewers.`;

            return await this.callAI(provider, apiKey, '', { prompt, name: 'PR Summary', example: '' });
        } catch (error) {
            console.error('Error summarizing PR:', error);
            vscode.window.showErrorMessage(`Failed to summarize PR: ${error}`);
            return null;
        }
    }

    private async callAI(provider: string, apiKey: string, diff: string, vibe: CommitVibe): Promise<string | null> {
        const fullPrompt = `${vibe.prompt}

${diff ? `Here's the git diff:
${diff}` : ''}

Generate only the commit message, no explanations or additional text.`;

        switch (provider) {
            case 'openai':
                return this.callOpenAI(apiKey, fullPrompt);
            case 'anthropic':
                return this.callClaude(apiKey, fullPrompt);
            case 'mistral':
                return this.callMistral(apiKey, fullPrompt);
            default:
                throw new Error(`Unsupported AI provider: ${provider}`);
        }
    }

    private async callOpenAI(apiKey: string, prompt: string): Promise<string | null> {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that generates git commit messages. Always respond with just the commit message, no explanations.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = response.data as any;
            return data.choices?.[0]?.message?.content?.trim() || null;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Failed to call OpenAI API');
        }
    }

    private async callClaude(apiKey: string, prompt: string): Promise<string | null> {
        try {
            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 100,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    }
                }
            );

            const data = response.data as any;
            return data.content?.[0]?.text?.trim() || null;
        } catch (error) {
            console.error('Claude API error:', error);
            throw new Error('Failed to call Claude API');
        }
    }

    private async callMistral(apiKey: string, prompt: string): Promise<string | null> {
        try {
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: 'mistral-tiny',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = response.data as any;
            return data.choices?.[0]?.message?.content?.trim() || null;
        } catch (error) {
            console.error('Mistral API error:', error);
            throw new Error('Failed to call Mistral API');
        }
    }

    getAvailableVibes(): CommitVibe[] {
        return Array.from(this.vibes.values());
    }

    getVibe(name: string): CommitVibe | undefined {
        return this.vibes.get(name);
    }
}
