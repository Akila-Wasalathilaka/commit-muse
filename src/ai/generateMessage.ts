import * as vscode from 'vscode';
import axios from 'axios';

export interface CommitStyle {
    name: string;
    prompt: string;
}

export class AICommitGenerator {
    private readonly commitStyles: { [key: string]: CommitStyle } = {
        conventional: {
            name: 'Conventional',
            prompt: 'Generate a conventional commit message following the format: type(scope): description. Types include: feat, fix, docs, style, refactor, test, chore. Keep it concise and professional.'
        },
        tldr: {
            name: 'TLDR Dev',
            prompt: 'Generate a concise, developer-friendly commit message that quickly explains what changed. Use casual but clear language. Start with action verbs like "add", "fix", "update", "remove".'
        },
        corporate: {
            name: 'Corporate',
            prompt: 'Generate a formal, professional commit message suitable for enterprise environments. Focus on business impact and technical accuracy. Use complete sentences and proper grammar.'
        },
        genz: {
            name: 'Gen Z',
            prompt: 'Generate a fun, casual commit message with modern internet language. Use emojis, casual abbreviations, and trendy phrases while still being informative about the changes.'
        },
        custom: {
            name: 'Custom',
            prompt: 'Generate a clear, descriptive commit message that explains the changes made in this commit.'
        }
    };

    async generateCommitMessage(diff: string, style: string = 'conventional'): Promise<string> {
        try {
            const config = vscode.workspace.getConfiguration('akyyra');
            const apiKey = config.get<string>('apiKey');
            const aiProvider = config.get<string>('aiProvider', 'openai');

            if (!apiKey) {
                throw new Error('API key not configured. Please set your AI provider API key in settings.');
            }

            if (!diff || diff.trim().length === 0) {
                throw new Error('No staged changes found. Please stage your changes first.');
            }

            const commitStyle = this.commitStyles[style] || this.commitStyles.conventional;
            const message = await this.callAIProvider(aiProvider, apiKey, diff, commitStyle);

            return message;
        } catch (error) {
            console.error('Error generating commit message:', error);
            throw error;
        }
    }

    private async callAIProvider(provider: string, apiKey: string, diff: string, style: CommitStyle): Promise<string> {
        const systemPrompt = `You are a Git assistant. Based on the following Git diff, generate a concise, professional, and meaningful commit message. ${style.prompt}`;
        
        const userMessage = `Here are the staged changes:\n\n${diff}\n\nGenerate a commit message in the ${style.name} style.`;

        switch (provider) {
            case 'openai':
                return await this.callOpenAI(apiKey, systemPrompt, userMessage);
            case 'mistral':
                return await this.callMistral(apiKey, systemPrompt, userMessage);
            case 'claude':
                return await this.callClaude(apiKey, systemPrompt, userMessage);
            default:
                throw new Error(`Unsupported AI provider: ${provider}`);
        }
    }

    private async callOpenAI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content.trim();
        } catch (error: any) {
            throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    private async callMistral(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
        try {
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: 'mistral-tiny',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content.trim();
        } catch (error: any) {
            throw new Error(`Mistral API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    private async callClaude(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
        try {
            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 150,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: userMessage }
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

            return response.data.content[0].text.trim();
        } catch (error: any) {
            throw new Error(`Claude API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    getAvailableStyles(): string[] {
        return Object.keys(this.commitStyles);
    }

    getStyleDescription(style: string): string {
        const commitStyle = this.commitStyles[style];
        return commitStyle ? commitStyle.prompt : 'Unknown style';
    }
}
