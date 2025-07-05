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

            // Test mode - return a sample message if API key is 'test'
            if (apiKey.toLowerCase() === 'test') {
                const testMessages = {
                    conventional: 'feat: add new feature implementation',
                    emoji: '✨ Add new feature implementation',
                    corporate: 'Implement new feature functionality',
                    casual: 'Added a cool new feature',
                    genz: 'no cap just added this fire feature 🔥'
                };
                return testMessages[vibe as keyof typeof testMessages] || testMessages.conventional;
            }

            const selectedVibe = vibe === 'custom' 
                ? { prompt: config.get<string>('customPrompt', ''), name: 'Custom', example: '' }
                : this.vibes.get(vibe) || this.vibes.get('conventional')!;

            // Try the selected provider first, with fallback to OpenAI
            try {
                return await this.callAI(provider, apiKey, diff, selectedVibe);
            } catch (error) {
                console.warn(`Primary provider ${provider} failed, trying fallback...`);
                
                // If Mistral fails and we have OpenAI key, try OpenAI
                if (provider === 'mistral') {
                    const openaiKey = config.get<string>('openaiApiKey', '');
                    if (openaiKey) {
                        return await this.callAI('openai', openaiKey, diff, selectedVibe);
                    }
                }
                
                throw error; // Re-throw if no fallback available
            }
        } catch (error) {
            console.error('Error generating commit message:', error);
            vscode.window.showErrorMessage(`Failed to generate commit message: ${error}`);
            return null;
        }
    }

    private validateApiKey(provider: string, apiKey: string): boolean {
        switch (provider) {
            case 'openai':
                return apiKey.startsWith('sk-') && apiKey.length > 20;
            case 'anthropic':
                return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
            case 'mistral':
                return apiKey.length > 10; // Mistral keys don't have a standard prefix
            default:
                return false;
        }
    }

    private generateFallbackMessage(diff: string, vibe: string): string | null {
        try {
            // Enhanced heuristic-based commit message generation
            const lines = diff.split('\n');
            const addedLines = lines.filter(line => line.startsWith('+')).length;
            const removedLines = lines.filter(line => line.startsWith('-')).length;
            const modifiedFiles = lines.filter(line => line.startsWith('diff --git')).length;

            // Analyze file types
            const fileChanges = lines
                .filter(line => line.startsWith('diff --git'))
                .map(line => {
                    const match = line.match(/b\/(.+)$/);
                    return match ? match[1] : '';
                })
                .filter(Boolean);

            const fileTypes = this.analyzeFileTypes(fileChanges);
            let action = 'update';
            let scope = '';

            // Determine action based on diff patterns
            if (addedLines > removedLines * 3) {
                action = fileTypes.config ? 'configure' : fileTypes.test ? 'test' : 'add';
            } else if (removedLines > addedLines * 3) {
                action = 'remove';
            } else if (lines.some(line => line.includes('function') || line.includes('class') || line.includes('const '))) {
                action = fileTypes.test ? 'test' : 'refactor';
            } else if (lines.some(line => line.includes('import') || line.includes('require'))) {
                action = 'update dependencies';
            } else if (fileTypes.docs) {
                action = 'document';
            } else if (fileTypes.style) {
                action = 'style';
            }

            // Determine scope
            if (fileTypes.config) {
                scope = 'config';
            } else if (fileTypes.test) {
                scope = 'tests';
            } else if (fileTypes.docs) {
                scope = 'docs';
            } else if (fileTypes.api) {
                scope = 'api';
            } else if (fileTypes.ui) {
                scope = 'ui';
            }

            const target = modifiedFiles === 1 ? 
                (fileChanges[0]?.split('/').pop()?.split('.')[0] || 'file') : 
                `${modifiedFiles} files`;

            return this.formatMessage(action, scope, target, vibe);
        } catch (error) {
            console.error('Error generating fallback message:', error);
            return null;
        }
    }

    private analyzeFileTypes(files: string[]): { [key: string]: boolean } {
        return {
            config: files.some(f => /\.(json|yaml|yml|toml|ini|env)$/.test(f) || f.includes('config')),
            test: files.some(f => /\.(test|spec)\.|test\/|__tests__\//.test(f)),
            docs: files.some(f => /\.(md|txt|rst)$/.test(f) || f.includes('README')),
            style: files.some(f => /\.(css|scss|sass|less|styl)$/.test(f)),
            api: files.some(f => /api\/|routes\/|controllers\//.test(f)),
            ui: files.some(f => /components\/|views\/|pages\//.test(f) || /\.(vue|jsx|tsx)$/.test(f))
        };
    }

    private formatMessage(action: string, scope: string, target: string, vibe: string): string {
        const scopePrefix = scope ? `${scope}: ` : '';
        
        switch (vibe) {
            case 'conventional':
                const type = this.getConventionalType(action);
                return `${type}${scope ? `(${scope})` : ''}: ${action} ${target}`;
            case 'emoji':
                const emoji = this.getActionEmoji(action);
                return `${emoji} ${scopePrefix}${action} ${target}`;
            case 'corporate':
                return `${scopePrefix}${action.charAt(0).toUpperCase() + action.slice(1)} ${target} to enhance system functionality`;
            case 'casual':
                return `${scopePrefix}${action}ed ${target}`;
            case 'genz':
                return `${scopePrefix}${action}ed ${target} and it hits different 🔥`;
            default:
                return `${scopePrefix}${action} ${target}`;
        }
    }

    private getConventionalType(action: string): string {
        switch (action) {
            case 'add': return 'feat';
            case 'remove': return 'refactor';
            case 'test': return 'test';
            case 'document': return 'docs';
            case 'style': return 'style';
            case 'configure': return 'chore';
            case 'update dependencies': return 'chore';
            default: return 'feat';
        }
    }

    private getActionEmoji(action: string): string {
        switch (action) {
            case 'add': return '✨';
            case 'remove': return '🗑️';
            case 'test': return '🧪';
            case 'document': return '📝';
            case 'style': return '💄';
            case 'configure': return '⚙️';
            case 'update dependencies': return '⬆️';
            case 'refactor': return '♻️';
            default: return '🔧';
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
                    },
                    timeout: 30000
                }
            );

            const data = response.data as any;
            return data.choices?.[0]?.message?.content?.trim() || null;
        } catch (error: any) {
            console.error('OpenAI API error:', error);
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 401) {
                    throw new Error('Invalid OpenAI API key. Please check your API key in settings.');
                } else if (status === 429) {
                    throw new Error('OpenAI API rate limit exceeded. Please try again later.');
                } else if (status === 403) {
                    throw new Error('OpenAI API access forbidden. Check your subscription.');
                } else {
                    throw new Error(`OpenAI API error (${status}): ${errorData?.error?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                throw new Error('Failed to connect to OpenAI API. Please check your internet connection.');
            } else {
                throw new Error(`OpenAI API configuration error: ${error.message}`);
            }
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
                    },
                    timeout: 30000
                }
            );

            const data = response.data as any;
            return data.content?.[0]?.text?.trim() || null;
        } catch (error: any) {
            console.error('Claude API error:', error);
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 401) {
                    throw new Error('Invalid Claude API key. Please check your API key in settings.');
                } else if (status === 429) {
                    throw new Error('Claude API rate limit exceeded. Please try again later.');
                } else if (status === 403) {
                    throw new Error('Claude API access forbidden. Check your subscription.');
                } else {
                    throw new Error(`Claude API error (${status}): ${errorData?.error?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                throw new Error('Failed to connect to Claude API. Please check your internet connection.');
            } else {
                throw new Error(`Claude API configuration error: ${error.message}`);
            }
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
                    },
                    timeout: 30000
                }
            );

            const data = response.data as any;
            return data.choices?.[0]?.message?.content?.trim() || null;
        } catch (error: any) {
            console.error('Mistral API error:', error);
            
            // More detailed error handling
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 401) {
                    throw new Error('Invalid Mistral API key. Please check your API key in settings.');
                } else if (status === 429) {
                    throw new Error('Mistral API rate limit exceeded. Please try again later.');
                } else if (status === 403) {
                    throw new Error('Mistral API access forbidden. Check your subscription.');
                } else if (status === 404) {
                    throw new Error('Mistral API endpoint not found. Please check the model name.');
                } else {
                    throw new Error(`Mistral API error (${status}): ${errorData?.message || errorData?.error || 'Unknown error'}`);
                }
            } else if (error.request) {
                throw new Error('Failed to connect to Mistral API. Please check your internet connection.');
            } else {
                throw new Error(`Mistral API configuration error: ${error.message}`);
            }
        }
    }

    getAvailableVibes(): CommitVibe[] {
        return Array.from(this.vibes.values());
    }

    getVibe(name: string): CommitVibe | undefined {
        return this.vibes.get(name);
    }
}
