// Test file for Akyyra Commit Muse
export function greetUser(name: string): string {
    return `Hello, ${name}! Welcome to Akyyra Commit Muse!`;
}

export function generateRandomCommit(): string {
    const verbs = ['Add', 'Fix', 'Update', 'Remove', 'Refactor'];
    const nouns = ['feature', 'bug', 'component', 'logic', 'styling'];
    
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${verb} ${noun}`;
}
